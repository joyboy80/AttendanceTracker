
import React, { useState, useEffect } from 'react';
import StatsCard from '../Common/StatsCard';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../contexts/AuthContext';

const StatisticsPage = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([{ id: 'all', name: 'All Subjects' }]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = async (courseCode = 'all') => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id) {
        setError('User not found');
        setLoading(false);
        return;
      }
      console.log('Fetching statistics for user:', user.id, 'course:', courseCode);
      const response = await attendanceService.getStudentStatistics(user.id, courseCode);
      console.log('Statistics response:', response);
      if (response.success) {
        setStatistics(response.statistics);
        setAttendanceData(response.attendanceRecords);
        setSubjects(response.courses);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Statistics fetch error:', err);
      setError(`Error loading statistics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics(selectedSubject);
    // eslint-disable-next-line
  }, [user?.id]);

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    fetchStatistics(subjectId);
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Date', 'Subject', 'Status', 'Time'],
      ...attendanceData.map(record => [
        record.date,
        record.subject,
        record.status,
        record.time
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedSubject}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading Statistics...</h5>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button 
            className="btn btn-outline-danger ms-auto"
            onClick={() => fetchStatistics(selectedSubject)}
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
            <div className="col-md-6">
              <h5 className="mb-0">
                <i className="fas fa-filter me-2"></i>Filter by Subject
              </h5>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-success"
                  onClick={downloadCSV}
                  disabled={attendanceData.length === 0}
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
            value={statistics.total}
            icon="fas fa-calendar"
            color="primary"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Classes Attended"
            value={statistics.present}
            icon="fas fa-check-circle"
            color="success"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Classes Missed"
            value={statistics.absent}
            icon="fas fa-times-circle"
            color="danger"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Attendance Rate"
            value={`${statistics.percentage}%`}
            icon="fas fa-percentage"
            color="info"
          />
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-list me-2"></i>Attendance Records</h5>
        </div>
        <div className="card-body">
          {attendanceData.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No records found</h5>
              <p className="text-muted">No attendance records match your current filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.subject}</td>
                      <td>{record.time}</td>
                      <td>
                        <span className={`badge ${record.status === 'PRESENT' || record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                          <i className={`fas fa-${record.status === 'PRESENT' || record.status === 'Present' ? 'check' : 'times'} me-1`}></i>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Chart Placeholder */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-chart-line me-2"></i>Weekly Trend</h6>
            </div>
            <div className="card-body text-center">
              <i className="fas fa-chart-line fa-4x text-muted mb-3"></i>
              <p className="text-muted">Chart visualization would go here<br/>showing attendance trends over time</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-chart-pie me-2"></i>Subject Breakdown</h6>
            </div>
            <div className="card-body text-center">
              <i className="fas fa-chart-pie fa-4x text-muted mb-3"></i>
              <p className="text-muted">Pie chart showing attendance<br/>distribution by subject</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;