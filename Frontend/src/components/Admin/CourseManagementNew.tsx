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
      
      const endpoint = assignForm.role === 'TEACHER' 
        ? `http://localhost:8080/api/admin/course/${assignForm.courseId}/assign/teacher`
        : `http://localhost:8080/api/admin/course/${assignForm.courseId}/assign`;
      
      const response = await fetch(endpoint, {
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
        setMessage(result.message);
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
        <h2 className="mb-0">
          <i className="fas fa-book text-primary me-2"></i>
          Course Management
        </h2>
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
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <i className="fas fa-plus me-2"></i>Add Course
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'assign' ? 'active' : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            <i className="fas fa-user-plus me-2"></i>Assign Course
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            <i className="fas fa-users me-2"></i>Batch Assignment
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <i className="fas fa-list me-2"></i>Course List
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        
        {/* Add Course Tab */}
        {activeTab === 'add' && (
          <div className="tab-pane fade show active">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-plus me-2"></i>Add New Course
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddCourse}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="code" className="form-label">Course Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        value={courseForm.code}
                        onChange={handleCourseFormChange}
                        placeholder="e.g., CSE-101"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="credit" className="form-label">Credit Hours</label>
                      <input
                        type="number"
                        className="form-control"
                        id="credit"
                        name="credit"
                        value={courseForm.credit}
                        onChange={handleCourseFormChange}
                        placeholder="e.g., 3"
                        min="1"
                        max="10"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Course Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={courseForm.title}
                      onChange={handleCourseFormChange}
                      placeholder="e.g., Introduction to Programming"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
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
                        <i className="fas fa-plus me-2"></i>
                        Add Course
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Course Tab */}
        {activeTab === 'assign' && (
          <div className="tab-pane fade show active">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-user-plus me-2"></i>Assign Course to Users
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleAssignCourse}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="courseId" className="form-label">Select Course</label>
                      <select
                        className="form-select"
                        id="courseId"
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
                      <label htmlFor="role" className="form-label">Role</label>
                      <select
                        className="form-select"
                        id="role"
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
                    <label htmlFor="usernames" className="form-label">Usernames</label>
                    <textarea
                      className="form-control"
                      id="usernames"
                      name="usernames"
                      value={assignForm.usernames}
                      onChange={handleAssignFormChange}
                      rows={3}
                      placeholder="Enter usernames separated by commas (e.g., john.doe, jane.smith)"
                      required
                    />
                    <div className="form-text">
                      Enter multiple usernames separated by commas
                    </div>
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
                        <i className="fas fa-user-plus me-2"></i>
                        Assign Course
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Batch Assignment Tab */}
        {activeTab === 'batch' && (
          <div className="tab-pane fade show active">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-users me-2"></i>Batch Assignment
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleBatchAssignCourse}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="batchCourseId" className="form-label">Select Course</label>
                      <select
                        className="form-select"
                        id="batchCourseId"
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
                      <label htmlFor="batch" className="form-label">Batch</label>
                      <input
                        type="text"
                        className="form-control"
                        id="batch"
                        name="batch"
                        value={batchAssignForm.batch}
                        onChange={handleBatchAssignFormChange}
                        placeholder="e.g., 2025, 2024-A"
                        required
                      />
                      <div className="form-text">
                        All students in this batch will be enrolled in the selected course
                      </div>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-info"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Assigning to Batch...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-users me-2"></i>
                        Assign to Batch
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Course List Tab */}
        {activeTab === 'list' && (
          <div className="tab-pane fade show active">
            <div className="card">
              <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>Course List
                </h5>
                <button 
                  className="btn btn-light btn-sm"
                  onClick={fetchCourses}
                >
                  <i className="fas fa-sync-alt me-1"></i>Refresh
                </button>
              </div>
              <div className="card-body p-0">
                {courses.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Course Code</th>
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
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-book fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No courses found</h5>
                    <p className="text-muted">Start by adding your first course</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;