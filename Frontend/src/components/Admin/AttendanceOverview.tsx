import React, { useState } from 'react';
import StatsCard from '../Common/StatsCard';

const AttendanceOverview = () => {
  const [filters, setFilters] = useState({
    batch: 'all',
    subject: 'all',
    dateRange: 'week'
  });

  // Mock data
  const attendanceData = [
    { id: 1, student: 'John Smith', batch: 'CS-2023', subject: 'Computer Science', date: '2024-01-15', status: 'Present' },
    { id: 2, student: 'Jane Doe', batch: 'CS-2023', subject: 'Mathematics', date: '2024-01-15', status: 'Present' },
    { id: 3, student: 'Mike Johnson', batch: 'IT-2023', subject: 'Physics', date: '2024-01-16', status: 'Absent' },
    { id: 4, student: 'Sarah Wilson', batch: 'CS-2022', subject: 'Computer Science', date: '2024-01-17', status: 'Present' },
    { id: 5, student: 'Tom Brown', batch: 'IT-2022', subject: 'Chemistry', date: '2024-01-18', status: 'Present' },
  ];

  const batchOptions = [
    { value: 'all', label: 'All Batches' },
    { value: 'CS-2023', label: 'CS-2023' },
    { value: 'CS-2022', label: 'CS-2022' },
    { value: 'IT-2023', label: 'IT-2023' },
    { value: 'IT-2022', label: 'IT-2022' }
  ];

  const subjectOptions = [
    { value: 'all', label: 'All Subjects' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' }
  ];

  const getFilteredData = () => {
    return attendanceData.filter(record => {
      const batchMatch = filters.batch === 'all' || record.batch === filters.batch;
      const subjectMatch = filters.subject === 'all' || record.subject === filters.subject;
      return batchMatch && subjectMatch;
    });
  };

  const calculateStats = () => {
    const filtered = getFilteredData();
    const total = filtered.length;
    const present = filtered.filter(record => record.status === 'Present').length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    
    return { total, present, absent, percentage };
  };

  const downloadReport = () => {
    const filtered = getFilteredData();
    const csvContent = [
      ['Student', 'Batch', 'Subject', 'Date', 'Status'],
      ...filtered.map(record => [
        record.student,
        record.batch,
        record.subject,
        record.date,
        record.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_overview_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = calculateStats();

  return (
    <div className="fade-in">
      {/* Filter Controls */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="fas fa-filter me-2"></i>Filter Options</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Batch</label>
              <select
                className="form-select"
                value={filters.batch}
                onChange={(e) => setFilters({...filters, batch: e.target.value})}
              >
                {batchOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
              >
                {subjectOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date Range</label>
              <select
                className="form-select"
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-success w-100"
                onClick={downloadReport}
              >
                <i className="fas fa-download me-2"></i>Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Records"
            value={stats.total}
            icon="fas fa-list"
            color="primary"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Present"
            value={stats.present}
            icon="fas fa-check-circle"
            color="success"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Absent"
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

      <div className="row">
        {/* Attendance Records */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-table me-2"></i>Attendance Records</h6>
            </div>
            <div className="card-body">
              {getFilteredData().length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No Records Found</h5>
                  <p className="text-muted">No attendance records match the selected filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Batch</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredData().map((record) => (
                        <tr key={record.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                                   style={{ width: '32px', height: '32px' }}>
                                <i className="fas fa-user text-white"></i>
                              </div>
                              {record.student}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">{record.batch}</span>
                          </td>
                          <td>{record.subject}</td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${
                              record.status === 'Present' ? 'bg-success' : 'bg-danger'
                            }`}>
                              <i className={`fas fa-${
                                record.status === 'Present' ? 'check' : 'times'
                              } me-1`}></i>
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
        </div>

        {/* Summary and Analytics */}
        <div className="col-md-4">
          {/* Batch-wise Summary */}
          <div className="card mb-4">
            <div className="card-header">
              <h6><i className="fas fa-chart-pie me-2"></i>Batch-wise Summary</h6>
            </div>
            <div className="card-body">
              {batchOptions.slice(1).map(batch => {
                const batchRecords = attendanceData.filter(r => r.batch === batch.value);
                const present = batchRecords.filter(r => r.status === 'Present').length;
                const total = batchRecords.length;
                const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
                
                return (
                  <div key={batch.value} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">{batch.label}</span>
                      <span className="small">{percentage}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Attendance Alert */}
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h6><i className="fas fa-exclamation-triangle me-2"></i>Low Attendance Alert</h6>
            </div>
            <div className="card-body">
              <div className="text-center py-3">
                <i className="fas fa-user-times fa-2x text-warning mb-2"></i>
                <p className="text-muted small">
                  Students with attendance below 75% will be listed here
                </p>
                <button className="btn btn-outline-warning btn-sm">
                  <i className="fas fa-bell me-1"></i>Send Alerts
                </button>
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
              <h6><i className="fas fa-chart-line me-2"></i>Attendance Trend</h6>
            </div>
            <div className="card-body text-center">
              <i className="fas fa-chart-line fa-4x text-muted mb-3"></i>
              <p className="text-muted">Line chart showing attendance<br/>trends over time</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-chart-bar me-2"></i>Subject Comparison</h6>
            </div>
            <div className="card-body text-center">
              <i className="fas fa-chart-bar fa-4x text-muted mb-3"></i>
              <p className="text-muted">Bar chart comparing attendance<br/>across different subjects</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverview;