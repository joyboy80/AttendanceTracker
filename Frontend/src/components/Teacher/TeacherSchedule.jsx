import React, { useState, useEffect } from 'react';

const TeacherSchedule = () => {
  const [teachingSchedule, setTeachingSchedule] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadTeacherRoutines();
  }, []);

  const loadTeacherRoutines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      const user = JSON.parse(localStorage.getItem('attendanceUser'));
      
      if (!user || !user.id) {
        console.error('No user found in localStorage');
        setTeachingSchedule([]);
        setAvailableBatches([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/routine/teacher/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedSchedule = data.weeklySchedule.map((routine) => ({
            id: routine.routineId,
            day: routine.day,
            startTime: routine.courseTime,
            endTime: routine.endTime,
            courseTitle: routine.courseTitle,
            courseCode: routine.courseCode,
            batch: routine.studentBatch,
            status: 'upcoming'
          }));
          
          setTeachingSchedule(formattedSchedule);
          
          const batches = [...new Set(formattedSchedule.map(schedule => schedule.batch))].sort();
          setAvailableBatches(batches);
        } else {
          console.error('Failed to fetch teacher routines:', data.message);
          setTeachingSchedule([]);
          setAvailableBatches([]);
        }
      } else {
        console.error('Failed to fetch teacher routines');
        setTeachingSchedule([]);
        setAvailableBatches([]);
      }
    } catch (error) {
      console.error('Error loading teacher routines:', error);
      setTeachingSchedule([]);
      setAvailableBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedule = selectedBatch 
    ? teachingSchedule.filter(schedule => schedule.batch === selectedBatch)
    : teachingSchedule;

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return filteredSchedule.filter(schedule => schedule.day === today);
  };

  const handleStartClass = (scheduleId) => {
    alert(`Starting class for schedule ID: ${scheduleId}`);
    // This would typically redirect to the attendance management page
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'upcoming':
        return <span className="badge bg-primary">Upcoming</span>;
      case 'ongoing':
        return <span className="badge bg-warning">Ongoing</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-12">
              <h5 className="mb-0">
                <i className="fas fa-chalkboard-teacher me-2"></i>My Teaching Schedule
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Filter */}
      <div className="card mb-4">
        <div className="card-header">
          <h6><i className="fas fa-filter me-2"></i>Filter by Batch</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Batch</label>
              <select
                className="form-select"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={loading}
              >
                <option value="">All Batches</option>
                {availableBatches.map(batch => (
                  <option key={batch} value={batch}>Batch {batch}</option>
                ))}
              </select>
              {availableBatches.length === 0 && !loading && (
                <small className="text-muted">No batches available</small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card mb-4">
          <div className="card-body text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading your teaching schedule...</p>
          </div>
        </div>
      )}

      {/* Today's Classes */}
      {!loading && getTodaySchedule().length > 0 && (
        <div className="card mb-4">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0"><i className="fas fa-clock me-2"></i>Today's Classes</h6>
          </div>
          <div className="card-body">
            <div className="row">
              {getTodaySchedule().map(schedule => (
                <div key={schedule.id} className="col-md-6 mb-3">
                  <div className="card border-success">
                    <div className="card-body">
                      <h6 className="card-title text-success">
                        {schedule.courseCode} - {schedule.courseTitle}
                      </h6>
                      <p className="card-text">
                        <strong>Time:</strong> {schedule.startTime} - {schedule.endTime}<br/>
                        <strong>Batch:</strong> {schedule.batch}<br/>
                        <strong>Status:</strong> {getStatusBadge(schedule.status)}
                      </p>
                      {schedule.status === 'upcoming' && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleStartClass(schedule.id)}
                        >
                          <i className="fas fa-play me-1"></i>Start Class
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Routines Message */}
      {!loading && filteredSchedule.length === 0 && (
        <div className="card mb-4">
          <div className="card-body text-center py-5">
            <i className="fas fa-chalkboard-teacher fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No Teaching Schedule Found</h5>
            <p className="text-muted">
              {selectedBatch 
                ? `No routines found for batch ${selectedBatch}. Try selecting a different batch.`
                : "No routines have been assigned to you yet. Please contact your administrator."
              }
            </p>
            {selectedBatch && (
              <button 
                className="btn btn-outline-primary"
                onClick={() => setSelectedBatch('')}
              >
                Show All Batches
              </button>
            )}
          </div>
        </div>
      )}

      {/* Weekly Schedule Grid */}
      {!loading && filteredSchedule.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h6><i className="fas fa-calendar-alt me-2"></i>Weekly Teaching Schedule
              {selectedBatch && <span className="badge bg-info ms-2">Batch {selectedBatch}</span>}
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              {days.map(day => (
                <div key={day} className="col-md-2 mb-3">
                  <div className="card bg-light">
                    <div className="card-header bg-success text-white text-center py-2">
                      <strong>{day}</strong>
                    </div>
                    <div className="card-body p-2">
                      {filteredSchedule
                        .filter(schedule => schedule.day === day)
                        .map(schedule => (
                          <div key={schedule.id} className="mb-2">
                            <div className="card card-body p-2">
                              <div className="small">
                                <div className="fw-bold text-success">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                <div className="fw-semibold">{schedule.courseCode}</div>
                                <div className="text-muted">{schedule.courseTitle}</div>
                                <div className="text-muted">Batch: {schedule.batch}</div>
                                <div className="mt-1">
                                  {getStatusBadge(schedule.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                      {filteredSchedule.filter(schedule => schedule.day === day).length === 0 && (
                        <div className="text-center text-muted small py-3">
                          No classes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Schedule Table */}
      {!loading && filteredSchedule.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h6><i className="fas fa-list me-2"></i>Detailed Teaching Schedule
              {selectedBatch && <span className="badge bg-info ms-2">Batch {selectedBatch}</span>}
            </h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedule.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <span className="badge bg-success">{schedule.day}</span>
                      </td>
                      <td className="fw-semibold">{schedule.startTime}</td>
                      <td className="fw-semibold">{schedule.endTime}</td>
                      <td>
                        <div className="fw-semibold">{schedule.courseCode}</div>
                        <div className="text-muted small">{schedule.courseTitle}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">{schedule.batch}</span>
                      </td>
                      <td>{getStatusBadge(schedule.status)}</td>
                      <td>
                        {schedule.status === 'upcoming' && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleStartClass(schedule.id)}
                          >
                            <i className="fas fa-play me-1"></i>Start
                          </button>
                        )}
                        {schedule.status === 'completed' && (
                          <button className="btn btn-sm btn-outline-success" disabled>
                            <i className="fas fa-check me-1"></i>Completed
                          </button>
                        )}
                        {schedule.status === 'ongoing' && (
                          <button className="btn btn-sm btn-warning">
                            <i className="fas fa-pause me-1"></i>Ongoing
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSchedule;