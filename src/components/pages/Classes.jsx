import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Students from "@/components/pages/Students";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";

// Import services

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
const [formData, setFormData] = useState({
    name: "",
    subject: "",
    room: "",
    schedule: "",
});
  const [formErrors, setFormErrors] = useState({});
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(),
        studentService.getAll()
      ]);
      
      // Enhance classes with student count
      const enhancedClasses = classesData.map(cls => {
        const enrolledStudents = studentsData.filter(s => s.classId === cls.Id);
        return {
          ...cls,
          studentCount: enrolledStudents.length,
          students: enrolledStudents
        };
      });
      
      setClasses(enhancedClasses);
      setStudents(studentsData);
    } catch (err) {
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      room: "",
      schedule: "",
});
    setFormErrors({});
  };

  const handleAddClass = () => {
    resetForm();
    setEditingClass(null);
    setShowForm(true);
  };

const handleEditClass = (cls) => {
    setFormData({
      name: cls.name || "",
      subject: cls.subject || "",
      room: cls.room || "",
      schedule: cls.schedule || "",
});
    setFormErrors({});
    setEditingClass(cls);
    setShowForm(true);
  };

  const handleDeleteClass = async (classId) => {
    const studentsInClass = students.filter(s => s.classId === classId);
    
    if (studentsInClass.length > 0) {
      toast.error("Cannot delete class with enrolled students. Please transfer students first.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await classService.delete(classId);
        toast.success("Class deleted successfully");
        loadData();
      } catch (err) {
        toast.error("Failed to delete class");
      }
    }
  };

const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.room.trim()) {
      newErrors.room = "Room is required";
    }
    
    if (!formData.schedule.trim()) {
      newErrors.schedule = "Schedule is required";
    }


    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmitClass = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setFormLoading(true);
      
const classData = {
        name: formData.name,
        subject: formData.subject,
        room: formData.room,
        schedule: formData.schedule,
        teacherId: "teacher1", // In a real app, this would come from auth
        students: []
      };
      
      if (editingClass) {
        await classService.update(editingClass.Id, classData);
        toast.success("Class updated successfully");
      } else {
        await classService.create(classData);
        toast.success("Class added successfully");
      }
      
      setShowForm(false);
      setEditingClass(null);
      resetForm();
      loadData();
    } catch (err) {
      toast.error(editingClass ? "Failed to update class" : "Failed to add class");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingClass(null);
    resetForm();
  };

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    if (searchTerm === "") return true;
    return cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cls.room.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (showForm) {
    return (
      <div className="p-6">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              {editingClass ? "Edit Class" : "Add New Class"}
            </h2>
            <p className="text-gray-600 mt-1">
              {editingClass ? "Update class information" : "Enter class details to add it to the system"}
            </p>
          </div>

          <form onSubmit={handleSubmitClass} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Class Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={formErrors.name}
                placeholder="e.g., Algebra I"
              />
              
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                error={formErrors.subject}
                placeholder="e.g., Mathematics"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Room"
                name="room"
                value={formData.room}
                onChange={handleFormChange}
                error={formErrors.room}
                placeholder="e.g., Room 201"
              />
              
              <Input
                label="Schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleFormChange}
                error={formErrors.schedule}
                placeholder="e.g., MWF 9:00-10:00 AM"
              />
</div>

<div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={formLoading}
              >
                {editingClass ? "Update Class" : "Add Class"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Classes</h1>
          <p className="text-gray-600 mt-1">Manage class schedules and enrollment</p>
        </div>
        <Button onClick={handleAddClass} leftIcon="Plus">
          Add Class
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search classes by name, subject, or room..."
      />

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Empty
          title="No classes found"
          description="No classes match your search, or you haven't created any classes yet."
          actionText="Add First Class"
          onAction={handleAddClass}
          icon="BookOpen"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.Id} className="p-6 hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mr-4">
                    <ApperIcon name="BookOpen" className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{cls.subject}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClass(cls)}
                    leftIcon="Edit"
                  >
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(cls.Id)}
                    leftIcon="Trash2"
                    className="text-red-600 hover:text-red-700"
                  >
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
                  {cls.room}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="Clock" className="w-4 h-4 mr-2" />
                  {cls.schedule}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Users" className="w-4 h-4 mr-2" />
                    {cls.studentCount} students
                  </div>
                  
                  <Badge variant={cls.studentCount > 0 ? "success" : "default"}>
                    {cls.studentCount > 0 ? "Active" : "Empty"}
                  </Badge>
                </div>
              </div>

              {cls.studentCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recent Students:</span>
                    <Button variant="ghost" size="sm" rightIcon="ArrowRight">
                      View All
                    </Button>
                  </div>
                  <div className="flex -space-x-1 mt-2">
                    {cls.students.slice(0, 3).map((student, index) => (
                      <div
                        key={student.Id}
                        className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full flex items-center justify-center border-2 border-white"
                        title={`${student.firstName} ${student.lastName}`}
                      >
                        <span className="text-xs font-medium text-secondary-600">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                    ))}
                    {cls.studentCount > 3 && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-xs font-medium text-gray-600">
                          +{cls.studentCount - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;