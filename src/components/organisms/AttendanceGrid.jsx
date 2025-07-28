import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const AttendanceGrid = ({ students, attendance, classes, onSubmit, loading = false }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState({});

  const classStudents = students.filter(student => 
    !selectedClass || student.classId === parseInt(selectedClass)
  );

  useEffect(() => {
    const data = {};
    classStudents.forEach(student => {
      const existingRecord = attendance.find(record => 
        record.studentId === student.Id && 
        record.date.split("T")[0] === selectedDate
      );
      data[student.Id] = {
        status: existingRecord ? existingRecord.status : "present",
        notes: existingRecord ? existingRecord.notes : "",
        recordId: existingRecord ? existingRecord.Id : null
      };
    });
    setAttendanceData(data);
  }, [classStudents, attendance, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes: notes
      }
    }));
  };

  const handleBulkUpdate = (status) => {
    const updated = {};
    classStudents.forEach(student => {
      updated[student.Id] = {
        ...attendanceData[student.Id],
        status: status
      };
    });
    setAttendanceData(updated);
  };

  const handleSaveAttendance = () => {
    const attendanceRecords = Object.entries(attendanceData).map(([studentId, data]) => ({
      Id: data.recordId,
      studentId: parseInt(studentId),
      date: new Date(selectedDate).toISOString(),
      status: data.status,
      notes: data.notes
    }));

    onSubmit(attendanceRecords);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "present": return "success";
      case "absent": return "error";
      case "tardy": return "warning";
      case "excused": return "info";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present": return "CheckCircle";
      case "absent": return "XCircle";
      case "tardy": return "Clock";
      case "excused": return "Shield";
      default: return "Circle";
    }
  };

  const statusCounts = classStudents.reduce((counts, student) => {
    const status = attendanceData[student.Id]?.status || "present";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 font-display mb-2">
            Attendance Tracking
          </h2>
          <p className="text-gray-600">
            Select a class and date to mark attendance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Select
            label="Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.Id} value={cls.Id}>
                {cls.name} - {cls.subject}
              </option>
            ))}
          </Select>

          <Input
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {classStudents.length > 0 && (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkUpdate("present")}
                  leftIcon="CheckCircle"
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkUpdate("absent")}
                  leftIcon="XCircle"
                >
                  Mark All Absent
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center">
                  <ApperIcon name="CheckCircle" className="w-6 h-6 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-700">{statusCounts.present || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
                <div className="flex items-center">
                  <ApperIcon name="XCircle" className="w-6 h-6 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm text-red-600">Absent</p>
                    <p className="text-2xl font-bold text-red-700">{statusCounts.absent || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="flex items-center">
                  <ApperIcon name="Clock" className="w-6 h-6 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm text-yellow-600">Tardy</p>
                    <p className="text-2xl font-bold text-yellow-700">{statusCounts.tardy || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center">
                  <ApperIcon name="Shield" className="w-6 h-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-blue-600">Excused</p>
                    <p className="text-2xl font-bold text-blue-700">{statusCounts.excused || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {classStudents.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Attendance for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <Button onClick={handleSaveAttendance} loading={loading}>
                Save Attendance
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quick Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classStudents.map((student) => {
                  const data = attendanceData[student.Id] || { status: "present", notes: "" };

                  return (
                    <tr key={student.Id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mr-4">
                            <span className="text-primary-600 font-medium">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(data.status)}>
                          <ApperIcon name={getStatusIcon(data.status)} className="w-3 h-3 mr-1" />
                          {data.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleStatusChange(student.Id, "present")}
                            className={`p-1 rounded-full transition-colors ${
                              data.status === "present" 
                                ? "bg-green-100 text-green-600" 
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            }`}
                            title="Present"
                          >
                            <ApperIcon name="CheckCircle" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.Id, "absent")}
                            className={`p-1 rounded-full transition-colors ${
                              data.status === "absent" 
                                ? "bg-red-100 text-red-600" 
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            }`}
                            title="Absent"
                          >
                            <ApperIcon name="XCircle" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.Id, "tardy")}
                            className={`p-1 rounded-full transition-colors ${
                              data.status === "tardy" 
                                ? "bg-yellow-100 text-yellow-600" 
                                : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                            }`}
                            title="Tardy"
                          >
                            <ApperIcon name="Clock" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.Id, "excused")}
                            className={`p-1 rounded-full transition-colors ${
                              data.status === "excused" 
                                ? "bg-blue-100 text-blue-600" 
                                : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                            title="Excused"
                          >
                            <ApperIcon name="Shield" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="text"
                          value={data.notes}
                          onChange={(e) => handleNotesChange(student.Id, e.target.value)}
                          placeholder="Add notes..."
                          className="w-full text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceGrid;