import React from 'react';
import StatsCard from '../Common/StatsCard';

const StudentOverview = () => {
  // Mock data
  const weeklySchedule = [
    { day: 'Monday', time: '9:00 AM - 11:00 AM', subject: 'Computer Science', room: 'Room 101', status: 'completed' },
    { day: 'Monday', time: '2:00 PM - 4:00 PM', subject: 'Mathematics', room: 'Room 203', status: 'completed' },
    { day: 'Tuesday', time: '10:00 AM - 12:00 PM', subject: 'Physics', room: 'Lab 1', status: 'upcoming' },
    { day: 'Wednesday', time: '9:00 AM - 11:00 AM', subject: 'Computer Science', room: 'Room 101', status: 'upcoming' },
    { day: 'Thursday', time: '11:00 AM - 1:00 PM', subject: 'Chemistry', room: 'Lab 2', status: 'upcoming' },
    { day: 'Friday', time: '2:00 PM - 4:00 PM', subject: 'Mathematics', room: 'Room 203', status: 'upcoming' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'upcoming':
        return <span className="badge bg-primary">Upcoming</span>;
      case 'missed':
        return <span className="badge bg-danger">Missed</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

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

      {/* Weekly Schedule */}
      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-calendar-alt me-2"></i>Weekly Class Schedule</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map((schedule, index) => (
                  <tr key={index}>
                    <td className="fw-semibold">{schedule.day}</td>
                    <td>{schedule.time}</td>
                    <td>{schedule.subject}</td>
                    <td>{schedule.room}</td>
                    <td>{getStatusBadge(schedule.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card bg-light">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-3x text-primary mb-3"></i>
              <h5>Next Class</h5>
              <p className="text-muted">Physics - Lab 1<br/>Tomorrow at 10:00 AM</p>
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