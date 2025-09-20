import React, { useState, useEffect } from 'react';
import StatsCard from '../Common/StatsCard';

interface Course {
  id: number;
  code: string;
  title: string;
  credit: number;
  description?: string;
}

const TeacherOverview = () => {
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('attendanceToken');
      
      if (!token) {
        setCoursesError('Authentication required');
        setCoursesLoading(false);
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
        setAssignedCourses(data);
        setCoursesError('');
      } else {
        const errorData = await response.json();
        setCoursesError(errorData.error || 'Failed to fetch assigned courses');
      }
    } catch (err: any) {
      setCoursesError('Error fetching courses: ' + err.message);
    } finally {
      setCoursesLoading(false);
    }
  };
  const teachingSchedule = [
    { day: 'Monday', time: '9:00 AM - 11:00 AM', subject: 'Computer Science 101', room: 'Room 101', students: 35 },
    { day: 'Tuesday', time: '10:00 AM - 12:00 PM', subject: 'Data Structures', room: 'Lab 1', students: 28 },
    { day: 'Wednesday', time: '9:00 AM - 11:00 AM', subject: 'Computer Science 101', room: 'Room 101', students: 35 },
    { day: 'Thursday', time: '2:00 PM - 4:00 PM', subject: 'Algorithms', room: 'Room 203', students: 32 },
    { day: 'Friday', time: '10:00 AM - 12:00 PM', subject: 'Data Structures', room: 'Lab 1', students: 28 },
  ];

  return (
    <div className="fade-in">
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Courses"
            value={assignedCourses.length.toString()}
            icon="fas fa-book"
            color="primary"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Classes This Week"
            value="5"
            icon="fas fa-chalkboard-teacher"
            color="success"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Average Attendance"
            value="87.5%"
            icon="fas fa-chart-line"
            color="info"
            trend={{ value: 3, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Today's Classes"
            value="2"
            icon="fas fa-calendar-day"
            color="warning"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      </div>

      

      {/* Teaching Schedule */}
      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-calendar-alt me-2"></i>Weekly Teaching Schedule</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Room</th>
                  <th>Students</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {teachingSchedule.map((schedule, index) => (
                  <tr key={index}>
                    <td className="fw-semibold">{schedule.day}</td>
                    <td>{schedule.time}</td>
                    <td>{schedule.subject}</td>
                    <td>{schedule.room}</td>
                    <td>
                      <span className="badge bg-light text-dark">{schedule.students}</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="fas fa-play me-1"></i>Start Class
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card bg-light">
            <div className="card-body text-center">
              <i className="fas fa-qrcode fa-3x text-primary mb-3"></i>
              <h5>Generate Code</h5>
              <p className="text-muted">Create attendance code for current class</p>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  const token = localStorage.getItem('attendanceToken');
                  console.log('Token:', token); // Debug log
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
                  
                  const res = await fetch(`http://localhost:8080/api/attendance/generate?courseCode=CS101&teacherName=${encodeURIComponent(teacherName)}&teacherUsername=${encodeURIComponent(teacherUsername)}`, { 
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  console.log('Response status:', res.status); // Debug log
                  const data = await res.json();
                  console.log('Response data:', data); // Debug log
                  if (res.ok) {
                    // Store code and session in localStorage for Activate page
                    localStorage.setItem('activeAttendanceCode', data.code);
                    localStorage.setItem('activeAttendanceSessionId', String(data.sessionId));
                    window.location.href = '/teacher/activate';
                  } else {
                    alert('Failed to generate code: ' + (data.message || 'Unknown error'));
                  }
                } catch (e: unknown) {
                  console.error('Error:', e); // Debug log
                  alert('Network error: ' + (e as Error).message);
                }
              }}>
                <i className="fas fa-key me-2"></i>Generate
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light">
            <div className="card-body text-center">
              <i className="fas fa-users fa-3x text-success mb-3"></i>
              <h5>View Attendance</h5>
              <p className="text-muted">Check who attended today's classes</p>
              <button className="btn btn-success">
                <i className="fas fa-eye me-2"></i>View
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light">
            <div className="card-body text-center">
              <i className="fas fa-download fa-3x text-info mb-3"></i>
              <h5>Export Data</h5>
              <p className="text-muted">Download attendance reports</p>
              <button className="btn btn-info">
                <i className="fas fa-file-excel me-2"></i>Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mt-4">
        <div className="card-header">
          <h5><i className="fas fa-history me-2"></i>Recent Activity</h5>
        </div>
        <div className="card-body">
          <div className="list-group list-group-flush">
            <div className="list-group-item d-flex align-items-center">
              <i className="fas fa-check-circle text-success me-3"></i>
              <div>
                <div className="fw-semibold">Computer Science 101 - Attendance Completed</div>
                <small className="text-muted">35 students marked present - 2 hours ago</small>
              </div>
            </div>
            <div className="list-group-item d-flex align-items-center">
              <i className="fas fa-clock text-warning me-3"></i>
              <div>
                <div className="fw-semibold">Data Structures - Class Started</div>
                <small className="text-muted">Attendance window opened - 1 day ago</small>
              </div>
            </div>
            <div className="list-group-item d-flex align-items-center">
              <i className="fas fa-upload text-info me-3"></i>
              <div>
                <div className="fw-semibold">Attendance Report Generated</div>
                <small className="text-muted">Weekly report exported - 2 days ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;