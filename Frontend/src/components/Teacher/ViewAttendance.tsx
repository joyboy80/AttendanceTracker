import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import attendanceService from '../../services/attendanceService';

interface AttendanceRecord {
  attendanceID: number;
  studentID: number;
  studentName: string;
  courseCode: string;
  courseName: string;
  status: string;
  timestamp: string;
  date: string;
  time: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface ClassSession {
  date: string;
  courseCode: string;
  courseName: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendanceRate: number;
  students: AttendanceRecord[];
}

const ViewAttendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'sessions' | 'records'>('sessions');

  // Fetch teacher's courses and attendance data
  const fetchAttendanceData = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get teacher attendance records using the new detailed endpoint
      const response = await attendanceService.getTeacherAttendanceRecords(
        user.id, 
        selectedCourse === 'all' ? null : selectedCourse,
        selectedDate || null
      );
      
      if (response.success) {
        setCourses(response.courses || []);
        
        // Set class sessions data
        const sessions = response.classSessions?.map((session: any) => ({
          date: session.date,
          courseCode: session.courseCode,
          courseName: session.courseName,
          totalStudents: session.totalStudents,
          presentStudents: session.presentStudents,
          absentStudents: session.absentStudents,
          attendanceRate: session.attendanceRate,
          students: session.students || []
        })) || [];
        
        setClassSessions(sessions);

        // Set detailed attendance records
        const records = response.attendanceRecords?.map((record: any) => ({
          attendanceID: record.attendanceID,
          studentID: record.studentID,
          studentName: record.studentName,
          courseCode: record.courseCode,
          courseName: record.courseName,
          status: record.status,
          timestamp: record.timestamp,
          date: record.date,
          time: record.time
        })) || [];
        
        setAttendanceRecords(records);
      } else {
        throw new Error(response.error || 'Failed to fetch attendance data');
      }
    } catch (error: any) {
      console.error('Error fetching attendance data:', error);
      setError(error.message || 'Failed to load attendance data');
      setClassSessions([]);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records for a specific class session
  const fetchSessionDetails = async (date: string, courseCode: string) => {
    try {
      setLoading(true);
      // This would call a detailed API endpoint for specific session
      // For now, we'll show a placeholder
      console.log(`Fetching details for ${courseCode} on ${date}`);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching session details:', error);
      setLoading(false);
    }
  };

  // Export attendance data to CSV
  const exportToCSV = () => {
    let csvContent;
    
    if (viewMode === 'sessions') {
      csvContent = [
        ['Date', 'Course', 'Total Students', 'Present', 'Absent', 'Attendance Rate'],
        ...filteredSessions.map((session: ClassSession) => [
          new Date(session.date).toLocaleDateString(),
          session.courseName,
          session.totalStudents,
          session.presentStudents,
          session.absentStudents,
          `${session.attendanceRate}%`
        ])
      ];
    } else {
      csvContent = [
        ['Date', 'Time', 'Student Name', 'Course', 'Status'],
        ...attendanceRecords
          .filter(record => {
            const courseMatch = selectedCourse === 'all' || record.courseCode === selectedCourse;
            const dateMatch = !selectedDate || record.date === selectedDate;
            return courseMatch && dateMatch;
          })
          .map((record: AttendanceRecord) => [
            new Date(record.date).toLocaleDateString(),
            record.time,
            record.studentName,
            record.courseName,
            record.status
          ])
      ];
    }

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter sessions by selected course and date
  const getFilteredSessions = () => {
    return classSessions.filter(session => {
      const courseMatch = selectedCourse === 'all' || session.courseCode.includes(selectedCourse);
      const dateMatch = !selectedDate || session.date === selectedDate;
      return courseMatch && dateMatch;
    });
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchAttendanceData();
  }, [user?.id, selectedCourse, selectedDate]);

  if (loading) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading attendance records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={fetchAttendanceData}
          >
            <i className="fas fa-redo me-1"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredSessions = getFilteredSessions();

  return (
    <div className="fade-in">
      {/* Header with navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1">
                    <i className="fas fa-clipboard-check me-2 text-success"></i>
                    Attendance Management
                  </h4>
                  <p className="text-muted mb-0">View and manage attendance records for your classes</p>
                </div>
                <div className="btn-group">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/teacher/activate')}
                  >
                    <i className="fas fa-play me-2"></i>Start New Session
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/teacher')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3">
              <label className="form-label">Course</label>
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">View Mode</label>
              <select
                className="form-select"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'sessions' | 'records')}
              >
                <option value="sessions">Class Sessions</option>
                <option value="records">Individual Records</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={exportToCSV}
                  disabled={filteredSessions.length === 0}
                >
                  <i className="fas fa-download me-1"></i>CSV
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchAttendanceData}
                >
                  <i className="fas fa-sync-alt me-1"></i>Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3>{filteredSessions.length}</h3>
              <p className="mb-0">Total Classes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3>{filteredSessions.reduce((sum, s) => sum + s.presentStudents, 0)}</h3>
              <p className="mb-0">Total Present</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h3>{filteredSessions.reduce((sum, s) => sum + s.absentStudents, 0)}</h3>
              <p className="mb-0">Total Absent</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3>
                {filteredSessions.length > 0 
                  ? Math.round(filteredSessions.reduce((sum, s) => sum + s.attendanceRate, 0) / filteredSessions.length * 10) / 10
                  : 0}%
              </h3>
              <p className="mb-0">Avg. Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card">
        <div className="card-header">
          <h5>
            <i className="fas fa-list me-2"></i>
            {viewMode === 'sessions' ? 'Class Sessions' : 'Individual Records'}
          </h5>
        </div>
        <div className="card-body">
          {viewMode === 'sessions' ? (
            filteredSessions.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-calendar-times fa-4x text-muted mb-3"></i>
                <h5 className="text-muted">No attendance records found</h5>
                <p className="text-muted">
                  {selectedDate 
                    ? 'No classes found for the selected date and course.'
                    : 'Start taking attendance to see records here.'
                  }
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/teacher/activate')}
                >
                  <i className="fas fa-plus me-2"></i>Start New Attendance Session
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Total Students</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Attendance Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-semibold">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold">{session.courseName}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {session.totalStudents}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">
                            {session.presentStudents}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-danger">
                            {session.absentStudents}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                              <div
                                className="progress-bar bg-success"
                                style={{ width: `${session.attendanceRate}%` }}
                              ></div>
                            </div>
                            <span className={`badge ${
                              session.attendanceRate >= 80 ? 'bg-success' :
                              session.attendanceRate >= 60 ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {session.attendanceRate}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => fetchSessionDetails(session.date, session.courseCode)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                // Future: Edit attendance records
                                alert('Edit functionality coming soon');
                              }}
                              title="Edit Session"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            // Individual Records View
            attendanceRecords.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-user-times fa-4x text-muted mb-3"></i>
                <h5 className="text-muted">No individual records found</h5>
                <p className="text-muted">
                  No detailed attendance records available for the selected filters.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((record, index) => (
                      <tr key={record.attendanceID || index}>
                        <td>
                          <div className="fw-semibold">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">{record.time}</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-user-circle me-2 text-secondary"></i>
                            <span className="fw-semibold">{record.studentName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {record.courseName}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            record.status.toLowerCase() === 'present' ? 'bg-success' : 'bg-danger'
                          }`}>
                            <i className={`fas ${
                              record.status.toLowerCase() === 'present' ? 'fa-check' : 'fa-times'
                            } me-1`}></i>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAttendance;