import React, { useState, useEffect } from 'react';
import StatsCard from '../Common/StatsCard';
import adminDashboardService from '../../services/adminDashboardService';

const AdminOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    overallAttendanceRate: 0,
    activeClasses: 0
  });
  const [attendanceTrends, setAttendanceTrends] = useState({
    today: 0,
    week: 0,
    month: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [lowAttendanceClasses, setLowAttendanceClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewData, trendsData, activityData, lowAttendanceData] = await Promise.all([
        adminDashboardService.getDashboardOverview(),
        adminDashboardService.getAttendanceTrends(),
        adminDashboardService.getRecentActivity(),
        adminDashboardService.getLowAttendanceClasses()
      ]);

      if (overviewData.success) {
        setDashboardData(overviewData.overview);
      }

      if (trendsData.success) {
        setAttendanceTrends(trendsData.trends);
      }

      if (activityData.success) {
        setRecentActivity(activityData.recentActivity);
      }

      if (lowAttendanceData.success) {
        setLowAttendanceClasses(lowAttendanceData.lowAttendanceClasses);
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle ending active class
  const handleEndActiveClass = async (sessionId: number) => {
    if (window.confirm('Are you sure you want to end this active class?')) {
      try {
        const result = await adminDashboardService.deleteActiveClass(sessionId);
        if (result.success) {
          alert('Active class ended successfully');
          fetchDashboardData(); // Refresh data
        }
      } catch (err) {
        console.error('Error ending active class:', err);
        alert('Failed to end active class');
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>Failed to load dashboard data: {error}</p>
        <button className="btn btn-outline-danger" onClick={fetchDashboardData}>
          <i className="fas fa-redo me-2"></i>Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Overview Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Students"
            value={dashboardData.totalStudents.toString()}
            icon="fas fa-user-graduate"
            color="primary"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Teachers"
            value={dashboardData.totalTeachers.toString()}
            icon="fas fa-chalkboard-teacher"
            color="success"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Overall Attendance"
            value={`${dashboardData.overallAttendanceRate}%`}
            icon="fas fa-percentage"
            color="info"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Active Classes"
            value={dashboardData.activeClasses.toString()}
            icon="fas fa-door-open"
            color="warning"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      </div>

      <div className="row">
        {/* System Overview */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5><i className="fas fa-chart-bar me-2"></i>Attendance Overview</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center">
                  <div className="mb-3">
                    <div className="progress mx-auto" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                      <svg width="80" height="80" className="progress-ring">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#e9ecef" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#28a745" strokeWidth="8"
                                strokeDasharray={`${attendanceTrends.today * 188.4 / 100} 188.4`} transform="rotate(-90 40 40)"/>
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <strong>{attendanceTrends.today}%</strong>
                      </div>
                    </div>
                  </div>
                  <h6>Today's Attendance</h6>
                </div>
                <div className="col-md-4 text-center">
                  <div className="mb-3">
                    <div className="progress mx-auto" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                      <svg width="80" height="80" className="progress-ring">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#e9ecef" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#007bff" strokeWidth="8"
                                strokeDasharray={`${attendanceTrends.week * 188.4 / 100} 188.4`} transform="rotate(-90 40 40)"/>
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <strong>{attendanceTrends.week}%</strong>
                      </div>
                    </div>
                  </div>
                  <h6>This Week</h6>
                </div>
                <div className="col-md-4 text-center">
                  <div className="mb-3">
                    <div className="progress mx-auto" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                      <svg width="80" height="80" className="progress-ring">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#e9ecef" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#ffc107" strokeWidth="8"
                                strokeDasharray={`${attendanceTrends.month * 188.4 / 100} 188.4`} transform="rotate(-90 40 40)"/>
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <strong>{attendanceTrends.month}%</strong>
                      </div>
                    </div>
                  </div>
                  <h6>This Month</h6>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-history me-2"></i>Recent Activity</h5>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-history fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No Recent Activity</h6>
                  <p className="text-muted small">Recent system activities will appear here</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="list-group-item d-flex align-items-center px-0">
                      <div className={`me-3 text-${activity.color}`}>
                        <i className={`${activity.icon} fa-lg`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{activity.message}</div>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="col-md-4">
          {/* Low Attendance Alert */}
          <div className="card mb-4">
            <div className="card-header bg-warning text-dark">
              <h6><i className="fas fa-exclamation-triangle me-2"></i>Low Attendance Alert</h6>
            </div>
            <div className="card-body">
              {lowAttendanceClasses.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                  <h6 className="text-success">Great Attendance!</h6>
                  <p className="text-muted small">All classes have good attendance rates (above 75%)</p>
                </div>
              ) : (
                lowAttendanceClasses.map((classItem: any, index: number) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold">{classItem.subject}</div>
                        <small className="text-muted">{classItem.teacher}</small>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-warning text-dark">{classItem.attendanceRate}%</span>
                        <br/>
                        <small className="text-muted">{classItem.presentRecords}/{classItem.totalRecords}</small>
                      </div>
                    </div>
                    {index < lowAttendanceClasses.length - 1 && <hr/>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-bolt me-2"></i>Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary" onClick={fetchDashboardData}>
                  <i className="fas fa-sync me-2"></i>Refresh Dashboard
                </button>
                {dashboardData.activeClasses > 0 && (
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => {
                      const sessionId = prompt('Enter session ID to end:');
                      if (sessionId) {
                        handleEndActiveClass(parseInt(sessionId));
                      }
                    }}
                  >
                    <i className="fas fa-stop me-2"></i>End Active Class
                  </button>
                )}
                <button className="btn btn-outline-success">
                  <i className="fas fa-download me-2"></i>Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;