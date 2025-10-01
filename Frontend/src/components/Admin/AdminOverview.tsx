import React from 'react';
import StatsCard from '../Common/StatsCard';

const AdminOverview = () => {
  const recentActivity = [
    { type: 'user', message: 'New teacher John Smith added to system', time: '2 hours ago', icon: 'fas fa-user-plus', color: 'success' },
    { type: 'attendance', message: 'Computer Science 101 - 95% attendance rate', time: '4 hours ago', icon: 'fas fa-chart-line', color: 'info' },
    { type: 'routine', message: 'Mathematics schedule updated for Room 203', time: '1 day ago', icon: 'fas fa-calendar-edit', color: 'warning' },
    { type: 'system', message: 'Weekly attendance reports generated', time: '2 days ago', icon: 'fas fa-file-alt', color: 'primary' },
  ];

  const lowAttendanceClasses = [
    { subject: 'Physics Lab', teacher: 'Dr. Wilson', attendance: '68%', students: '17/25' },
    { subject: 'Chemistry Theory', teacher: 'Prof. Davis', attendance: '72%', students: '23/32' },
    { subject: 'Advanced Math', teacher: 'Dr. Brown', attendance: '75%', students: '21/28' },
  ];

  return (
    <div className="fade-in">
      {/* Overview Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Students"
            value="1,247"
            icon="fas fa-user-graduate"
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Teachers"
            value="67"
            icon="fas fa-chalkboard-teacher"
            color="success"
            trend={{ value: 3, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Overall Attendance"
            value="87.5%"
            icon="fas fa-percentage"
            color="info"
            trend={{ value: 5, isPositive: true }}
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Active Classes"
            value="156"
            icon="fas fa-door-open"
            color="warning"
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
                                strokeDasharray={`${87.5 * 188.4 / 100} 188.4`} transform="rotate(-90 40 40)"/>
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <strong>87.5%</strong>
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
                                strokeDasharray={`${89.2 * 188.4 / 100} 188.4`} transform="rotate(-90 40 40)"/>
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <strong>89.2%</strong>
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
                                strokeDasharray={`${85.7 * 188.4 / 100} 188.4`} transform="rotate(-90 40 40)"/>
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <strong>85.7%</strong>
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
              <div className="list-group list-group-flush">
                {recentActivity.map((activity, index) => (
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
              {lowAttendanceClasses.map((classItem, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{classItem.subject}</div>
                      <small className="text-muted">{classItem.teacher}</small>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-warning text-dark">{classItem.attendance}</span>
                      <br/>
                      <small className="text-muted">{classItem.students}</small>
                    </div>
                  </div>
                  {index < lowAttendanceClasses.length - 1 && <hr/>}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-bolt me-2"></i>Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="fas fa-user-plus me-2"></i>Add User
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