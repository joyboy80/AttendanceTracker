import React, { useState, useEffect } from 'react';

interface Course {
  id: number;
  code: string;
  title: string;
  credit: number;
  description?: string;
}

const AssignedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('attendanceToken');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/teacher/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch assigned courses');
      }
    } catch (err: any) {
      setError('Error fetching courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCredits = () => {
    return courses.reduce((total, course) => total + course.credit, 0);
  };

  const handleGenerateAttendanceCode = async (course: Course) => {
    try {
      const token = localStorage.getItem('attendanceToken');
      if (!token) {
        alert('Please log in first');
        return;
      }
      
      // Get teacher information from stored user data
      const storedUser = localStorage.getItem('attendanceUser');
      if (!storedUser) {
        alert('User information not found. Please log in again.');
        return;
      }
      
      const userData = JSON.parse(storedUser);
      const teacherName = userData.name || 'Unknown Teacher';
      const teacherUsername = userData.username || 'unknown';
      
      const response = await fetch(`http://localhost:8080/api/attendance/generate?courseCode=${encodeURIComponent(course.code)}&teacherName=${encodeURIComponent(teacherName)}&teacherUsername=${encodeURIComponent(teacherUsername)}`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store code and session in localStorage for Activate page
        localStorage.setItem('activeAttendanceCode', data.code);
        localStorage.setItem('activeAttendanceSessionId', String(data.sessionId));
        localStorage.setItem('activeCourseCode', course.code);
        localStorage.setItem('activeCourseTitle', course.title);
        
        // Show success message and redirect to activate page
        alert(`Attendance code generated successfully for ${course.code}!\nRedirecting to Active Attendance page...`);
        window.location.href = '/teacher/activate';
      } else {
        alert('Failed to generate attendance code: ' + (data.message || 'Unknown error'));
      }
    } catch (error: unknown) {
      console.error('Error generating attendance code:', error);
      alert('Network error: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your assigned courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-chalkboard-teacher me-2"></i>Assigned Courses</h4>
        {courses.length > 0 && (
          <div className="badge bg-success fs-6">
            {courses.length} course{courses.length !== 1 ? 's' : ''} • {getTotalCredits()} credits
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {courses.length === 0 && !error ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-chalkboard fa-4x text-muted mb-3"></i>
            <h5 className="text-muted">No Assigned Courses</h5>
            <p className="text-muted mb-0">
              You are not currently assigned to teach any courses. 
              Contact your administrator to get course assignments.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Course Statistics */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Teaching Load</h6>
                      <h4 className="mb-0">{courses.length}</h4>
                      <small>course{courses.length !== 1 ? 's' : ''}</small>
                    </div>
                    <i className="fas fa-chalkboard-teacher fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Total Credits</h6>
                      <h4 className="mb-0">{getTotalCredits()}</h4>
                      <small>credit hours</small>
                    </div>
                    <i className="fas fa-clock fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Avg Credits</h6>
                      <h4 className="mb-0">{courses.length > 0 ? (getTotalCredits() / courses.length).toFixed(1) : '0'}</h4>
                      <small>per course</small>
                    </div>
                    <i className="fas fa-chart-bar fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course List */}
          <div className="row">
            {courses.map((course, index) => (
              <div key={course.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100 shadow-sm border-start border-success border-3">
                  <div className="card-header bg-light border-bottom">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-0 text-success fw-bold">{course.code}</h6>
                        <small className="text-muted">Course {index + 1}</small>
                      </div>
                      <span className="badge bg-success">{course.credit} credit{course.credit !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6 className="card-title">{course.title}</h6>
                    {course.description && (
                      <p className="card-text text-muted small">
                        {course.description.length > 100 
                          ? course.description.substring(0, 100) + '...' 
                          : course.description
                        }
                      </p>
                    )}
                  </div>
                  <div className="card-footer bg-light border-top-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="fas fa-user-tie me-1"></i>
                        Teaching
                      </small>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleGenerateAttendanceCode(course)}
                        >
                          <i className="fas fa-qrcode me-1"></i>
                          Attendance
                        </button>
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => {
                            // Future: Navigate to course details
                            alert(`View details for ${course.code}`);
                          }}
                        >
                          <i className="fas fa-info-circle me-1"></i>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-4">
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={fetchAssignedCourses}
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh Courses
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  // Future: Navigate to create attendance session
                  alert('Start new attendance session');
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Start Attendance
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignedCourses;