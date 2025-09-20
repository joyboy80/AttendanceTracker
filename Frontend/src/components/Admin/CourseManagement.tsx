import React, { useState, useEffect } from 'react';

interface Course {
  id: number;
  code: string;
  title: string;
  credit: number;
  description: string;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add');

  // Add Course Form State
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    credit: '',
    description: ''
  });

  // Assign Course Form State
  const [assignForm, setAssignForm] = useState({
    courseId: '',
    usernames: '',
    role: 'STUDENT'
  });

  // Batch Assignment Form State
  const [batchAssignForm, setBatchAssignForm] = useState({
    courseId: '',
    batch: ''
  });

  // Messages
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch('http://localhost:8080/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setMessage('Failed to fetch courses');
        setMessageType('error');
      }
    } catch (error: unknown) {
      setMessage('Error fetching courses: ' + (error as Error).message);
      setMessageType('error');
    }
  };

  const handleCourseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBatchAssignFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBatchAssignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch('http://localhost:8080/api/admin/course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...courseForm,
          credit: parseInt(courseForm.credit)
        })
      });

      if (response.ok) {
        const newCourse = await response.json();
        setCourses(prev => [...prev, newCourse]);
        setCourseForm({ code: '', title: '', credit: '', description: '' });
        setMessage('Course created successfully!');
        setMessageType('success');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to create course');
        setMessageType('error');
      }
    } catch (error: unknown) {
      setMessage('Error creating course: ' + (error as Error).message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('attendanceToken');
      const usernames = assignForm.usernames.split(',').map(u => u.trim()).filter(u => u);
      
      const response = await fetch(`http://localhost:8080/api/admin/course/${assignForm.courseId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usernames: usernames,
          role: assignForm.role
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Assignment completed: ${result.totalAssigned} successful assignments`);
        setMessageType('success');
        setAssignForm({ courseId: '', usernames: '', role: 'STUDENT' });
        
        if (result.failedAssignments && result.failedAssignments.length > 0) {
          setMessage(prev => prev + `. Failed: ${result.failedAssignments.join(', ')}`);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to assign course');
        setMessageType('error');
      }
    } catch (error: unknown) {
      setMessage('Error assigning course: ' + (error as Error).message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!batchAssignForm.courseId || !batchAssignForm.batch.trim()) {
      setMessage('Please select a course and enter batch');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/admin/course/${batchAssignForm.courseId}/assign/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batch: batchAssignForm.batch
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || 'Course assigned to batch successfully');
        setMessageType('success');
        setBatchAssignForm({ courseId: '', batch: '' });
        
        if (result.failedAssignments && result.failedAssignments.length > 0) {
          setMessage(prev => prev + `. Failed: ${result.failedAssignments.join(', ')}`);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to assign course to batch');
        setMessageType('error');
      }
    } catch (error: unknown) {
      setMessage('Error assigning course to batch: ' + (error as Error).message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-book me-2"></i>Course Management</h4>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item ">
          <button 
            className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <i className="fas fa-plus me-2"></i><span className="text-primary fw-bold">Add Course</span>
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'assign' ? 'active' : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            <i className="fas fa-user-plus me-2"></i><span className="text-primary fw-bold">Assign Course</span>
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            <i className="fas fa-users me-2"></i><span className="text-primary fw-bold">Batch Assignment</span>
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <i className="fas fa-list me-2"></i><span className="text-primary fw-bold">All Courses</span>
          </button>
        </li>
      </ul>

      {/* Add Course Tab */}
      {activeTab === 'add' && (
        <div className="card">
          <div className="card-header">
            <h5><i className="fas fa-plus me-2"></i>Create New Course</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddCourse}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Course Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="code"
                    value={courseForm.code}
                    onChange={handleCourseFormChange}
                    required
                    placeholder="e.g., CS301"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Credit Hours *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="credit"
                    value={courseForm.credit}
                    onChange={handleCourseFormChange}
                    required
                    min="1"
                    max="6"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={courseForm.title}
                  onChange={handleCourseFormChange}
                  required
                  placeholder="e.g., Database Systems"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={courseForm.description}
                  onChange={handleCourseFormChange}
                  rows={3}
                  placeholder="Course description..."
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Create Course
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Course Tab */}
      {activeTab === 'assign' && (
        <div className="card">
          <div className="card-header">
            <h5><i className="fas fa-user-plus me-2"></i>Assign Course to Users</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleAssignCourse}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Select Course *</label>
                  <select
                    className="form-select"
                    name="courseId"
                    value={assignForm.courseId}
                    onChange={handleAssignFormChange}
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    name="role"
                    value={assignForm.role}
                    onChange={handleAssignFormChange}
                    required
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Usernames *</label>
                <textarea
                  className="form-control"
                  name="usernames"
                  value={assignForm.usernames}
                  onChange={handleAssignFormChange}
                  required
                  rows={3}
                  placeholder="Enter usernames separated by commas (e.g., john.doe, jane.smith, mike.wilson)"
                />
                <div className="form-text">Enter multiple usernames separated by commas</div>
              </div>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Assigning...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus me-2"></i>Assign Course
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Batch Assignment Tab */}
      {activeTab === 'batch' && (
        <div className="card">
          <div className="card-header">
            <h5><i className="fas fa-users me-2"></i>Batch Assignment</h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              This will assign the course to all students in the specified batch.
            </div>
            <form onSubmit={handleBatchAssignCourse}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Select Course *</label>
                  <select
                    className="form-select"
                    name="courseId"
                    value={batchAssignForm.courseId}
                    onChange={handleBatchAssignFormChange}
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Batch *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="batch"
                    value={batchAssignForm.batch}
                    onChange={handleBatchAssignFormChange}
                    required
                    placeholder="e.g., 2024, CSE-2023, Batch-A"
                  />
                  <div className="form-text">Enter the batch identifier (e.g., year or batch code)</div>
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-warning"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Assigning to Batch...
                  </>
                ) : (
                  <>
                    <i className="fas fa-users me-2"></i>Assign to Batch
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* All Courses Tab */}
      {activeTab === 'list' && (
        <div className="card">
          <div className="card-header">
            <h5><i className="fas fa-list me-2"></i>All Courses</h5>
          </div>
          <div className="card-body">
            {courses.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-book fa-3x text-muted mb-3"></i>
                <p className="text-muted">No courses available</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Credits</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td><span className="badge bg-primary">{course.code}</span></td>
                        <td>{course.title}</td>
                        <td>{course.credit}</td>
                        <td>{course.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;