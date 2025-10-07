import React, { useState, useEffect } from 'react';
import StatsCard from '../Common/StatsCard';
import { useAuth } from '../../contexts/AuthContext';
import attendanceService from '../../services/attendanceService';

interface AttendanceRecord {
  date: string;
  subject: string;
  present: number;
  total: number;
  percentage: number;
}

interface Student {
  name: string;
  rollNo: string;
  attendance: number;
  total: number;
  percentage: number;
}

interface Course {
  id: string;
  name: string;
}

interface Statistics {
  totalClasses: number;
  totalStudents: number;
  avgAttendance: number;
  totalPresent: number;
}

const TeacherStatistics = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data states
  const [statistics, setStatistics] = useState<Statistics>({
    totalClasses: 0,
    totalStudents: 0,
    avgAttendance: 0,
    totalPresent: 0
  });
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([{ id: 'all', name: 'All Subjects' }]);

  // Fetch teacher statistics data
  const fetchTeacherStatistics = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching teacher statistics for user:', user.id, 'course:', selectedSubject);
      
      const response = await attendanceService.getTeacherStatistics(user.id, selectedSubject === 'all' ? null : selectedSubject);
      console.log('Teacher statistics response:', response);
      
      if (response.success) {
        setStatistics(response.statistics || {
          totalClasses: 0,
          totalStudents: 0,
          avgAttendance: 0,
          totalPresent: 0
        });
        setAttendanceData(response.attendanceData || []);
        setStudentList(response.studentList || []);
        setCourses(response.courses || [{ id: 'all', name: 'All Subjects' }]);
      } else {
        throw new Error(response.error || 'Failed to fetch teacher statistics');
      }
    } catch (error: any) {
      console.error('Error fetching teacher statistics:', error);
      setError(error.message || 'Failed to load teacher statistics');
      // Set default values on error
      setStatistics({
        totalClasses: 0,
        totalStudents: 0,
        avgAttendance: 0,
        totalPresent: 0
      });
      setAttendanceData([]);
      setStudentList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when selected subject changes
  useEffect(() => {
    fetchTeacherStatistics();
  }, [user?.id, selectedSubject]);

  // Handle subject change
  const handleSubjectChange = (newSubject: string) => {
    setSelectedSubject(newSubject);
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Date', 'Subject', 'Present', 'Total', 'Percentage'],
      ...attendanceData.map(record => [
        record.date,
        record.subject,
        record.present,
        record.total,
        `${record.percentage}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teaching_statistics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading teacher statistics...</p>
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
            onClick={fetchTeacherStatistics}
          >
            <i className="fas fa-redo me-1"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Filter Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>Teaching Statistics
              </h5>
            </div>
            <div className="col-md-8">
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  {courses.map((course: Course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="semester">This Semester</option>
                </select>
                <button
                  className="btn btn-success"
                  onClick={downloadCSV}
                >
                  <i className="fas fa-download me-2"></i>CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Classes"
            value={statistics.totalClasses}
            icon="fas fa-chalkboard-teacher"
            color="primary"
            trend={null}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Students"
            value={statistics.totalStudents}
            icon="fas fa-user-graduate"
            color="success"
            trend={null}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Avg Attendance"
            value={`${statistics.avgAttendance}%`}
            icon="fas fa-percentage"
            color="info"
            trend={{ value: 2, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Present"
            value={statistics.totalPresent}
            icon="fas fa-check-circle"
            color="warning"
            trend={null}
          />
        </div>
      </div>

      <div className="row">
        {/* Class-wise Attendance */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-calendar me-2"></i>Class-wise Attendance</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Present</th>
                      <th>Total</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">
                          {loading ? 'Loading...' : 'No attendance data available'}
                        </td>
                      </tr>
                    ) : (
                      attendanceData.map((record: AttendanceRecord, index: number) => (
                        <tr key={index}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.subject}</td>
                          <td>
                            <span className="badge bg-success">{record.present}</span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">{record.total}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                                <div
                                  className="progress-bar bg-info"
                                  style={{ width: `${record.percentage}%` }}
                                ></div>
                              </div>
                              <span className="small">{record.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-trophy me-2"></i>Student Performance</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {studentList.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    {loading ? 'Loading students...' : 'No student data available'}
                  </div>
                ) : (
                  studentList.slice(0, 5).map((student: Student, index: number) => (
                    <div key={index} className="list-group-item d-flex align-items-center px-0">
                      <div className="me-auto">
                        <div className="fw-semibold">{student.name}</div>
                        <small className="text-muted">{student.rollNo}</small>
                      </div>
                      <div className="text-end">
                        <div className="small">{student.attendance}/{student.total}</div>
                        <span className={`badge ${
                          student.percentage >= 90 ? 'bg-success' :
                          student.percentage >= 75 ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {student.percentage}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-chart-bar me-2"></i>Weekly Attendance Trend</h6>
            </div>
            <div className="card-body text-center">
              <i className="fas fa-chart-bar fa-4x text-muted mb-3"></i>
              <p className="text-muted">Bar chart showing daily<br/>attendance trends</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-chart-pie me-2"></i>Subject Distribution</h6>
            </div>
            <div className="card-body text-center">
              <i className="fas fa-chart-pie fa-4x text-muted mb-3"></i>
              <p className="text-muted">Pie chart showing attendance<br/>by subject</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStatistics;