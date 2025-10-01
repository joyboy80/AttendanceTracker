import React from 'react';
import StatsCard from '../Common/StatsCard';

const TeacherOverview = () => {
  return (
    <div className="fade-in">
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Students"
            value="95"
            icon="fas fa-user-graduate"
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

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-6">
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
        <div className="col-md-6">
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