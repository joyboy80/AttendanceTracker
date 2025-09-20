import React, { useState, useEffect } from 'react';

interface Course {
  id: number;
  code: string;
  title: string;
  credit: number;
  description?: string;
}

const MyCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('attendanceToken');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/student/courses', {
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
        setError(errorData.error || 'Failed to fetch courses');
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

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-graduation-cap me-2"></i>My Courses</h4>
        {courses.length > 0 && (
          <div className="badge bg-primary fs-6">
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
            <i className="fas fa-book-open fa-4x text-muted mb-3"></i>
            <h5 className="text-muted">No Enrolled Courses</h5>
            <p className="text-muted mb-0">
              You are not currently enrolled in any courses. 
              Contact your administrator to get enrolled in courses.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Course Statistics */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Total Courses</h6>
                      <h4 className="mb-0">{courses.length}</h4>
                    </div>
                    <i className="fas fa-book fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Total Credits</h6>
                      <h4 className="mb-0">{getTotalCredits()}</h4>
                    </div>
                    <i className="fas fa-medal fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-0">Avg Credits</h6>
                      <h4 className="mb-0">{courses.length > 0 ? (getTotalCredits() / courses.length).toFixed(1) : '0'}</h4>
                    </div>
                    <i className="fas fa-chart-line fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course List */}
          <div className="row">
            {courses.map((course, index) => (
              <div key={course.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-0 text-primary fw-bold">{course.code}</h6>
                        <small className="text-muted">Course {index + 1}</small>
                      </div>
                      <span className="badge bg-secondary">{course.credit} credit{course.credit !== 1 ? 's' : ''}</span>
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
                        <i className="fas fa-user-graduate me-1"></i>
                        Enrolled
                      </small>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          // Future: Navigate to course details or attendance
                          alert(`View details for ${course.code}`);
                        }}
                      >
                        <i className="fas fa-eye me-1"></i>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="text-center mt-4">
            <button 
              className="btn btn-outline-secondary"
              onClick={fetchMyCourses}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh Courses
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyCourses;