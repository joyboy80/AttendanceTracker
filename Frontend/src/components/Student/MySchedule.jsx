import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const MySchedule = () => {
  const { user } = useAuth();
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [studentBatch, setStudentBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Use useCallback to prevent infinite re-renders
  const loadStudentRoutines = useCallback(async () => {
    if (!user || !user.id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    console.log('Loading routines for user:', user); // Debug log

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('attendanceToken');
      
      // Step 1: First check if user already has batch info from auth context
      let batchInfo = user.batch;
      let shouldFetchBatchInfo = !batchInfo || batchInfo.trim() === '';
      
      console.log('User batch from auth context:', batchInfo); // Debug log
      console.log('Should fetch batch info:', shouldFetchBatchInfo); // Debug log
      
      // Step 2: If no batch info in auth context, fetch student info first
      if (shouldFetchBatchInfo) {
        console.log('Fetching student info from API...'); // Debug log
        const studentInfoResponse = await fetch(`http://localhost:8080/api/student/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (studentInfoResponse.ok) {
          const studentData = await studentInfoResponse.json();
          console.log('Student info response:', studentData); // Debug log
          
          if (studentData.success && studentData.batch_id) {
            batchInfo = studentData.batch_id;
            setStudentBatch(batchInfo);
            console.log('Found batch from student info API:', batchInfo); // Debug log
          } else {
            console.log('No batch found in student info API'); // Debug log
          }
        } else {
          console.error('Failed to fetch student info:', studentInfoResponse.status); // Debug log
        }
      } else {
        setStudentBatch(batchInfo);
      }
      
      // Step 3: Check if we have batch information
      if (!batchInfo || batchInfo.trim() === '') {
        setError('Batch Assignment Required: Student has no batch assigned. Please contact your administrator to assign you to a batch.');
        setWeeklySchedule([]);
        setLoading(false);
        return;
      }
      
      // Step 4: Fetch routines using batch ID (try new API first, fallback to existing)
      console.log('Fetching routines for batch:', batchInfo); // Debug log
      
      let routinesResponse;
      
      // Try the new batch-based API first
      try {
        routinesResponse = await fetch(`http://localhost:8080/api/routine?batchId=${encodeURIComponent(batchInfo)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (batchApiError) {
        console.log('Batch API failed, falling back to student API...'); // Debug log
        // Fallback to existing student API
        routinesResponse = await fetch(`http://localhost:8080/api/routine/student/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Routines response status:', routinesResponse.status); // Debug log
      console.log('Routines response ok:', routinesResponse.ok); // Debug log

      if (routinesResponse.ok) {
        const data = await routinesResponse.json();
        console.log('Full Routines API Response:', data); // Enhanced debug log
        
        if (data.success) {
          // Set student batch from API response if not already set
          if (data.studentBatch && !studentBatch) {
            setStudentBatch(data.studentBatch);
          } else if (data.batchId && !studentBatch) {
            setStudentBatch(data.batchId);
          }
          
          // Check if weeklySchedule exists and is an array
          if (!data.weeklySchedule || !Array.isArray(data.weeklySchedule)) {
            console.error('Invalid weeklySchedule data:', data.weeklySchedule);
            setError('Invalid schedule data received from server');
            setWeeklySchedule([]);
            return;
          }

          console.log('Processing', data.weeklySchedule.length, 'routines for batch:', batchInfo); // Debug log
          
          // Filter routines that match student's batch (extra safety check)
          const batchFilteredRoutines = data.weeklySchedule.filter(routine => 
            routine.studentBatch === batchInfo || routine.studentBatch === (data.studentBatch || data.batchId)
          );
          
          console.log('Batch-filtered routines:', batchFilteredRoutines.length); // Debug log
          
          // Convert and sort the schedule data
          const formattedSchedule = batchFilteredRoutines.map((routine, index) => {
            console.log(`Processing routine ${index}:`, routine); // Debug log
            return {
              id: routine.routineId,
              day: routine.day,
              dayOrder: routine.dayOrder || days.indexOf(routine.day),
              startTime: routine.courseTime,
              endTime: routine.endTime,
              courseTitle: routine.courseTitle,
              courseCode: routine.courseCode,
              teacherName: routine.teacherName,
              batch: routine.studentBatch,
              createdAt: routine.createdAt,
              status: getTimeBasedStatus(routine.courseTime, routine.endTime, routine.day)
            };
          }).sort((a, b) => {
            // Sort by day first, then by time
            if (a.dayOrder !== b.dayOrder) {
              return a.dayOrder - b.dayOrder;
            }
            return a.startTime.localeCompare(b.startTime);
          });
          
          console.log('Formatted and sorted schedule:', formattedSchedule); // Debug log
          setWeeklySchedule(formattedSchedule);
          setLastUpdated(new Date().toLocaleTimeString());
          
          // Log success
          console.log('Successfully set', formattedSchedule.length, 'routines to state');
        } else {
          console.error('API returned error:', data.message); // Debug log
          setError(data.message || 'Failed to fetch student routines');
          setWeeklySchedule([]);
        }
      } else {
        console.error('HTTP Error:', routinesResponse.status); // Debug log
        try {
          const errorData = await routinesResponse.json();
          console.error('Error details:', errorData); // Debug log
          
          // Special handling for missing batch error
          if (errorData.action === 'MISSING_BATCH') {
            setError(`Batch Assignment Required: ${errorData.message}`);
          } else {
            setError(errorData.message || `HTTP ${routinesResponse.status}: Failed to fetch student routines`);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError); // Debug log
          setError(`HTTP ${routinesResponse.status}: Failed to fetch student routines`);
        }
        setWeeklySchedule([]);
      }
    } catch (error) {
      console.error('Error loading student routines:', error);
      setError('Unable to connect to server. Please check your connection.');
      setWeeklySchedule([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependencies: user

  useEffect(() => {
    // Load routines when component mounts or user changes
    loadStudentRoutines();
    
    // Set up polling to refresh schedule every 30 seconds for real-time updates
    const interval = setInterval(loadStudentRoutines, 30000);
    return () => clearInterval(interval);
  }, [loadStudentRoutines]);

  const getTimeBasedStatus = (startTime, endTime, day) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
    
    if (day !== currentDay) {
      // Different day - check if it's in the future or past
      const dayIndex = days.indexOf(day);
      const currentDayIndex = days.indexOf(currentDay);
      
      if (dayIndex > currentDayIndex || (dayIndex < currentDayIndex && dayIndex === 0 && currentDayIndex === 5)) {
        return 'upcoming';
      } else {
        return 'completed';
      }
    } else {
      // Same day - check time
      if (currentTime < startTime) {
        return 'upcoming';
      } else if (currentTime >= startTime && currentTime <= endTime) {
        return 'ongoing';
      } else {
        return 'completed';
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'upcoming':
        return <span className="badge bg-primary">Upcoming</span>;
      case 'ongoing':
        return <span className="badge bg-warning text-dark">Ongoing</span>;
      case 'missed':
        return <span className="badge bg-danger">Missed</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return weeklySchedule.filter(schedule => schedule.day === today);
  };

  const exportSchedule = () => {
    const csvContent = [
      ['Day', 'Start Time', 'End Time', 'Course Code', 'Course Title', 'Teacher', 'Batch', 'Status'],
      ...weeklySchedule.map(schedule => [
        schedule.day, 
        schedule.startTime, 
        schedule.endTime,
        schedule.courseCode,
        schedule.courseTitle, 
        schedule.teacherName, 
        schedule.batch, 
        schedule.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_schedule_batch_${user?.id || 'student'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="mt-3 text-muted">Loading Your Schedule...</h5>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isBatchError = error.includes('Batch Assignment Required');
    return (
      <div className="fade-in">
        <div className="card">
          <div className="card-body text-center py-5">
            <i className={`fas ${isBatchError ? 'fa-user-graduate' : 'fa-exclamation-triangle'} fa-3x ${isBatchError ? 'text-info' : 'text-warning'} mb-3`}></i>
            <h5 className="text-muted">{isBatchError ? 'Account Setup Required' : 'Unable to Load Schedule'}</h5>
            <p className="text-muted">{error}</p>
            {isBatchError && (
              <div className="alert alert-info mt-3">
                <strong>What to do:</strong>
                <ul className="list-unstyled mt-2">
                  <li>• Contact your administrator to assign you to a batch</li>
                  <li>• Your batch number should be between 20-29</li>
                  <li>• Once assigned, your schedule will appear automatically</li>
                </ul>
              </div>
            )}
            <button 
              className="btn btn-primary"
              onClick={loadStudentRoutines}
            >
              <i className="fas fa-retry me-2"></i>Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="card mb-4 border-info">
          <div className="card-header bg-info text-white">
            <h6 className="mb-0">Debug Information</h6>
          </div>
          <div className="card-body">
            <small>
              <strong>User:</strong> {user ? `${user.name} (ID: ${user.id})` : 'Not logged in'}<br/>
              <strong>Student Batch:</strong> {studentBatch || 'Not assigned'}<br/>
              <strong>User Batch (Auth):</strong> {user?.batch || 'Not in auth'}<br/>
              <strong>Weekly Schedule Count:</strong> {weeklySchedule.length}<br/>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}<br/>
              <strong>Error:</strong> {error || 'None'}<br/>
              <strong>Last Updated:</strong> {lastUpdated || 'Never'}<br/>
              <strong>Sample Schedule:</strong> {weeklySchedule.length > 0 ? JSON.stringify(weeklySchedule[0], null, 2) : 'No data'}
            </small>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="mb-1">
                <i className="fas fa-calendar-week me-2 text-primary"></i>My Class Schedule
              </h5>
              <p className="text-muted mb-0">
                {user?.name && `Welcome ${user.name}`} | 
                <span className="badge bg-info ms-2">
                  Batch: {studentBatch || 'Not assigned'}
                </span>
                {weeklySchedule.length > 0 && (
                  <span className="badge bg-success ms-2">
                    {weeklySchedule.length} Course{weeklySchedule.length !== 1 ? 's' : ''}
                  </span>
                )}
                {lastUpdated && (
                  <small className="text-muted ms-2">• Last updated: {lastUpdated}</small>
                )}
              </p>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-outline-primary me-2"
                onClick={loadStudentRoutines}
                disabled={loading}
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              {process.env.NODE_ENV === 'development' && (
                <>
                  <button 
                    className="btn btn-outline-warning me-2"
                    onClick={async () => {
                      // Test student info API
                      const token = localStorage.getItem('attendanceToken');
                      try {
                        const response = await fetch(`http://localhost:8080/api/student/${user.id}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await response.json();
                        console.log('Student Info API test:', data);
                        alert('Student Info API Response:\n' + JSON.stringify(data, null, 2));
                      } catch (error) {
                        console.error('Student Info API test error:', error);
                        alert('Student Info API Error: ' + error.message);
                      }
                    }}
                  >
                    Test Student Info
                  </button>
                  <button 
                    className="btn btn-outline-info me-2"
                    onClick={async () => {
                      // Test batch-based routine API
                      const token = localStorage.getItem('attendanceToken');
                      const batchToTest = studentBatch || user?.batch || '21'; // Use current batch or default
                      try {
                        const response = await fetch(`http://localhost:8080/api/routine?batchId=${encodeURIComponent(batchToTest)}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await response.json();
                        console.log('Batch Routine API test:', data);
                        alert(`Batch Routine API Response (Batch: ${batchToTest}):\n` + JSON.stringify(data, null, 2));
                      } catch (error) {
                        console.error('Batch Routine API test error:', error);
                        alert('Batch Routine API Error: ' + error.message);
                      }
                    }}
                  >
                    Test Batch API
                  </button>
                  <button 
                    className="btn btn-outline-warning me-2"
                    onClick={async () => {
                      // Test original student routine API
                      const token = localStorage.getItem('attendanceToken');
                      try {
                        const response = await fetch(`http://localhost:8080/api/routine/student/${user.id}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await response.json();
                        console.log('Original API test:', data);
                        alert('Original API Response:\n' + JSON.stringify(data, null, 2));
                      } catch (error) {
                        console.error('Original API test error:', error);
                        alert('Original API Error: ' + error.message);
                      }
                    }}
                  >
                    Test Original API
                  </button>
                </>
              )}
              {weeklySchedule.length > 0 && (
                <button 
                  className="btn btn-outline-success"
                  onClick={exportSchedule}
                >
                  <i className="fas fa-download me-2"></i>Export
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* No Routines Message */}
      {!loading && !error && weeklySchedule.length === 0 && (
        <div className="card mb-4">
          <div className="card-body text-center py-5">
            <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No Class Schedule Found</h5>
            <p className="text-muted">
              No routines have been assigned to your batch yet. 
              Please contact your administrator or check back later.
            </p>
            <button 
              className="btn btn-primary"
              onClick={loadStudentRoutines}
            >
              <i className="fas fa-refresh me-2"></i>Check Again
            </button>
          </div>
        </div>
      )}

      {/* Today's Schedule Highlight */}
      {getTodaySchedule().length > 0 && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0"><i className="fas fa-clock me-2"></i>Today's Classes</h6>
          </div>
          <div className="card-body">
            <div className="row">
              {getTodaySchedule().map(schedule => (
                <div key={schedule.id} className="col-md-6 mb-3">
                  <div className="card border-primary h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title text-primary mb-0">{schedule.courseCode}</h6>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <h6 className="text-dark">{schedule.courseTitle}</h6>
                      <p className="card-text mb-0">
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>{schedule.startTime} - {schedule.endTime}<br/>
                          <i className="fas fa-user me-1"></i>{schedule.teacherName}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Schedule Grid */}
      {weeklySchedule.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h6><i className="fas fa-calendar-alt me-2"></i>Weekly Schedule Overview</h6>
          </div>
          <div className="card-body">
            <div className="row">
              {days.map(day => (
                <div key={day} className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className="card bg-light h-100">
                    <div className="card-header bg-info text-white text-center py-2">
                      <strong>{day}</strong>
                    </div>
                    <div className="card-body p-2">
                      {weeklySchedule
                        .filter(schedule => schedule.day === day)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(schedule => (
                          <div key={schedule.id} className="mb-2">
                            <div className="card card-body p-2 border">
                              <div className="small">
                                <div className="fw-bold text-primary">{schedule.startTime} - {schedule.endTime}</div>
                                <div className="fw-semibold text-truncate" title={schedule.courseTitle}>
                                  {schedule.courseCode}
                                </div>
                                <div className="text-muted text-truncate" title={schedule.teacherName}>
                                  {schedule.teacherName}
                                </div>
                                <div className="mt-1">
                                  {getStatusBadge(schedule.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                      {weeklySchedule.filter(schedule => schedule.day === day).length === 0 && (
                        <div className="text-center text-muted small py-3">
                          <i className="fas fa-calendar-times"></i><br/>
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
      {weeklySchedule.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h6><i className="fas fa-list me-2"></i>Detailed Schedule ({weeklySchedule.length} classes)</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Course</th>
                    <th>Teacher</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklySchedule
                    .sort((a, b) => {
                      const dayComparison = days.indexOf(a.day) - days.indexOf(b.day);
                      if (dayComparison === 0) {
                        return a.startTime.localeCompare(b.startTime);
                      }
                      return dayComparison;
                    })
                    .map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <span className="badge bg-info">{schedule.day}</span>
                      </td>
                      <td className="fw-semibold">{schedule.startTime} - {schedule.endTime}</td>
                      <td>
                        <div className="fw-bold">{schedule.courseCode}</div>
                        <small className="text-muted">{schedule.courseTitle}</small>
                      </td>
                      <td>{schedule.teacherName}</td>
                      <td>{getStatusBadge(schedule.status)}</td>
                      <td>
                        {schedule.status === 'upcoming' && (
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-bell me-1"></i>Remind
                          </button>
                        )}
                        {schedule.status === 'completed' && (
                          <button className="btn btn-sm btn-outline-success" disabled>
                            <i className="fas fa-check me-1"></i>Attended
                          </button>
                        )}
                        {schedule.status === 'ongoing' && (
                          <button className="btn btn-sm btn-warning">
                            <i className="fas fa-play me-1"></i>Join
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

export default MySchedule;