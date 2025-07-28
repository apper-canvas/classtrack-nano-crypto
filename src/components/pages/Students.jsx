import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import FilterBar from "@/components/molecules/FilterBar";
import StudentTable from "@/components/organisms/StudentTable";
import StudentForm from "@/components/organisms/StudentForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

// Import services
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import gradeService from "@/services/api/gradeService";
import attendanceService from "@/services/api/attendanceService";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      
      // Enhance students with additional data
      const enhancedStudents = studentsData.map(student => {
        const studentClass = classesData.find(c => c.Id === student.classId);
        const studentGrades = gradesData.filter(g => g.studentId === student.Id);
        const studentAttendance = attendanceData.filter(a => a.studentId === student.Id);
        
        const gradeAverage = studentGrades.length > 0
          ? studentGrades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0) / studentGrades.length
          : 0;
          
        const totalAttendance = studentAttendance.length;
        const presentCount = studentAttendance.filter(a => a.status === "present").length;
        const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 100;
        
        return {
          ...student,
          className: studentClass ? studentClass.name : null,
          gradeAverage: Math.round(gradeAverage),
          attendanceRate: Math.round(attendanceRate)
        };
      });
      
      setStudents(enhancedStudents);
      setClasses(classesData);
    } catch (err) {
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentService.delete(studentId);
        toast.success("Student deleted successfully");
        loadData();
      } catch (err) {
        toast.error("Failed to delete student");
      }
    }
  };

  const handleViewStudent = (student) => {
    // In a real app, this would navigate to student detail page
    toast.info(`Viewing details for ${student.firstName} ${student.lastName}`);
  };

  const handleSubmitStudent = async (studentData) => {
    try {
      setFormLoading(true);
      
      if (editingStudent) {
        await studentService.update(editingStudent.Id, studentData);
        toast.success("Student updated successfully");
      } else {
        await studentService.create(studentData);
        toast.success("Student added successfully");
      }
      
      setShowForm(false);
      setEditingStudent(null);
      loadData();
    } catch (err) {
      toast.error(editingStudent ? "Failed to update student" : "Failed to add student");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setClassFilter("");
    setStatusFilter("");
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === "" || 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === "" || student.classId === parseInt(classFilter);
    const matchesStatus = statusFilter === "" || student.status === statusFilter;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (showForm) {
    return (
      <div className="p-6">
        <StudentForm
          student={editingStudent}
          classes={classes}
          onSubmit={handleSubmitStudent}
          onCancel={handleCancelForm}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Students</h1>
          <p className="text-gray-600 mt-1">Manage student information and records</p>
        </div>
        <Button onClick={handleAddStudent} leftIcon="UserPlus">
          Add Student
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search students by name or email..."
        />
        
        <FilterBar
          classFilter={classFilter}
          onClassFilterChange={setClassFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onClear={clearFilters}
          classes={classes}
        />
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <Empty
          title="No students found"
          description="No students match your current filters, or you haven't added any students yet."
          actionText="Add First Student"
          onAction={handleAddStudent}
          icon="Users"
        />
      ) : (
        <StudentTable
          students={filteredStudents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
        />
      )}
    </div>
  );
};

export default Students;