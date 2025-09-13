import React, { useState } from 'react';
import StatsCard from '../Common/StatsCard';

const StatisticsPage = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data
  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'cs', name: 'Computer Science' },
    { id: 'math', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' }
  ];

  const attendanceData = [
    { date: '2024-01-15', subject: 'Computer Science', status: 'Present', time: '9:00 AM' },
    { date: '2024-01-15', subject: 'Mathematics', status: 'Present', time: '2:00 PM' },
    { date: '2024-01-16', subject: 'Physics', status: 'Absent', time: '10:00 AM' },
    { date: '2024-01-17', subject: 'Computer Science', status: 'Present', time: '9:00 AM' },
    { date: '2024-01-18', subject: 'Chemistry', status: 'Present', time: '11:00 AM' },
    { date: '2024-01-19', subject: 'Mathematics', status: 'Present', time: '2:00 PM' },
  ];

  const getFilteredData = () => {
    if (selectedSubject === 'all') return attendanceData;
    return attendanceData.filter(record => 
      record.subject.toLowerCase().includes(selectedSubject === 'cs' ? 'computer' : selectedSubject)
    );
  };

  const calculateStats = () => {
    const filtered = getFilteredData();
    const total = filtered.length;
    const present = filtered.filter(record => record.status === 'Present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    
    return { total, present, absent: total - present, percentage };
  };

  const stats = calculateStats();

  const downloadCSV = () => {
    const csvContent = [
      ['Date', 'Subject', 'Status', 'Time'],
      ...getFilteredData().map(record => [
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
                  onChange={(e) => setSelectedSubject(e.target.value)}
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
            value={stats.total}
            icon="fas fa-calendar"
            color="primary"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Classes Attended"
            value={stats.present}
            icon="fas fa-check-circle"
            color="success"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Classes Missed"
            value={stats.absent}
            icon="fas fa-times-circle"
            color="danger"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Attendance Rate"
            value={`${stats.percentage}%`}
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
          {getFilteredData().length === 0 ? (
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
                  {getFilteredData().map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.subject}</td>
                      <td>{record.time}</td>
                      <td>
                        <span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                          <i className={`fas fa-${record.status === 'Present' ? 'check' : 'times'} me-1`}></i>
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