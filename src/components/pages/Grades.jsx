import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import GradeEntry from "@/components/organisms/GradeEntry";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

// Import services
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import gradeService from "@/services/api/gradeService";
import assignmentService from "@/services/api/assignmentService";

const Grades = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradeLoading, setGradeLoading] = useState(false);
  
  // UI State
  const [selectedClass, setSelectedClass] = useState("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    name: "",
    type: "homework",
    dueDate: "",
    points: ""
  });
  const [assignmentErrors, setAssignmentErrors] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData, gradesData, assignmentsData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        assignmentService.getAll()
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
      setGrades(gradesData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError("Failed to load grade data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveGrades = async (gradesToSave) => {
    try {
      setGradeLoading(true);
      
      for (const grade of gradesToSave) {
        if (grade.Id) {
          await gradeService.update(grade.Id, grade);
        } else {
          await gradeService.create(grade);
        }
      }
      
      toast.success("Grades saved successfully");
      loadData();
    } catch (err) {
      toast.error("Failed to save grades");
    } finally {
      setGradeLoading(false);
    }
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      name: "",
      type: "homework",
      dueDate: "",
      points: ""
    });
    setAssignmentErrors({});
  };

  const handleAddAssignment = () => {
    resetAssignmentForm();
    setShowAssignmentForm(true);
  };

  const handleAssignmentFormChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (assignmentErrors[name]) {
      setAssignmentErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateAssignmentForm = () => {
    const newErrors = {};
    
    if (!assignmentForm.name.trim()) {
      newErrors.name = "Assignment name is required";
    }
    
    if (!assignmentForm.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (!assignmentForm.points || isNaN(assignmentForm.points) || parseFloat(assignmentForm.points) <= 0) {
      newErrors.points = "Points must be a positive number";
    }

    setAssignmentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!validateAssignmentForm() || !selectedClass) return;
    
    try {
      setFormLoading(true);
      
      const assignmentData = {
        ...assignmentForm,
        classId: parseInt(selectedClass),
        points: parseFloat(assignmentForm.points),
        dueDate: new Date(assignmentForm.dueDate).toISOString()
      };
      
      await assignmentService.create(assignmentData);
      toast.success("Assignment created successfully");
      setShowAssignmentForm(false);
      resetAssignmentForm();
      loadData();
    } catch (err) {
      toast.error("Failed to create assignment");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredStudents = selectedClass 
    ? students.filter(s => s.classId === parseInt(selectedClass))
    : students;

  const filteredAssignments = selectedClass
    ? assignments.filter(a => a.classId === parseInt(selectedClass))
    : assignments;

  if (loading) return <Loading type="form" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Grades</h1>
          <p className="text-gray-600 mt-1">Manage assignments and student grades</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleAddAssignment} leftIcon="Plus" disabled={!selectedClass}>
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Class Selection */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Select
              label="Select Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.Id} value={cls.Id}>
                  {cls.name} - {cls.subject}
                </option>
              ))}
            </Select>
          </div>
          
          {selectedClass && (
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {filteredStudents.length} students • {filteredAssignments.length} assignments
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 font-display">
                Create Assignment
              </h2>
              <p className="text-gray-600 mt-1">
                Add a new assignment for the selected class
              </p>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <Input
                label="Assignment Name"
                name="name"
                value={assignmentForm.name}
                onChange={handleAssignmentFormChange}
                error={assignmentErrors.name}
                placeholder="e.g., Math Quiz 1"
              />

              <Select
                label="Type"
                name="type"
                value={assignmentForm.type}
                onChange={handleAssignmentFormChange}
              >
                <option value="homework">Homework</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
              </Select>

              <Input
                label="Due Date"
                name="dueDate"
                type="date"
                value={assignmentForm.dueDate}
                onChange={handleAssignmentFormChange}
                error={assignmentErrors.dueDate}
              />

              <Input
                label="Total Points"
                name="points"
                type="number"
                min="1"
                step="0.5"
                value={assignmentForm.points}
                onChange={handleAssignmentFormChange}
                error={assignmentErrors.points}
                placeholder="100"
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAssignmentForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={formLoading}
                >
                  Create Assignment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Grade Entry */}
      {!selectedClass ? (
        <Empty
          title="Select a class to get started"
          description="Choose a class from the dropdown above to view students and enter grades."
          icon="BookOpen"
        />
      ) : filteredStudents.length === 0 ? (
        <Empty
          title="No students in this class"
          description="This class doesn't have any enrolled students yet."
          icon="Users"
        />
      ) : filteredAssignments.length === 0 ? (
        <Empty
          title="No assignments created"
          description="Create your first assignment to start entering grades."
          actionText="Add Assignment"
          onAction={handleAddAssignment}
          icon="FileText"
        />
      ) : (
        <GradeEntry
          students={filteredStudents}
          assignments={filteredAssignments}
          grades={grades}
          onSubmit={handleSaveGrades}
          loading={gradeLoading}
        />
      )}
    </div>
  );
};

export default Grades;