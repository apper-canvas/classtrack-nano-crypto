import React, { useCallback, useEffect, useMemo, useState } from 'react'
import attendanceService from '@/services/api/attendanceService'
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Classes from "@/components/pages/Classes";
import Attendance from "@/components/pages/Attendance";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";

const AttendanceGrid = ({ students = [], attendance = [], classes = [], onUpdate }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Memoize filtered students to prevent unnecessary recalculations
  const classStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    return students.filter(student => 
      !selectedClass || student.classId === parseInt(selectedClass)
    );
  }, [students, selectedClass]);

  // Memoize attendance data processing
  const processedAttendance = useMemo(() => {
    if (!attendance || !Array.isArray(attendance)) return {};
    
    const records = {};
    attendance.forEach(record => {
      if (record.date === selectedDate) {
        records[record.studentId] = {
          status: record.status,
          notes: record.notes || ''
        };
      }
    });
    return records;
  }, [attendance, selectedDate]);

  // Initialize attendance records when processed data changes
  useEffect(() => {
    setAttendanceRecords(processedAttendance);
  }, [processedAttendance]);

  // Memoized event handlers to prevent dependency changes
  const handleStatusChange = useCallback((studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        notes: prev[studentId]?.notes || ''
      }
    }));
  }, []);

  const handleNotesChange = useCallback((studentId, notes) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: prev[studentId]?.status || 'present',
        notes
      }
    }));
  }, []);

  const handleBulkUpdate = useCallback((status) => {
    const bulkRecords = {};
    classStudents.forEach(student => {
      bulkRecords[student.id] = {
        status,
        notes: attendanceRecords[student.id]?.notes || ''
      };
    });
    setAttendanceRecords(prev => ({ ...prev, ...bulkRecords }));
  }, [classStudents, attendanceRecords]);

  const handleSaveAttendance = useCallback(async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const attendanceData = Object.entries(attendanceRecords).map(([studentId, record]) => ({
        studentId: parseInt(studentId),
        date: selectedDate,
        status: record.status,
        notes: record.notes,
        classId: selectedClass ? parseInt(selectedClass) : null
      }));

      // Save attendance records
      for (const record of attendanceData) {
        await attendanceService.create(record);
      }

      // Notify parent component of update
      if (onUpdate && typeof onUpdate === 'function') {
        onUpdate(attendanceData);
      }

    } catch (err) {
      setError(err.message || 'Failed to save attendance');
      console.error('Attendance save error:', err);
    } finally {
      setSaving(false);
    }
  }, [attendanceRecords, selectedDate, selectedClass, saving, onUpdate]);

  // Memoized helper functions
  const getStatusBadgeVariant = useCallback((status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'present': return 'check';
      case 'absent': return 'x';
      case 'late': return 'clock';
      case 'excused': return 'user-check';
      default: return 'user';
    }
  }, []);

  // Memoize status counts for performance
  const statusCounts = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    Object.values(attendanceRecords).forEach(record => {
      if (record && counts.hasOwnProperty(record.status)) {
        counts[record.status]++;
      }
    });
    return counts;
  }, [attendanceRecords]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading attendance...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2">
            <ApperIcon name="alert-circle" className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'All Classes' },
                ...classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))
              ]}
            />
          </div>
          
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleBulkUpdate('present')}
              disabled={saving}
            >
              Mark All Present
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkUpdate('absent')}
              disabled={saving}
            >
              Mark All Absent
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="success">Present: {statusCounts.present}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="error">Absent: {statusCounts.absent}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">Late: {statusCounts.late}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">Excused: {statusCounts.excused}</Badge>
          </div>
        </div>
      </Card>

      {/* Attendance Grid */}
      <Card className="p-6">
        <div className="space-y-4">
          {classStudents.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No students found for the selected class.</p>
            </div>
          ) : (
            classStudents.map(student => {
              const record = attendanceRecords[student.id] || { status: 'present', notes: '' };
              
              return (
                <div key={student.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Select
                      value={record.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      options={[
                        { value: 'present', label: 'Present' },
                        { value: 'absent', label: 'Absent' },
                        { value: 'late', label: 'Late' },
                        { value: 'excused', label: 'Excused' }
                      ]}
                      className="w-32"
                    />

                    <Badge 
                      variant={getStatusBadgeVariant(record.status)}
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name={getStatusIcon(record.status)} className="w-3 h-3" />
                      {record.status}
                    </Badge>

                    <Input
                      placeholder="Notes..."
                      value={record.notes}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      className="w-48"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {classStudents.length > 0 && (
          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="save" className="w-4 h-4" />
                  Save Attendance
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceGrid;