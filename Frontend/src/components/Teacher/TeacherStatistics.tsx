import React, { useState } from 'react';
import StatsCard from '../Common/StatsCard';

const TeacherStatistics = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [dateRange, setDateRange] = useState('week');

  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'cs101', name: 'Computer Science 101' },
    { id: 'ds', name: 'Data Structures' },
    { id: 'algo', name: 'Algorithms' }
  ];

  const attendanceData = [
    { date: '2024-01-15', subject: 'Computer Science 101', present: 32, total: 35, percentage: 91.4 },
    { date: '2024-01-16', subject: 'Data Structures', present: 25, total: 28, percentage: 89.3 },
    { date: '2024-01-17', subject: 'Computer Science 101', present: 33, total: 35, percentage: 94.3 },
    { date: '2024-01-18', subject: 'Algorithms', present: 28, total: 32, percentage: 87.5 },
    { date: '2024-01-19', subject: 'Data Structures', present: 26, total: 28, percentage: 92.9 },
  ];

  const studentList = [
    { name: 'John Smith', rollNo: 'CS001', attendance: 22, total: 24, percentage: 91.7 },
    { name: 'Jane Doe', rollNo: 'CS002', attendance: 23, total: 24, percentage: 95.8 },
    { name: 'Mike Johnson', rollNo: 'CS003', attendance: 20, total: 24, percentage: 83.3 },
    { name: 'Sarah Wilson', rollNo: 'CS004', attendance: 24, total: 24, percentage: 100.0 },
    { name: 'Tom Brown', rollNo: 'CS005', attendance: 18, total: 24, percentage: 75.0 },
  ];

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

  const getFilteredData = () => {
    if (selectedSubject === 'all') return attendanceData;
    return attendanceData.filter(record => 
      record.subject.toLowerCase().includes(selectedSubject === 'cs101' ? 'computer science 101' : selectedSubject)
    );
  };

  const calculateOverallStats = () => {
    const filtered = getFilteredData();
    const totalPresent = filtered.reduce((sum, record) => sum + record.present, 0);
    const totalClasses = filtered.reduce((sum, record) => sum + record.total, 0);
    const avgPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : '0';
    
    return {
      totalClasses: filtered.length,
      totalStudents: Math.max(...filtered.map(r => r.total), 0),
      avgAttendance: avgPercentage,
      totalPresent
    };
  };

  const stats = calculateOverallStats();

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
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
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
            value={stats.totalClasses}
            icon="fas fa-chalkboard-teacher"
            color="primary"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon="fas fa-user-graduate"
            color="success"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Avg Attendance"
            value={`${stats.avgAttendance}%`}
            icon="fas fa-percentage"
            color="info"
            trend={{ value: 2, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Present"
            value={stats.totalPresent}
            icon="fas fa-check-circle"
            color="warning"
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
                    {getFilteredData().map((record, index) => (
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
                    ))}
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
                {studentList.slice(0, 5).map((student, index) => (
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
                ))}
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