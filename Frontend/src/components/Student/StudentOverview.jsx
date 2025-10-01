import React from 'react';
import StatsCard from '../Common/StatsCard';

const StudentOverview = () => {
  return (
    <div className="fade-in">
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Classes"
            value="24"
            icon="fas fa-calendar"
            color="primary"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Attended"
            value="22"
            icon="fas fa-check-circle"
            color="success"
            trend={{ value: 5, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Attendance Rate"
            value="91.7%"
            icon="fas fa-percentage"
            color="info"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="This Week"
            value="5/6"
            icon="fas fa-calendar-week"
            color="warning"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card bg-light">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-3x text-primary mb-3"></i>
              <h5>Next Class</h5>
              <p className="text-muted">Physics - Dr. Wilson<br/>Tomorrow at 10:00 AM<br/>Batch: CSE-2021</p>
              <button className="btn btn-outline-primary">
                <i className="fas fa-bell me-2"></i>Set Reminder
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-light">
            <div className="card-body text-center">
              <i className="fas fa-download fa-3x text-success mb-3"></i>
              <h5>Download Report</h5>
              <p className="text-muted">Get your complete<br/>attendance report</p>
              <button className="btn btn-outline-success">
                <i className="fas fa-file-csv me-2"></i>Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;