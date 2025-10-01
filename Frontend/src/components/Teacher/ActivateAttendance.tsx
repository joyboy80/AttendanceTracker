import React, { useState, useEffect } from 'react';

const ActivateAttendance = () => {
  const [currentClass, setCurrentClass] = useState<any>(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [timeLimit, setTimeLimit] = useState(120); // Default 120 seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [attendedStudents, setAttendedStudents] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [sessionAbsoluteEndTime, setSessionAbsoluteEndTime] = useState<Date | null>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);

  useEffect(() => {
    // Load dynamic course information from localStorage
    const activeCourseCode = localStorage.getItem('activeCourseCode') || 'Unknown Course';
    const activeCourseTitle = localStorage.getItem('activeCourseTitle') || 'Unknown Title';
    
    const mockClass = {
      subject: `${activeCourseCode} - ${activeCourseTitle}`,
      room: 'Room 101',
      time: '9:00 AM - 11:00 AM',
      totalStudents: 35,
      isScheduled: true
    };
    setCurrentClass(mockClass);
    
    // Load session from localStorage or check for active session
    const storedCode = localStorage.getItem('activeAttendanceCode') || '';
    const storedSession = localStorage.getItem('activeAttendanceSessionId') || '';
    
    if (storedCode && storedSession) {
      setAttendanceCode(storedCode);
      // Check if session is still active
      checkSessionStatus(storedSession);
      // Load existing attendees and session statistics
      loadAttendees(storedSession);
      loadSessionStatistics(storedSession);
    } else {
      // Check for any active session for this course
      checkActiveSession();
    }
  }, []);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const res = await fetch('http://localhost:8080/api/attendance/active?courseCode=CS101', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const session = await res.json();
        if (session && session.sessionID) {
          setAttendanceCode(session.accessCode);
          localStorage.setItem('activeAttendanceCode', session.accessCode);
          localStorage.setItem('activeAttendanceSessionId', String(session.sessionID));
          checkSessionStatus(session.sessionID);
          loadAttendees(session.sessionID);
          loadSessionStatistics(session.sessionID);
        } else {
          // No active session found, generate a new one automatically
          generateCode();
        }
      }
    } catch (e) {
      console.error('Error checking active session:', e);
      // If there's an error, generate a new session as fallback
      generateCode();
    }
  };

  const checkSessionStatus = async (sessionId) => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/session-status?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isActive) {
          setIsActive(true);
          setTimeRemaining(data.remainingTime);
          // Get session details to set start time
          await loadSessionDetails(sessionId);
        }
      }
    } catch (e) {
      console.error('Error checking session status:', e);
    }
  };

  const loadSessionDetails = async (sessionId) => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/session-details?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const session = await res.json();
        if (session.scheduledTime) {
          setSessionStartTime(new Date(session.scheduledTime));
        }
        if (session.expiryTime) {
          setSessionAbsoluteEndTime(new Date(session.expiryTime));
        }
        setIsPaused(!session.isActive);
      }
    } catch (e) {
      console.error('Error loading session details:', e);
    }
  };

  const loadAttendees = async (sessionId) => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/attendees-details?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const attendees = await res.json();
        setAttendedStudents(attendees.map((att, index) => ({
          id: att.attendanceId,
          name: att.studentName,
          rollNo: att.rollNumber,
          time: new Date(att.timestamp).toLocaleTimeString(),
          status: att.status,
          sessionStart: att.sessionStart,
          sessionEnd: att.sessionEnd
        })));
      }
    } catch (e) {
      console.error('Error loading attendees:', e);
    }
  };

  const loadSessionStatistics = async (sessionId) => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/session-statistics?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const stats = await res.json();
        setSessionStats(stats);
        if (stats.sessionStart) {
          setSessionStartTime(new Date(stats.sessionStart));
        }
        if (stats.sessionEnd) {
          setSessionEndTime(new Date(stats.sessionEnd));
        }
      }
    } catch (e) {
      console.error('Error loading session statistics:', e);
    }
  };

  const mockAttendedStudents = [
    { id: 1, name: 'John Smith', rollNo: 'CS001', time: '9:05 AM' },
    { id: 2, name: 'Jane Doe', rollNo: 'CS002', time: '9:07 AM' },
    { id: 3, name: 'Mike Johnson', rollNo: 'CS003', time: '9:10 AM' },
  ];

  // Real-time countdown timer based on absolute endTime
  useEffect(() => {
    if (isActive && sessionAbsoluteEndTime && !isPaused) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = sessionAbsoluteEndTime.getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        setTimeRemaining(remaining);
        
        // If time is up, session has expired
        if (remaining <= 0) {
          setIsActive(false);
          clearInterval(timer);
        }
      }, 1000);
      
      // Initial calculation
      const now = new Date().getTime();
      const endTime = sessionAbsoluteEndTime.getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      return () => clearInterval(timer);
    }
  }, [isActive, sessionAbsoluteEndTime, isPaused]);

  const generateCode = async () => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const user = JSON.parse(localStorage.getItem('attendanceUser') || '{}');
      
      const res = await fetch(`http://localhost:8080/api/attendance/generate?courseCode=CS101&teacherName=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&teacherUsername=${encodeURIComponent(user.username)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAttendanceCode(data.accessCode);
        localStorage.setItem('activeAttendanceCode', data.accessCode);
        localStorage.setItem('activeAttendanceSessionId', String(data.sessionId));
        
        // Load attendees immediately after generating code
        loadAttendees(data.sessionId);
        loadSessionStatistics(data.sessionId);
      } else {
        alert('Failed to generate attendance code');
      }
    } catch (e) {
      alert('Error generating code: ' + e.message);
    }
  };

  const startAttendance = async () => {
    if (!attendanceCode) {
      alert('Please generate a code first');
      return;
    }
    try {
      const token = localStorage.getItem('attendanceToken');
      const sessionId = localStorage.getItem('activeAttendanceSessionId');
      if (sessionId) {
        const res = await fetch(`http://localhost:8080/api/attendance/start?sessionId=${sessionId}&duration=${timeLimit}`, { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          alert('Failed to start attendance session');
          return;
        }
        const session = await res.json();
        setSessionStartTime(new Date(session.scheduledTime));
        setSessionEndTime(new Date(session.expiryTime));
        setSessionAbsoluteEndTime(new Date(session.expiryTime));
        setTimeRemaining(timeLimit);
        setIsActive(true);
        setIsPaused(false);
        // Load session statistics and start polling for attendees
        loadSessionStatistics(sessionId);
        startAttendeePolling();
      }
    } catch (e) {
      alert('Network error: ' + e.message);
      return;
    }
  };

  const startAttendeePolling = () => {
    const sessionId = localStorage.getItem('activeAttendanceSessionId');
    if (!sessionId) return;
    
    const pollInterval = setInterval(async () => {
      if (!isActive) {
        clearInterval(pollInterval);
        return;
      }
      
      try {
        const token = localStorage.getItem('attendanceToken');
        const res = await fetch(`http://localhost:8080/api/attendance/attendees-details?sessionId=${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const attendees = await res.json();
          setAttendedStudents(attendees.map((att, index) => ({
            id: att.attendanceId,
            name: att.studentName,
            rollNo: att.rollNumber,
            time: new Date(att.timestamp).toLocaleTimeString(),
            status: att.status
          })));
        }
      } catch (e) {
        console.error('Error fetching attendees:', e);
      }
    }, 1000); // Poll every 1 second for real-time updates
  };

  const stopAttendance = async () => {
    try {
      const sessionId = localStorage.getItem('activeAttendanceSessionId');
      if (!sessionId) {
        alert('No active session to stop');
        return;
      }

      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/stop?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const result = await res.json();
        setIsActive(false);
        setIsPaused(false);
        setTimeRemaining(0);
        setSessionEndTime(new Date(result.endTime));
        alert('Attendance session stopped successfully');
        
        // Load final statistics
        loadSessionStatistics(sessionId);
      } else {
        const error = await res.json();
        alert('Failed to stop attendance session: ' + (error.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Network error: ' + e.message);
    }
  };

  const pauseAttendance = async () => {
    try {
      const sessionId = localStorage.getItem('activeAttendanceSessionId');
      if (!sessionId) {
        alert('No active session to pause');
        return;
      }

      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/pause?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const result = await res.json();
        setIsPaused(true);
        alert('Attendance session paused successfully');
      } else {
        const error = await res.json();
        alert('Failed to pause attendance session: ' + (error.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Network error: ' + e.message);
    }
  };

  const resumeAttendance = async () => {
    try {
      const sessionId = localStorage.getItem('activeAttendanceSessionId');
      if (!sessionId) {
        alert('No session to resume');
        return;
      }

      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/resume?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const result = await res.json();
        setIsPaused(false);
        // Update expiry time with the new calculated time
        if (result.expiryTime) {
          const newExpiryTime = new Date(result.expiryTime);
          setSessionAbsoluteEndTime(newExpiryTime);
          const now = new Date();
          const remainingSeconds = Math.floor((newExpiryTime.getTime() - now.getTime()) / 1000);
          setTimeRemaining(Math.max(0, remainingSeconds));
        }
        alert('Attendance session resumed successfully');
      } else {
        const error = await res.json();
        alert('Failed to resume attendance session: ' + (error.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Network error: ' + e.message);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const markStudentManually = (name: string) => {
    setAttendedStudents(prev => [...prev, { id: prev.length + 1, name, rollNo: '-', time: new Date().toLocaleTimeString() }]);
  };

  return (
    <div className="fade-in">
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="fas fa-bolt me-2"></i>Activate Attendance</h5>
              <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>{isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="card-body">
              <div className="row align-items-end">
                <div className="col-md-4 mb-3">
                    <label className="form-label">Attendance Code</label>
                    <div className="input-group">
                    <input type="text" className="form-control" value={attendanceCode} readOnly />
                    <button className="btn btn-outline-primary" onClick={generateCode}><i className="fas fa-sync-alt"></i></button>
                  </div>
                    </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Time Limit (seconds)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={timeLimit}
                    min={1}
                    max={120}
                    onChange={(e) => setTimeLimit(Math.min(parseInt(e.target.value) || 120, 120))}
                  />
                  <small className="text-muted">Maximum 120 seconds</small>
                </div>
                <div className="col-md-4 mb-3 d-flex gap-2">
                  {!isActive ? (
                    <button className="btn btn-primary w-100" onClick={startAttendance}>
                      <i className="fas fa-play me-2"></i>Start
                    </button>
                  ) : (
                    <>
                      {!isPaused ? (
                        <button className="btn btn-warning" onClick={pauseAttendance}>
                          <i className="fas fa-pause me-2"></i>Pause
                        </button>
                      ) : (
                        <button className="btn btn-success" onClick={resumeAttendance}>
                          <i className="fas fa-play me-2"></i>Resume
                        </button>
                      )}
                      <button className="btn btn-danger" onClick={stopAttendance}>
                        <i className="fas fa-stop me-2"></i>Stop
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isActive && (
                <div className={`alert ${isPaused ? 'alert-warning' : 'alert-info'}`}>
                  <div className="row">
                    <div className="col-md-6">
                      {isPaused ? (
                        <>
                          <i className="fas fa-pause-circle me-2"></i>
                          Session Status: <strong>Paused</strong>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-clock me-2"></i>
                          Time Remaining: <strong>{formatTime(timeRemaining)}</strong>
                        </>
                      )}
                    </div>
                    <div className="col-md-6 text-end">
                      <i className="fas fa-users me-2"></i>
                      Attended: <strong>{attendedStudents.length}</strong>
                    </div>
                  </div>
                  {sessionStartTime && sessionEndTime && (
                    <div className="row mt-2">
                      <div className="col-md-6">
                        <small className="text-muted">
                          <i className="fas fa-play me-1"></i>
                          Started: {sessionStartTime.toLocaleTimeString()}
                        </small>
                      </div>
                      <div className="col-md-6 text-end">
                        <small className="text-muted">
                          <i className="fas fa-stop me-1"></i>
                          Ends: {sessionEndTime.toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <h6 className="mb-3">
                  <i className="fas fa-list me-2"></i>Attended Students
                  <small className="text-muted ms-2">
                    (Only students who marked attendance within the current session time window)
                  </small>
                </h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Attendance Time</th>
                        <th>Status</th>
                        <th>Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendedStudents.map((s, idx) => (
                        <tr key={s.id}>
                          <td>{idx + 1}</td>
                          <td><strong>{s.rollNo}</strong></td>
                          <td>{s.name}</td>
                          <td>{s.time}</td>
                          <td><span className="badge bg-success">{s.status || 'Present'}</span></td>
                          <td><code className="text-primary">{attendanceCode}</code></td>
                        </tr>
                      ))}
                      {attendedStudents.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            <i className="fas fa-users fa-2x mb-2"></i>
                            <br />
                            No students have marked attendance yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>

              <div className="mt-3">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => markStudentManually('Manual Entry')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Mark Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0"><i className="fas fa-chalkboard-teacher me-2"></i>Current Class</h6>
            </div>
            <div className="card-body">
              {currentClass ? (
                <ul className="list-unstyled mb-0">
                  <li><strong>Subject:</strong> {currentClass.subject}</li>
                  <li><strong>Room:</strong> {currentClass.room}</li>
                  <li><strong>Time:</strong> {currentClass.time}</li>
                  <li><strong>Total Students:</strong> {currentClass.totalStudents}</li>
                </ul>
              ) : (
                <div className="text-muted">No class scheduled currently.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Tips</h6>
        </div>
            <div className="card-body">
              <ul className="mb-0">
                <li>Share the code securely with your class.</li>
                <li>Set a reasonable time window.</li>
                <li>Export the list for records.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateAttendance;
