import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../Common/StatsCard';
import { useAuth } from '../../contexts/AuthContext';
import attendanceService from '../../services/attendanceService';

interface DashboardData {
  totalStudents: number;
  classesThisWeek: number;
  averageAttendance: number;
  todayClasses: number;
  recentActivities: Activity[];
  teacherName: string;
}

interface Activity {
  type: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  date: string;
  time: string;
  timeAgo: string;
}

const TeacherOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudents: 0,
    classesThisWeek: 0,
    averageAttendance: 0,
    todayClasses: 0,
    recentActivities: [],
    teacherName: ''
  });

  // Fetch teacher dashboard data
  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching teacher dashboard for user:', user.id);
      
      const response = await attendanceService.getTeacherDashboard(user.id);
      console.log('Teacher dashboard response:', response);
      
      if (response.success) {
        setDashboardData(response.dashboard);
      } else {
        throw new Error(response.error || 'Failed to fetch teacher dashboard');
      }
    } catch (error: any) {
      console.error('Error fetching teacher dashboard:', error);
      setError(error.message || 'Failed to load dashboard data');
      // Set default values on error
      setDashboardData({
        totalStudents: 0,
        classesThisWeek: 0,
        averageAttendance: 0,
        todayClasses: 0,
        recentActivities: [],
        teacherName: user?.name || ''
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard...</p>
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
            onClick={fetchDashboardData}
          >
            <i className="fas fa-redo me-1"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Welcome Message */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient-primary text-white">
            <div className="card-body">
              <h4 className="card-title mb-1">
                <i className="fas fa-chalkboard-teacher me-2"></i>
                Welcome back, {dashboardData.teacherName || user?.name}!
              </h4>
              <p className="card-text mb-0">Here's your teaching overview for today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Students"
            value={dashboardData.totalStudents}
            icon="fas fa-user-graduate"
            color="primary"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Classes This Week"
            value={dashboardData.classesThisWeek}
            icon="fas fa-chalkboard-teacher"
            color="success"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Average Attendance"
            value={`${dashboardData.averageAttendance}%`}
            icon="fas fa-chart-line"
            color="info"
            trend={{ value: 3, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Today's Classes"
            value={dashboardData.todayClasses}
            icon="fas fa-calendar-day"
            color="warning"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-6 offset-md-3">
          <div className="card bg-light h-100">
            <div className="card-body text-center">
              <i className="fas fa-users fa-3x text-success mb-3"></i>
              <h5>View Attendance</h5>
              <p className="text-muted">Manage attendance sessions and view records</p>
              <button 
                className="btn btn-success btn-lg"
                onClick={() => navigate('/teacher/attendance')}
              >
                <i className="fas fa-clipboard-check me-2"></i>Manage Attendance
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5><i className="fas fa-history me-2"></i>Recent Activity</h5>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
        </div>
        <div className="card-body">
          <div className="list-group list-group-flush">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="fas fa-calendar-times fa-3x mb-3 text-muted"></i>
                <p>No recent activities found</p>
                <small>Start taking attendance to see activities here</small>
              </div>
            ) : (
              dashboardData.recentActivities.map((activity: Activity, index: number) => (
                <div key={index} className="list-group-item d-flex align-items-center">
                  <i className={`${activity.icon} text-${activity.color} me-3`}></i>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{activity.title}</div>
                    <small className="text-muted">{activity.description} - {activity.timeAgo}</small>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {activity.date}
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      {activity.time}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-trophy me-2"></i>This Week's Summary</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Classes Conducted</span>
                <span className="badge bg-success">{dashboardData.classesThisWeek}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Students Reached</span>
                <span className="badge bg-primary">{dashboardData.totalStudents}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Attendance Rate</span>
                <span className={`badge ${dashboardData.averageAttendance >= 80 ? 'bg-success' : 
                  dashboardData.averageAttendance >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                  {dashboardData.averageAttendance}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-calendar-day me-2"></i>Today's Overview</h6>
            </div>
            <div className="card-body">
              <div className="text-center">
                {dashboardData.todayClasses > 0 ? (
                  <>
                    <i className="fas fa-chalkboard-teacher fa-3x text-success mb-3"></i>
                    <h4 className="text-success">{dashboardData.todayClasses}</h4>
                    <p className="text-muted mb-0">Classes conducted today</p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-calendar-day fa-3x text-muted mb-3"></i>
                    <h6 className="text-muted">No classes scheduled for today</h6>
                    <p className="small text-muted mb-0">Enjoy your day!</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;