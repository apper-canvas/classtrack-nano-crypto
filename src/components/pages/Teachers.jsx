import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import SearchBar from '@/components/molecules/SearchBar';
import FilterBar from '@/components/molecules/FilterBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import teacherService from '@/services/api/teacherService';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Email_c: '',
    Subject_c: '',
    Tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Load teachers on component mount and when filters change
  useEffect(() => {
    loadTeachers();
  }, [searchTerm, subjectFilter]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (subjectFilter) params.subject = subjectFilter;
      
      const data = await teacherService.getAll(params);
      setTeachers(data || []);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to load teachers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSubjectFilterChange = (subject) => {
    setSubjectFilter(subject);
  };

  const handleAddTeacher = () => {
    setFormData({
      Name: '',
      Email_c: '',
      Subject_c: '',
      Tags: ''
    });
    setEditingTeacher(null);
    setShowAddForm(true);
  };

  const handleEditTeacher = (teacher) => {
    setFormData({
      Name: teacher.Name || '',
      Email_c: teacher.Email_c || '',
      Subject_c: teacher.Subject_c || '',
      Tags: teacher.Tags || ''
    });
    setEditingTeacher(teacher);
    setShowAddForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.Name.trim() || !formData.Email_c.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingTeacher) {
        await teacherService.update(editingTeacher.Id, formData);
        toast.success('Teacher updated successfully');
      } else {
        await teacherService.create(formData);
        toast.success('Teacher created successfully');
      }
      
      setShowAddForm(false);
      setEditingTeacher(null);
      loadTeachers();
    } catch (err) {
      toast.error(`Failed to ${editingTeacher ? 'update' : 'create'} teacher: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    if (!confirm(`Are you sure you want to delete teacher "${teacher.Name}"?`)) {
      return;
    }

    try {
      await teacherService.delete(teacher.Id);
      toast.success('Teacher deleted successfully');
      loadTeachers();
    } catch (err) {
      toast.error(`Failed to delete teacher: ${err.message}`);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUniqueSubjects = () => {
    const subjects = teachers
      .map(teacher => teacher.Subject_c)
      .filter(subject => subject && subject.trim())
      .filter((subject, index, arr) => arr.indexOf(subject) === index);
    return subjects.sort();
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTeachers} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600">Manage school teachers and their information</p>
        </div>
        <Button onClick={handleAddTeacher} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Teacher
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search teachers by name..."
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={subjectFilter}
            onChange={(e) => handleSubjectFilterChange(e.target.value)}
            className="w-full"
          >
            <option value="">All Subjects</option>
            {getUniqueSubjects().map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <ApperIcon name="X" size={16} />
            </Button>
          </div>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.Name}
                  onChange={(e) => handleFormChange('Name', e.target.value)}
                  placeholder="Enter teacher name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.Email_c}
                  onChange={(e) => handleFormChange('Email_c', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  value={formData.Subject_c}
                  onChange={(e) => handleFormChange('Subject_c', e.target.value)}
                  placeholder="Enter subject taught"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Input
                  value={formData.Tags}
                  onChange={(e) => handleFormChange('Tags', e.target.value)}
                  placeholder="Enter tags (comma separated)"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                    {editingTeacher ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingTeacher ? 'Update Teacher' : 'Create Teacher'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Teachers Table */}
      {teachers.length === 0 ? (
        <Empty
          icon="Users"
          title="No teachers found"
          description="Start by adding your first teacher to the system."
          actionLabel="Add Teacher"
          onAction={handleAddTeacher}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tags</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.Id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{teacher.Name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-600">{teacher.Email_c || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {teacher.Subject_c ? (
                        <Badge variant="secondary">{teacher.Subject_c}</Badge>
                      ) : (
                        <span className="text-gray-400">No subject</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {teacher.Tags ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.Tags.split(',').map((tag, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No tags</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Teachers;