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
  const [newSessionDetected, setNewSessionDetected] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(new Date());
  const [activeCourseCode, setActiveCourseCode] = useState('');
  const [studentEnrolledCourses, setStudentEnrolledCourses] = useState([]);

  // Load active session and course info
  useEffect(() => {
    // Check for active session and load real teacher info
    checkActiveSession();
    
    // Start real-time polling for active sessions - faster polling for instant detection
    const pollInterval = setInterval(checkActiveSession, 1000); // Check every 1 second for instant detection
    
    return () => clearInterval(pollInterval); // Cleanup on unmount
  }, []);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const user = JSON.parse(localStorage.getItem('attendanceUser') || '{}');
      const studentId = user?.id;
      
      if (!token || !studentId) {
        console.log('🔐 No auth token or student ID found');
        resetSessionState();
        return;
      }
      
      console.log('🔍 Checking for active sessions for student:', studentId);
      
      // First, get student's enrolled courses for debugging
      try {
        const coursesRes = await fetch(`http://localhost:8080/api/attendance/student-courses?studentId=${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (coursesRes.ok) {
          const enrolledCourses = await coursesRes.json();
          console.log('📚 Student enrolled courses:', enrolledCourses);
          setStudentEnrolledCourses(enrolledCourses);
          
          if (enrolledCourses.length === 0) {
            console.log('⚠️ Student is not enrolled in any courses');
            resetSessionState();
            return;
          }
        }
      } catch (e) {
        console.log('Error fetching student courses:', e.message);
      }
      
      // Now check for active session across all enrolled courses
      const res = await fetch(`http://localhost:8080/api/attendance/active-for-student?studentId=${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📡 API Response Status:', res.status);
      
      if (res.ok) {
        const session = await res.json();
        console.log('📋 Session Response Data:', session);
        
        if (session && session.sessionID) {
          console.log('✅ Active session found:', session.sessionID, 'for course:', session.courseCode);
          
          // Check if this is a new session (different from stored one)
          const previousSessionId = localStorage.getItem('activeAttendanceSessionId');
          if (previousSessionId !== String(session.sessionID)) {
            setNewSessionDetected(true);
            console.log('🎉 NEW SESSION DETECTED! Course:', session.courseCode);
            
            // Play notification sound
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAbBjaL0/L');
              audio.volume = 0.3;
              audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
              console.log('Audio notification failed:', e);
            }
            
            setTimeout(() => setNewSessionDetected(false), 7000);
          }
          
          localStorage.setItem('activeAttendanceSessionId', String(session.sessionID));
          setIsSessionActive(true);
          setActiveCourseCode(session.courseCode); // Set the active course dynamically
          
          // Set basic course info dynamically based on detected course
          const courseInfo = {
            subject: session.courseCode,
            room: 'Room TBD',
            time: 'Active Session',
            isActive: true
          };
          setCurrentClass(courseInfo);
          
          // Extract teacher information
          if (session.teacherName && session.teacherUsername) {
            setTeacherName(session.teacherName);
            setTeacherUsername(session.teacherUsername);
            console.log('👨‍🏫 Teacher:', session.teacherName);
          }
          
          // Handle session pause/resume
          const isPaused = !session.isActive;
          setIsSessionPaused(isPaused);
          console.log('⏸️ Session paused:', isPaused);
          
          // Handle expiry time
          if (session.expiryTime) {
            const expiryDate = new Date(session.expiryTime);
            setSessionEndTime(expiryDate);
            
            const now = new Date();
            const remaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
            setTimeRemaining(remaining);
            console.log('⏱️ Time remaining:', remaining, 'seconds');
          }
          
        } else {
          console.log('❌ No active session in response');
          setNewSessionDetected(false);
          resetSessionState();
        }
        
        setLastCheckedTime(new Date());
      } else {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.log('🚫 Failed to fetch session:', res.status, res.statusText, errorText);
        
        if (res.status === 404) {
          console.log('🔍 404 Error - Check if endpoint exists');
        } else if (res.status === 401) {
          console.log('🔐 401 Error - Authentication issue');
        } else if (res.status === 500) {
          console.log('💥 500 Error - Server error, check backend logs');
        }
        
        resetSessionState();
      }
    } catch (e) {
      console.error('💥 Error checking active session:', e);
      resetSessionState();
    }
  };

  const resetSessionState = () => {
    setIsSessionActive(false);
    setIsSessionPaused(false);
    setTimeRemaining(0);
    setSessionEndTime(null);
    setTeacherName('');
    setTeacherUsername('');
    setActiveCourseCode('');
    localStorage.removeItem('activeAttendanceSessionId');
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
        if (session.teacherName && session.teacherUsername) {
          setTeacherName(session.teacherName);
          setTeacherUsername(session.teacherUsername);
        }
      }
    } catch (e) {
      console.error('Error fetching session details:', e);
    }
  };

  // Timer effect to update remaining time
  useEffect(() => {
    if (isSessionActive && sessionEndTime && timeRemaining > 0) {
      const timer = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((sessionEndTime.getTime() - now.getTime()) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setIsSessionActive(false);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isSessionActive, sessionEndTime, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const verifyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocationVerified(true);
          console.log('Location verified:', position.coords);
        },
        (error) => {
          alert('Location verification failed: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const verifyBiometric = async () => {
    if (window.PublicKeyCredential) {
      try {
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "Attendance System" },
            user: {
              id: new Uint8Array(16),
              name: "student@example.com",
              displayName: "Student"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              userVerification: "required"
            }
          }
        });
        
        setIsBiometricVerified(true);
        console.log('Biometric verified:', credential);
      } catch (error) {
        alert('Biometric verification failed: ' + error.message);
      }
    } else {
      alert('Biometric authentication is not supported by this browser.');
    }
  };

  const submitAttendance = async () => {
    if (!attendanceCode.trim()) {
      alert('Please enter the attendance code.');
      return;
    }

    if (!isLocationVerified) {
      alert('Please verify your location first.');
      return;
    }

    if (!isBiometricVerified) {
      alert('Please complete biometric verification first.');
      return;
    }

    if (!isSessionActive) {
      alert('No active attendance session.');
      return;
    }

    if (timeRemaining <= 0) {
      alert('Attendance session has expired.');
      return;
    }

    if (attendanceCode.trim().length < 5) {
      alert('Please enter a valid attendance code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      const user = JSON.parse(localStorage.getItem('attendanceUser') || '{}');
      const studentId = user?.id;
      const res = await fetch(`http://localhost:8080/api/attendance/mark?code=${encodeURIComponent(attendanceCode.trim())}&studentId=${studentId}&courseCode=${activeCourseCode}`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        alert(`✅ Attendance marked successfully for ${activeCourseCode}! Your attendance has been recorded.`);
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
        <h3 className="text-muted">Loading Course Information...</h3>
        <p>Checking your enrolled courses and active sessions...</p>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="d-flex justify-content-center align-items-center mb-4">
            <div className="spinner-border text-primary me-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <i className="fas fa-search fa-3x text-primary"></i>
          </div>
          <h3 className="text-primary">🔍 Searching for Active Sessions...</h3>
          <p className="mb-4">
            Waiting for your teacher to start an attendance session for any of your enrolled courses.
            {studentEnrolledCourses.length > 0 && (
              <>
                <br/>
                <strong>Your courses:</strong> {studentEnrolledCourses.join(', ')}
              </>
            )}
          </p>
          
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="alert alert-info">
                <h6><i className="fas fa-info-circle me-2"></i>System Status</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small>
                      <i className="fas fa-clock me-2"></i>
                      Last checked: <strong>{lastCheckedTime.toLocaleTimeString()}</strong>
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small>
                      <i className="fas fa-sync-alt me-2"></i>
                      Auto-refresh: <span className="text-success">Every 1 second</span>
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-warning">
                <h6><i className="fas fa-exclamation-triangle me-2"></i>Instructions</h6>
                <ol className="mb-0">
                  <li>Ask your teacher to <strong>activate attendance</strong> for any of your courses</li>
                  <li>This page will <strong>automatically detect</strong> when a session becomes active</li>
                  <li>You'll see a <strong>notification</strong> and hear a sound when detected</li>
                  <li><strong>Keep this page open</strong> - no need to refresh manually</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSessionPaused) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-pause-circle fa-4x text-warning mb-3"></i>
        <h3 className="text-warning">Attendance Session Paused</h3>
        <p>The attendance session for <strong>{activeCourseCode}</strong> has been paused by your teacher. Please wait for it to be resumed.</p>
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
      {/* New Session Notification */}
      {newSessionDetected && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <div className="d-flex align-items-center">
            <div className="spinner-grow spinner-grow-sm text-success me-3" role="status"></div>
            <div>
              <strong>🎉 New Attendance Session Detected!</strong>
              <br/>
              <small>Teacher {teacherName} has started a session for <strong>{activeCourseCode}</strong>. You can now mark your attendance.</small>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={() => setNewSessionDetected(false)}></button>
        </div>
      )}
      
      {/* Current Class Info */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5><i className="fas fa-chalkboard-teacher me-2"></i>Active Class: {activeCourseCode}</h5>
              <small className="opacity-75">
                <i className="fas fa-sync-alt me-1"></i>
                Last checked: {lastCheckedTime.toLocaleTimeString()} • Checking every second
              </small>
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
              <h5 className="text-primary">{activeCourseCode} - Active Session</h5>
              {teacherName && teacherUsername ? (
                <p className="mb-1"><strong>Teacher:</strong> {teacherName} ({teacherUsername})</p>
              ) : (
                <p className="mb-1"><strong>Teacher:</strong> <em>Loading...</em></p>
              )}
              <p className="mb-1"><strong>Status:</strong> 
                <span className={`badge ms-2 ${isSessionActive ? 'bg-success' : 'bg-secondary'}`}>
                  {isSessionActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <div className="text-end">
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{width: `${Math.max(0, (timeRemaining / 120) * 100)}%`}}
                  ></div>
                </div>
                <small className="text-muted">Session Progress</small>
              </div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12">
              <div className="alert alert-info mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Complete all steps below to mark your attendance for <strong>{activeCourseCode}</strong>
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
                  placeholder={`Enter code for ${activeCourseCode}`}
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
              <button 
                className={`btn ${isLocationVerified ? 'btn-success' : 'btn-outline-primary'} mb-3`}
                onClick={verifyLocation}
                disabled={isLocationVerified}
              >
                {isLocationVerified ? (
                  <>
                    <i className="fas fa-check-circle me-2"></i>Verified
                  </>
                ) : (
                  <>
                    <i className="fas fa-crosshairs me-2"></i>Verify Location
                  </>
                )}
              </button>
              {isLocationVerified && (
                <div className="text-success">
                  <i className="fas fa-check-circle me-2"></i>Location Verified
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Biometric Verification */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6><i className="fas fa-fingerprint me-2"></i>Step 3: Biometric Verification</h6>
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                <i className={`fas fa-fingerprint fa-3x ${isBiometricVerified ? 'text-success' : 'text-muted'}`}></i>
              </div>
              <button 
                className={`btn ${isBiometricVerified ? 'btn-success' : 'btn-outline-primary'} mb-3`}
                onClick={verifyBiometric}
                disabled={isBiometricVerified}
              >
                {isBiometricVerified ? (
                  <>
                    <i className="fas fa-check-circle me-2"></i>Verified
                  </>
                ) : (
                  <>
                    <i className="fas fa-fingerprint me-2"></i>Verify Identity
                  </>
                )}
              </button>
              {isBiometricVerified && (
                <div className="text-success">
                  <i className="fas fa-check-circle me-2"></i>Identity Verified
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <button 
                className={`btn btn-lg ${canSubmit ? 'btn-success' : 'btn-secondary'} px-5`}
                onClick={submitAttendance}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Marking Attendance...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Mark Attendance for {activeCourseCode}
                  </>
                )}
              </button>
              
              <div className="mt-3">
                <small className="text-muted">
                  Progress: {(attendanceCode.length > 0 ? 1 : 0) + 
                            (isLocationVerified ? 1 : 0) + 
                            (isBiometricVerified ? 1 : 0)} of 3 steps completed
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;