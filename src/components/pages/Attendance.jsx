import React, { useState, useEffect } from "react";
import AttendanceGrid from "@/components/organisms/AttendanceGrid";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { toast } from "react-toastify";

// Import services
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import attendanceService from "@/services/api/attendanceService";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        attendanceService.getAll()
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
      setAttendance(attendanceData);
    } catch (err) {
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAttendance = async (attendanceRecords) => {
    try {
      setAttendanceLoading(true);
      
      for (const record of attendanceRecords) {
        if (record.Id) {
          await attendanceService.update(record.Id, record);
        } else {
          await attendanceService.create(record);
        }
      }
      
      toast.success("Attendance saved successfully");
      loadData();
    } catch (err) {
      toast.error("Failed to save attendance");
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) return <Loading type="form" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">Attendance</h1>
        <p className="text-gray-600 mt-1">Track daily student attendance</p>
      </div>

      <AttendanceGrid
        students={students}
        attendance={attendance}
        classes={classes}
        onSubmit={handleSaveAttendance}
        loading={attendanceLoading}
      />
    </div>
  );
};

export default Attendance;