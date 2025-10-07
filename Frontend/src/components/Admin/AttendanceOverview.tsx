import React, { useState, useEffect } from 'react';
import StatsCard from '../Common/StatsCard';
import attendanceService from '../../services/attendanceService';

const AttendanceOverview = () => {
  const [filters, setFilters] = useState({
    batch: 'all',
    course: 'all',
    dateRange: 'week'
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    presentRecords: 0,
    absentRecords: 0,
    attendanceRate: 0
  });
  const [batchOptions, setBatchOptions] = useState([{ value: 'all', label: 'All Batches' }]);
  const [courseOptions, setCourseOptions] = useState([{ value: 'all', label: 'All Courses' }]);
  const [batchSummary, setBatchSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch attendance data from backend
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await attendanceService.getAttendanceOverview(filters);
      if (data.success) {
        setAttendanceData(data.attendanceRecords || []);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const data = await attendanceService.getStatistics();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const data = await attendanceService.getBatches();
      if (data.success) {
        const options = [{ value: 'all', label: 'All Batches' }];
        
        // Add predefined batch options (19, 20, 21, 22 to 30) - only digits
        const predefinedBatches: string[] = [];
        for (let year = 19; year <= 30; year++) {
          predefinedBatches.push(year.toString());
          options.push({ value: year.toString(), label: year.toString() });
        }
        
        // Add dynamic batches from database (if not already included)
        data.batches.forEach((batch: string) => {
          // Only add if not already in predefined batches
          if (!predefinedBatches.includes(batch)) {
            options.push({ value: batch, label: batch });
          }
        });
        
        setBatchOptions(options);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
      // Fallback: Add predefined batches even if API fails
      const options = [{ value: 'all', label: 'All Batches' }];
      for (let year = 19; year <= 30; year++) {
        options.push({ value: year.toString(), label: year.toString() });
      }
      setBatchOptions(options);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const data = await attendanceService.getCourses();
      if (data.success) {
        const options = [{ value: 'all', label: 'All Courses' }];
        data.courses.forEach((course: any) => {
          options.push({ value: course.code, label: `${course.code} - ${course.title}` });
        });
        setCourseOptions(options);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch batch summary
  const fetchBatchSummary = async () => {
    try {
      const data = await attendanceService.getBatchSummary();
      if (data.success) {
        setBatchSummary(data.batchSummary || []);
      }
    } catch (err) {
      console.error('Error fetching batch summary:', err);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    fetchStatistics();
    fetchBatches();
    fetchCourses();
    fetchBatchSummary();
  }, []);

  const getFilteredData = () => {
    return attendanceData.filter((record: any) => {
      const batchMatch = filters.batch === 'all' || record.batch === filters.batch;
      const courseMatch = filters.course === 'all' || record.courseCode === filters.course;
      return batchMatch && courseMatch;
    });
  };

  const calculateStats = () => {
    const filtered = getFilteredData();
    const total = filtered.length;
    const present = filtered.filter((record: any) => record.status === 'PRESENT').length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    
    return { total, present, absent, percentage };
  };

  const downloadReport = () => {
    const filtered = getFilteredData();
    const csvContent = [
      ['Student', 'Batch', 'Course', 'Date', 'Status'],
      ...filtered.map((record: any) => [
        record.studentName || 'N/A',
        record.batch || 'N/A',
        `${record.courseCode} - ${record.courseTitle || ''}`,
        new Date(record.timestamp).toLocaleDateString(),
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

  // Use real statistics from backend instead of calculated stats
  const displayStats = {
    total: statistics.totalRecords,
    present: statistics.presentRecords,
    absent: statistics.absentRecords,
    percentage: statistics.attendanceRate
  };

  return (
    <div className="fade-in">
      {/* Filter Controls */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="fas fa-filter me-2"></i>Filter Options</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
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
              <label className="form-label">Course</label>
              <select
                className="form-select"
                value={filters.course}
                onChange={(e) => setFilters({...filters, course: e.target.value})}
              >
                {courseOptions.map(option => (
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
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100"
                onClick={() => {
                  fetchAttendanceData();
                  fetchStatistics();
                  fetchBatchSummary();
                }}
                disabled={loading}
              >
                <i className="fas fa-sync me-2"></i>Refresh
              </button>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-success w-100"
                onClick={downloadReport}
                disabled={loading || getFilteredData().length === 0}
              >
                <i className="fas fa-download me-2"></i>Download
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
            value={displayStats.total || 0}
            icon="fas fa-list"
            color="primary"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Present"
            value={displayStats.present || 0}
            icon="fas fa-check-circle"
            color="success"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Absent"
            value={displayStats.absent || 0}
            icon="fas fa-times-circle"
            color="danger"
            trend={{ value: 0, isPositive: false }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Attendance Rate"
            value={`${displayStats.percentage || 0}%`}
            icon="fas fa-percentage"
            color="info"
            trend={{ value: 0, isPositive: true }}
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
                        <th>Course</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-danger">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                          </td>
                        </tr>
                      ) : getFilteredData().length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No attendance records found
                          </td>
                        </tr>
                      ) : (
                        getFilteredData().map((record: any) => (
                          <tr key={record.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                                     style={{ width: '32px', height: '32px' }}>
                                  <i className="fas fa-user text-white"></i>
                                </div>
                                {record.studentName || 'N/A'}
                              </div>
                            </td>
                            <td>
                              <div>
                                <span className="badge bg-info">{record.batch || 'N/A'}</span>
                                {record.userBatch !== record.studentBatch && (
                                  <div>
                                    <small className="text-muted">
                                      User: {record.userBatch || 'None'} | 
                                      Student: {record.studentBatch || 'None'}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-semibold">{record.courseCode}</div>
                                <small className="text-muted">{record.courseTitle}</small>
                              </div>
                            </td>
                            <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${
                                record.status === 'PRESENT' ? 'bg-success' : 'bg-danger'
                              }`}>
                                <i className={`fas fa-${
                                  record.status === 'PRESENT' ? 'check' : 'times'
                                } me-1`}></i>
                                {record.status === 'PRESENT' ? 'Present' : record.status === 'ABSENT' ? 'Absent' : record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
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
              {batchSummary.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                  <p className="text-muted small">No batch data available</p>
                </div>
              ) : (
                batchSummary.map((batch: any) => (
                  <div key={batch.batch} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">{batch.batch}</span>
                      <span className="small">{batch.attendancePercentage}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${batch.attendancePercentage}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      {batch.presentRecords} present out of {batch.totalRecords} records
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Attendance Alert */}
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h6><i className="fas fa-exclamation-triangle me-2"></i>Low Attendance Alert</h6>
            </div>
            <div className="card-body">
              {batchSummary.filter((batch: any) => batch.attendancePercentage < 75).length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                  <p className="text-muted small">
                    No batches with low attendance (below 75%)
                  </p>
                </div>
              ) : (
                <div>
                  {batchSummary
                    .filter((batch: any) => batch.attendancePercentage < 75)
                    .map((batch: any) => (
                      <div key={batch.batch} className="mb-3 p-2 border-start border-warning border-3">
                        <div className="d-flex justify-content-between">
                          <div>
                            <div className="fw-semibold text-warning">{batch.batch}</div>
                            <small className="text-muted">
                              {batch.totalStudents} students
                            </small>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-warning text-dark">
                              {batch.attendancePercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div className="text-center mt-3">
                    <button className="btn btn-outline-warning btn-sm">
                      <i className="fas fa-bell me-1"></i>Send Alerts
                    </button>
                  </div>
                </div>
              )}
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