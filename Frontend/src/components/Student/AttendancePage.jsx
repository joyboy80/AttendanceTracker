import React, { useState, useEffect } from 'react';

const AttendancePage = () => {
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');

  // Load active session and course info
  useEffect(() => {
    // Set basic course info (this could also come from props or route params)
    const courseInfo = {
      subject: 'Computer Science 101',
      room: 'Room 101',
      time: '9:00 AM - 11:00 AM',
      isActive: true
    };
    setCurrentClass(courseInfo);
    
    // Check for active session and load real teacher info
    checkActiveSession();
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
          // Store session ID for status checking, but don't auto-fill the code
          localStorage.setItem('activeAttendanceSessionId', String(session.sessionID));
          setIsSessionActive(true);
          
          // Extract and store teacher information
          if (session.teacherName && session.teacherUsername) {
            setTeacherName(session.teacherName);
            setTeacherUsername(session.teacherUsername);
          }
          
          // Check if session is paused
          setIsSessionPaused(!session.isActive);
          
          // Store absolute end time for countdown timer
          if (session.expiryTime) {
            setSessionEndTime(new Date(session.expiryTime));
          }
          
          // Check session status and get remaining time
          await checkSessionStatus(session.sessionID);
        } else {
          // No active session
          setIsSessionActive(false);
          setIsSessionPaused(false);
          setTimeRemaining(0);
          setSessionEndTime(null);
          setTeacherName('');
          setTeacherUsername('');
          localStorage.removeItem('activeAttendanceSessionId');
        }
      } else {
        // No active session or error
        setIsSessionActive(false);
        setIsSessionPaused(false);
        setTimeRemaining(0);
        setSessionEndTime(null);
        setTeacherName('');
        setTeacherUsername('');
        localStorage.removeItem('activeAttendanceSessionId');
      }
    } catch (e) {
      console.error('Error checking active session:', e);
      // Fallback - check if we have stored session ID
      const storedSessionId = localStorage.getItem('activeAttendanceSessionId') || '';
      if (storedSessionId) {
        await checkSessionStatus(storedSessionId);
        // Also fetch session details for countdown on page refresh
        await fetchSessionDetails(storedSessionId);
      } else {
        setIsSessionActive(false);
        setIsSessionPaused(false);
        setTimeRemaining(0);
        setSessionEndTime(null);
        setTeacherName('');
        setTeacherUsername('');
      }
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
        setIsSessionActive(data.isActive);
        setTimeRemaining(data.remainingTime);
      }
    } catch (e) {
      console.error('Error checking session status:', e);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const res = await fetch(`http://localhost:8080/api/attendance/session-details?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const session = await res.json();
        if (session.expiryTime) {
          setSessionEndTime(new Date(session.expiryTime));
        }
        setIsSessionPaused(!session.isActive);
        
        // Extract teacher information if available
        if (session.teacherName && session.teacherUsername) {
          setTeacherName(session.teacherName);
          setTeacherUsername(session.teacherUsername);
        }
      }
    } catch (e) {
      console.error('Error fetching session details:', e);
    }
  };

  // Real-time countdown timer based on absolute endTime
  useEffect(() => {
    if (isSessionActive && sessionEndTime && !isSessionPaused) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = sessionEndTime.getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        setTimeRemaining(remaining);
        
        // If time is up, session has expired
        if (remaining <= 0) {
          setIsSessionActive(false);
          clearInterval(timer);
        }
      }, 1000);
      
      // Initial calculation
      const now = new Date().getTime();
      const endTime = sessionEndTime.getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      return () => clearInterval(timer);
    }
  }, [isSessionActive, sessionEndTime, isSessionPaused]);

  // Periodic server synchronization for pause/resume states
  useEffect(() => {
    if (isSessionActive) {
      const syncTimer = setInterval(async () => {
        const sessionId = localStorage.getItem('activeAttendanceSessionId');
        if (sessionId) {
          await fetchSessionDetails(sessionId);
        }
      }, 5000); // Check every 5 seconds for pause/resume changes
      
      return () => clearInterval(syncTimer);
    }
  }, [isSessionActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLocationVerification = async () => {
    if (navigator.geolocation) {
      setIsLocationVerified(false);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock location verification
          const { latitude, longitude } = position.coords;
          console.log('Location:', latitude, longitude);
          
          // Simulate location verification
          setTimeout(() => {
            setIsLocationVerified(true);
          }, 1500);
        },
        (error) => {
          alert('Location access denied. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleBiometricVerification = async () => {
    setIsBiometricVerified(false);
    
    // Simulate WebAuthn biometric verification
    try {
      // Mock biometric verification process
      setTimeout(() => {
        setIsBiometricVerified(true);
      }, 2000);
    } catch (error) {
      alert('Biometric verification failed. Please try again.');
    }
  };

  const handleSubmitAttendance = async () => {
    if (!attendanceCode || !isLocationVerified || !isBiometricVerified) {
      alert('Please complete all verification steps.');
      return;
    }

    // Check if there's an active session
    if (!isSessionActive || timeRemaining <= 0) {
      alert('No active attendance session. Please wait for your teacher to start the session.');
      return;
    }

    // Check if session is paused
    if (isSessionPaused) {
      alert('Attendance session is currently paused by the teacher. Please wait for it to be resumed.');
      return;
    }

    // Basic validation for attendance code format
    if (attendanceCode.trim().length < 5) {
      alert('Please enter a valid attendance code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      const user = JSON.parse(localStorage.getItem('attendanceUser') || '{}');
      const studentId = user?.id;
      const res = await fetch(`http://localhost:8080/api/attendance/mark?code=${encodeURIComponent(attendanceCode.trim())}&studentId=${studentId}&courseCode=CS101`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        alert('✅ Attendance marked successfully! Your attendance has been recorded.');
        // The teacher's dashboard will automatically update via polling
      } else {
        const errorData = await res.json();
        alert('❌ Failed to mark attendance: ' + (errorData.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Network error: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentClass) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-clock fa-4x text-muted mb-3"></i>
        <h3 className="text-muted">No Active Class</h3>
        <p>There are no active classes at the moment. Check your schedule for upcoming classes.</p>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-hourglass-end fa-4x text-muted mb-3"></i>
        <h3 className="text-muted">No Active Attendance Session</h3>
        <p>There is no active attendance session at the moment. Wait for your teacher to start the session.</p>
      </div>
    );
  }

  if (isSessionPaused) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-pause-circle fa-4x text-warning mb-3"></i>
        <h3 className="text-warning">Attendance Session Paused</h3>
        <p>The attendance session has been paused by your teacher. Please wait for it to be resumed.</p>
        <div className="alert alert-warning mt-3">
          <i className="fas fa-info-circle me-2"></i>
          Your teacher will resume the session when ready. Keep this page open.
        </div>
      </div>
    );
  }

  const canSubmit = attendanceCode.length > 0 && isLocationVerified && isBiometricVerified && isSessionActive && !isSessionPaused && timeRemaining > 0;

  return (
    <div className="fade-in">
      {/* Current Class Info */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5><i className="fas fa-chalkboard-teacher me-2"></i>Active Class</h5>
            </div>
            <div className="text-end">
              <div className="h5 mb-0">
                {timeRemaining > 0 ? `Time Remaining: ${formatTime(timeRemaining)}` : 'Session Expired'}
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5 className="text-primary">{currentClass.subject}</h5>
              {teacherName && teacherUsername ? (
                <p className="mb-1"><strong>Teacher:</strong> {teacherName} ({teacherUsername})</p>
              ) : (
                <p className="mb-1"><strong>Teacher:</strong> <em>Waiting for session...</em></p>
              )}
              <p className="mb-1"><strong>Room:</strong> {currentClass.room}</p>
              <p className="mb-0"><strong>Time:</strong> {currentClass.time}</p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="alert alert-info mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Complete all steps below to mark your attendance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Steps */}
      <div className="row">
        {/* Step 1: Attendance Code */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6><i className="fas fa-key me-2"></i>Step 1: Enter Code</h6>
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className={`fas fa-keyboard fa-3x ${attendanceCode.length > 0 ? 'text-success' : 'text-muted'}`}></i>
              </div>
              <div className="mb-3">
                <label htmlFor="attendanceCode" className="form-label">Attendance Code</label>
                <input
                  type="text"
                  className="form-control text-center"
                  id="attendanceCode"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  placeholder="Enter attendance code provided by teacher"
                  style={{ fontSize: '1.0rem' }}
                />
              </div>
              {attendanceCode.length > 0 && (
                <div className="text-success">
                  <i className="fas fa-check-circle me-2"></i>Code Entered
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Location Verification */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6><i className="fas fa-map-marker-alt me-2"></i>Step 2: Verify Location</h6>
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className={`fas fa-map-marker-alt fa-3x ${isLocationVerified ? 'text-success' : 'text-muted'}`}></i>
              </div>
              <p className="text-muted small">Verify you're in the classroom</p>
              <button
                className={`btn ${isLocationVerified ? 'btn-success' : 'btn-outline-primary'} w-100`}
                onClick={handleLocationVerification}
                disabled={isLocationVerified}
              >
                {isLocationVerified ? (
                  <>
                    <i className="fas fa-check me-2"></i>Verified
                  </>
                ) : (
                  <>
                    <i className="fas fa-crosshairs me-2"></i>Verify Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Biometric Verification */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6><i className="fas fa-fingerprint me-2"></i>Step 3: Biometric Scan</h6>
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className={`fas fa-fingerprint fa-3x ${isBiometricVerified ? 'text-success' : 'text-muted'}`}></i>
              </div>
              <p className="text-muted small">Scan your fingerprint</p>
              <button
                className={`btn ${isBiometricVerified ? 'btn-success' : 'btn-outline-primary'} w-100`}
                onClick={handleBiometricVerification}
                disabled={isBiometricVerified}
              >
                {isBiometricVerified ? (
                  <>
                    <i className="fas fa-check me-2"></i>Verified
                  </>
                ) : (
                  <>
                    <i className="fas fa-fingerprint me-2"></i>Scan Fingerprint
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          className="btn btn-success btn-lg px-5"
          onClick={handleSubmitAttendance}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Marking Attendance...
            </>
          ) : (
            <>
              <i className="fas fa-check-double me-2"></i>
              Mark Attendance
            </>
          )}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="card mt-4">
        <div className="card-body">
          <div className="progress" style={{ height: '10px' }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${((attendanceCode.length > 0 ? 1 : 0) + 
                         (isLocationVerified ? 1 : 0) + 
                         (isBiometricVerified ? 1 : 0)) * 33.33}%`
              }}
            ></div>
          </div>
          <div className="text-center mt-2">
            <small className="text-muted">
              Progress: {(attendanceCode.length > 0 ? 1 : 0) + 
                        (isLocationVerified ? 1 : 0) + 
                        (isBiometricVerified ? 1 : 0)} of 3 steps completed
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;