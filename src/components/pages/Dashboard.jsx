import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

// Import services
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import gradeService from "@/services/api/gradeService";
import attendanceService from "@/services/api/attendanceService";

const Dashboard = () => {
  const [data, setData] = useState({
    students: [],
    classes: [],
    grades: [],
    attendance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      
      setData({
        students: studentsData,
        classes: classesData,
        grades: gradesData,
        attendance: attendanceData
      });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading type="stats" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  // Calculate statistics
  const totalStudents = data.students.length;
  const activeStudents = data.students.filter(s => s.status === "active").length;
  const totalClasses = data.classes.length;
  
  const averageGrade = data.grades.length > 0 
    ? data.grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0) / data.grades.length
    : 0;

  const todayDate = new Date().toISOString().split("T")[0];
  const todayAttendance = data.attendance.filter(a => a.date.split("T")[0] === todayDate);
  const attendanceRate = todayAttendance.length > 0
    ? (todayAttendance.filter(a => a.status === "present").length / todayAttendance.length) * 100
    : 0;

  // Recent activity
  const recentGrades = data.grades
    .sort((a, b) => new Date(b.dateRecorded) - new Date(a.dateRecorded))
    .slice(0, 5)
    .map(grade => {
      const student = data.students.find(s => s.Id === grade.studentId);
      return { ...grade, studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown" };
    });

  const lowPerformingStudents = data.students
    .filter(student => {
      const studentGrades = data.grades.filter(g => g.studentId === student.Id);
      if (studentGrades.length === 0) return false;
      const avg = studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / studentGrades.length;
      return avg < 70;
    })
    .slice(0, 5);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening in your classes today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon="Users"
          color="primary"
          trend="up"
          trendValue="+5 this month"
        />
        <StatCard
          title="Active Students"
          value={activeStudents}
          icon="UserCheck"
          color="secondary"
        />
        <StatCard
          title="Total Classes"
          value={totalClasses}
          icon="BookOpen"
          color="info"
        />
        <StatCard
          title="Average Grade"
          value={`${averageGrade.toFixed(1)}%`}
          icon="Award"
          color={averageGrade >= 80 ? "success" : averageGrade >= 70 ? "warning" : "error"}
          trend={averageGrade >= 75 ? "up" : "down"}
          trendValue={`${averageGrade >= 75 ? "+" : "-"}${Math.abs(averageGrade - 75).toFixed(1)}% from target`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Grades */}
        <div className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 font-display">
                Recent Grades
              </h2>
              <Button variant="outline" size="sm" rightIcon="ArrowRight">
                View All
              </Button>
            </div>

            {recentGrades.length === 0 ? (
              <Empty
                title="No grades recorded yet"
                description="Start grading assignments to see recent activity here."
                icon="FileText"
              />
            ) : (
              <div className="space-y-4">
                {recentGrades.map((grade) => (
                  <div key={grade.Id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                        <ApperIcon name="FileText" className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{grade.studentName}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(grade.dateRecorded), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        (grade.score / grade.maxScore * 100) >= 90 ? "success" :
                        (grade.score / grade.maxScore * 100) >= 80 ? "info" :
                        (grade.score / grade.maxScore * 100) >= 70 ? "warning" : "error"
                      }>
                        {grade.score}/{grade.maxScore}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {((grade.score / grade.maxScore) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Today's Attendance & Quick Actions */}
        <div className="space-y-6">
          {/* Today's Attendance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Today&apos;s Attendance
              </h3>
              <ApperIcon name="Calendar" className="w-5 h-5 text-gray-500" />
            </div>

            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                attendanceRate >= 95 ? "text-green-600" : 
                attendanceRate >= 90 ? "text-blue-600" : 
                attendanceRate >= 80 ? "text-yellow-600" : "text-red-600"
              }`}>
                {attendanceRate.toFixed(1)}%
              </div>
              <p className="text-gray-600 mb-4">
                {todayAttendance.filter(a => a.status === "present").length} of {todayAttendance.length} present
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Present</span>
                  <span>{todayAttendance.filter(a => a.status === "present").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Absent</span>
                  <span>{todayAttendance.filter(a => a.status === "absent").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Tardy</span>
                  <span>{todayAttendance.filter(a => a.status === "tardy").length}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button variant="primary" className="w-full" leftIcon="UserPlus">
                Add New Student
              </Button>
              <Button variant="outline" className="w-full" leftIcon="CheckSquare">
                Take Attendance
              </Button>
              <Button variant="outline" className="w-full" leftIcon="FileText">
                Enter Grades
              </Button>
              <Button variant="outline" className="w-full" leftIcon="BarChart3">
                View Reports
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Students Needing Attention */}
      {lowPerformingStudents.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              Students Needing Attention
            </h2>
            <Badge variant="warning">
              {lowPerformingStudents.length} students
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowPerformingStudents.map((student) => {
              const studentGrades = data.grades.filter(g => g.studentId === student.Id);
              const average = studentGrades.length > 0 
                ? studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / studentGrades.length
                : 0;

              return (
                <div key={student.Id} className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-medium">
                        {student.firstName[0]}{student.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-red-600">
                        Average: {average.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;