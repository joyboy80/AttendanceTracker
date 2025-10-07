import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AttendancePage = () => {
  const { user } = useAuth();
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
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [fingerprintLoading, setFingerprintLoading] = useState(true);
  
  // Step completion tracking
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);
  const [step3Complete, setStep3Complete] = useState(false);

  // Check fingerprint registration status
  useEffect(() => {
    const checkFingerprintStatus = async () => {
      if (!user?.id) return;

      try {
        setFingerprintLoading(true);
        const response = await fetch(`http://localhost:8080/api/attendance/fingerprint-status/${user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHasFingerprint(data.hasFingerprint);
        }
      } catch (err) {
        console.error('Error checking fingerprint status:', err);
        setHasFingerprint(false);
      } finally {
        setFingerprintLoading(false);
      }
    };

    checkFingerprintStatus();
  }, [user]);

  // Load active session and course info
  useEffect(() => {
    // Set basic course info (this could also come from props or route params)
    const courseInfo = {
      subject: 'Computer Science 101',
      room: 'Room 3307',
      time: '9:00 AM - 11:00 AM',
      isActive: true
    };
    setCurrentClass(courseInfo);
    
    // Only start polling if user is available
    if (user && user.id) {
      // Check for active session immediately
      checkActiveSession();
      
      // Set up automatic polling for active sessions every 2 seconds
      const pollInterval = setInterval(() => {
        console.log('🔄 Polling for active sessions...');
        checkActiveSession();
      }, 2000);
      
      // Cleanup interval on component unmount
      return () => {
        console.log('🧹 Cleaning up polling interval');
        clearInterval(pollInterval);
      };
    }
  }, [user]); // Add user as dependency

  const checkActiveSession = async () => {
    try {
      if (!user || !user.id) {
        console.log('❌ No user or user ID available');
        return;
      }
      
      const token = localStorage.getItem('attendanceToken');
      console.log('🔍 Checking for active session for student ID:', user.id);
      
      const res = await fetch(`http://localhost:8080/api/attendance/active-for-student?studentId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📡 API Response Status:', res.status);
      
      if (res.ok) {
        const session = await res.json();
        console.log('📋 Session Response Data:', session);
        console.log('🔍 Session type:', typeof session);
        console.log('🔍 Session keys:', session ? Object.keys(session) : 'null/undefined');
        
        // Handle different response formats
        if (session && (session.sessionID || session.sessionId)) {
          const sessionId = session.sessionID || session.sessionId;
          console.log('✅ Active session found:', sessionId);
          
          // Store session ID for status checking, but don't auto-fill the code
          localStorage.setItem('activeAttendanceSessionId', String(sessionId));
          // Show notification if this is a new session detection
          const wasActive = isSessionActive;
          setIsSessionActive(true);
          
          if (!wasActive) {
            console.log('🎉 NEW SESSION DETECTED! Showing notification...');
            // You could add a toast notification here
          }
          
          // Extract and store teacher information
          if (session.teacherName && session.teacherUsername) {
            console.log('👨‍🏫 Teacher:', session.teacherName);
            setTeacherName(session.teacherName);
            setTeacherUsername(session.teacherUsername);
          }
          
          // Update current class with real course information
          if (session.courseCode) {
            console.log('📚 Course Code:', session.courseCode);
            setCurrentClass({
              subject: session.courseCode,
              room: 'Room 3307', // Could be enhanced to get from database
              time: session.expiryTime ? new Date(session.expiryTime).toLocaleTimeString() : 'Active Now',
              isActive: true
            });
          }
          
          // Check if session is paused
          const sessionIsActive = session.isActive !== false; // Handle null/undefined as active
          setIsSessionPaused(!sessionIsActive);
          console.log('🎮 Session Active:', sessionIsActive);
          
          // Store absolute end time for countdown timer
          if (session.expiryTime) {
            const expiryDate = new Date(session.expiryTime);
            setSessionEndTime(expiryDate);
            console.log('⏰ Session expires at:', expiryDate);
            
            // Calculate remaining time
            const now = new Date();
            const remaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
            setTimeRemaining(remaining);
            console.log('⏱️ Time remaining:', remaining, 'seconds');
          }
          
          // Check session status and get remaining time
          await checkSessionStatus(sessionId);
        } else {
          console.log('❌ No active session found or invalid session data');
          console.log('🐛 Session object:', session);
          console.log('🐛 Session is null?', session === null);
          console.log('🐛 Session is undefined?', session === undefined);
          console.log('🐛 Session is empty object?', session && Object.keys(session).length === 0);
          
          // No active session - but only update state if we're not currently showing an active session
          // This prevents flickering during polling
          if (isSessionActive) {
            console.log('🔄 Session ended, updating state to inactive');
          }
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
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    if (!attendanceCode.trim()) {
      alert('Please enter the attendance code first.');
      return;
    }

    setIsLocationVerified(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('🌍 Student Location captured:', latitude, longitude);
          console.log('🎫 Using attendance code:', attendanceCode);

          const requestData = {
            studentId: user.id,
            latitude: latitude,
            longitude: longitude,
            attendanceCode: attendanceCode
          };
          
          console.log('📡 Sending location verification request:', requestData);

          // Send location to backend for verification
          const response = await fetch('http://localhost:8080/api/attendance/verify-location', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

          console.log('📨 Response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Location verification result:', result);
            
            if (result.verified) {
              setIsLocationVerified(true);
              setStep2Complete(true);
              alert(`✅ ${result.message}`);
              
              // Log teacher location info if available
              if (result.teacherLocation) {
                console.log('👨‍🏫 Teacher location:', result.teacherLocation);
              }
            } else {
              console.log('❌ Location verification failed:', result.message);
              alert(`❌ Location verification failed: ${result.message}`);
              setIsLocationVerified(false);
              setStep2Complete(false);
            }
          } else {
            const errorData = await response.json();
            console.error('❌ Server error:', errorData);
            alert(`Location verification failed: ${errorData.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('❌ Location verification error:', error);
          alert('Failed to verify location. Please try again.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Location access denied. Please enable location services.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please allow location access and try again.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable. Please try again.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleBiometricVerification = async () => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      alert('WebAuthn is not supported in this browser');
      return;
    }

    setIsBiometricVerified(false);
    
    try {
      // Step 1: Get authentication options
      const optionsResponse = await fetch('http://localhost:8080/api/attendance/authentication-options', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || 'Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Convert Base64URL strings to ArrayBuffers
      const credentialRequestOptions = {
        publicKey: {
          challenge: base64URLToArrayBuffer(options.challenge),
          timeout: options.timeout,
          rpId: options.rpId,
          allowCredentials: options.allowCredentials.map(cred => ({
            ...cred,
            id: base64URLToArrayBuffer(cred.id),
          })),
          userVerification: options.userVerification,
        },
      };

      // Step 2: Get assertion
      const assertion = await navigator.credentials.get(credentialRequestOptions);

      if (!assertion) {
        throw new Error('Failed to get assertion');
      }

      // Step 3: Verify fingerprint and mark attendance automatically
      const authenticationData = {
        id: assertion.id,
        rawId: arrayBufferToBase64URL(assertion.rawId),
        type: assertion.type,
        response: {
          clientDataJSON: arrayBufferToBase64URL(assertion.response.clientDataJSON),
          authenticatorData: arrayBufferToBase64URL(assertion.response.authenticatorData),
          signature: arrayBufferToBase64URL(assertion.response.signature),
          userHandle: assertion.response.userHandle ? 
            arrayBufferToBase64URL(assertion.response.userHandle) : null,
        },
        userId: user.id,
      };

      // Verify fingerprint and mark attendance
      const verifyResponse = await fetch('http://localhost:8080/api/attendance/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('attendanceToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authenticationData),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Failed to verify fingerprint');
      }

      // Fingerprint verified successfully - set step as completed
      setIsBiometricVerified(true);
      setStep3Complete(true);
      
    } catch (err) {
      console.error('Biometric verification error:', err);
      alert(err.message || 'Biometric verification failed. Please try again.');
    }
  };

  // Utility functions for Base64URL conversion
  const base64URLToArrayBuffer = (base64URL) => {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  };

  const arrayBufferToBase64URL = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
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
        <div className="alert alert-info mt-3">
          <i className="fas fa-sync-alt fa-spin me-2"></i>
          Automatically checking for new sessions every 2 seconds...
        </div>
        <div className="mt-3">
          <button 
            className="btn btn-outline-primary" 
            onClick={() => {
              console.log('🔄 Manual refresh requested');
              checkActiveSession();
            }}
          >
            <i className="fas fa-refresh me-2"></i>Check Now
          </button>
        </div>
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

  // Sequential step validation: Step 1 → Step 2 → Step 3 → Submit
  const canSubmit = step1Complete && step2Complete && step3Complete && isSessionActive && !isSessionPaused && timeRemaining > 0;
  
  // Step access control
  const canAccessStep2 = step1Complete;
  const canAccessStep3 = step1Complete && step2Complete;

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
                {timeRemaining > 0 ? (
                  <>
                    <i className="fas fa-clock me-1"></i>
                    {formatTime(timeRemaining)}
                  </>
                ) : (
                  <span className="text-danger">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    Session Expired
                  </span>
                )}
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
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-list-ol me-2"></i>
            Complete All Steps to Mark Attendance
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Step 1: Attendance Code */}
            <div className="col-md-4 mb-3">
              <div className={`card h-100 ${step1Complete ? 'border-success' : 'border-secondary'}`}>
                <div className={`card-header ${step1Complete ? 'bg-success text-white' : 'bg-light'}`}>
                  <h6 className="mb-0">
                    <i className={`fas ${step1Complete ? 'fa-check-circle' : 'fa-key'} me-2`}></i>
                    Step 1: Enter Code {step1Complete && <span className="badge bg-light text-success ms-2">✓</span>}
                  </h6>
                </div>
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className={`fas fa-keyboard fa-2x ${attendanceCode.length > 0 ? 'text-success' : 'text-muted'}`}></i>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="attendanceCode" className="form-label">Attendance Code</label>
                    <input
                      type="text"
                      className="form-control text-center"
                      id="attendanceCode"
                      value={attendanceCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setAttendanceCode(code);
                        setStep1Complete(code.trim().length > 0);
                        
                        // Reset subsequent steps if code is changed
                        if (code.trim().length === 0) {
                          setStep2Complete(false);
                          setStep3Complete(false);
                          setIsLocationVerified(false);
                          setIsBiometricVerified(false);
                        }
                      }}
                      placeholder="Enter code from teacher"
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>
                  {attendanceCode.length > 0 && (
                    <div className="text-success">
                      <i className="fas fa-check-circle me-1"></i>Code Entered
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Location Verification */}
            <div className="col-md-4 mb-3">
              <div className={`card h-100 ${step2Complete ? 'border-success' : canAccessStep2 ? 'border-primary' : 'border-secondary'}`}>
                <div className={`card-header ${step2Complete ? 'bg-success text-white' : canAccessStep2 ? 'bg-primary text-white' : 'bg-light'}`}>
                  <h6 className="mb-0">
                    <i className={`fas ${step2Complete ? 'fa-check-circle' : 'fa-map-marker-alt'} me-2`}></i>
                    Step 2: Verify Location {step2Complete && <span className="badge bg-light text-success ms-2">✓</span>}
                  </h6>
                </div>
                <div className="card-body text-center">
                  {!canAccessStep2 ? (
                    <div>
                      <div className="mb-3">
                        <i className="fas fa-lock fa-2x text-muted"></i>
                      </div>
                      <p className="text-muted small">Complete Step 1 first</p>
                      <button className="btn btn-sm btn-secondary w-100" disabled>
                        <i className="fas fa-lock me-1"></i>Locked
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <i className={`fas fa-map-marker-alt fa-2x ${isLocationVerified ? 'text-success' : 'text-primary'}`}></i>
                      </div>
                      <p className="text-muted small">Verify you're in the classroom</p>
                      <button
                        className={`btn btn-sm ${isLocationVerified ? 'btn-success' : 'btn-primary'} w-100`}
                        onClick={handleLocationVerification}
                        disabled={isLocationVerified}
                      >
                        {isLocationVerified ? (
                          <>
                            <i className="fas fa-check me-1"></i>Verified
                          </>
                        ) : (
                          <>
                            <i className="fas fa-crosshairs me-1"></i>Verify Location
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Biometric Verification */}
            <div className="col-md-4 mb-3">
              <div className={`card h-100 ${step3Complete ? 'border-success' : canAccessStep3 ? 'border-primary' : 'border-secondary'}`}>
                <div className={`card-header ${step3Complete ? 'bg-success text-white' : canAccessStep3 ? 'bg-primary text-white' : 'bg-light'}`}>
                  <h6 className="mb-0">
                    <i className={`fas ${step3Complete ? 'fa-check-circle' : 'fa-fingerprint'} me-2`}></i>
                    Step 3: Biometric Verification {step3Complete && <span className="badge bg-light text-success ms-2">✓</span>}
                  </h6>
                </div>
                <div className="card-body text-center">
                  {!canAccessStep3 ? (
                    <div>
                      <div className="mb-3">
                        <i className="fas fa-lock fa-2x text-muted"></i>
                      </div>
                      <p className="text-muted small">Complete Steps 1 & 2 first</p>
                      <button className="btn btn-sm btn-secondary w-100" disabled>
                        <i className="fas fa-lock me-1"></i>Locked
                      </button>
                    </div>
                  ) : fingerprintLoading ? (
                    <div>
                      <div className="spinner-border text-primary mb-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted small">Checking fingerprint status...</p>
                    </div>
                  ) : !hasFingerprint ? (
                    <div>
                      <div className="mb-3">
                        <i className="fas fa-fingerprint fa-2x text-muted"></i>
                      </div>
                      <p className="text-muted small mb-2">No fingerprint registered</p>
                      <div className="alert alert-warning p-2 mb-2">
                        <small>
                          <i className="fas fa-info-circle me-1"></i>
                          Please register your fingerprint first to use biometric verification
                        </small>
                      </div>
                      <button
                        className="btn btn-outline-secondary btn-sm w-100"
                        onClick={() => {
                          setIsBiometricVerified(true);
                          setStep3Complete(true);
                        }}
                      >
                        <i className="fas fa-user-check me-1"></i>Skip (Manual Verification)
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <i className={`fas fa-fingerprint fa-2x ${isBiometricVerified ? 'text-success' : 'text-primary'}`}></i>
                      </div>
                      <p className="text-muted small">Verify your identity using fingerprint</p>
                      <button
                        className={`btn btn-sm ${isBiometricVerified ? 'btn-success' : 'btn-primary'} w-100`}
                        onClick={handleBiometricVerification}
                        disabled={isBiometricVerified}
                      >
                        {isBiometricVerified ? (
                          <>
                            <i className="fas fa-check me-1"></i>Identity Verified
                          </>
                        ) : (
                          <>
                            <i className="fas fa-fingerprint me-1"></i>Verify Fingerprint
                          </>
                        )}
                      </button>
                      {isBiometricVerified && (
                        <div className="text-success mt-2">
                          <small>
                            <i className="fas fa-shield-check me-1"></i>
                            Biometric verification complete
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Step Completion Info */}
          <div className="text-center mt-4">
            {!canSubmit && (
              <div className="alert alert-info mb-3">
                <i className="fas fa-info-circle me-2"></i>
                {!step1Complete && "Please complete Step 1: Enter attendance code"}
                {step1Complete && !step2Complete && "Please complete Step 2: Verify your location"}
                {step1Complete && step2Complete && !step3Complete && "Please complete Step 3: Biometric verification"}
                {step1Complete && step2Complete && step3Complete && !isSessionActive && "Session is not active"}
                {step1Complete && step2Complete && step3Complete && isSessionPaused && "Session is paused"}
                {step1Complete && step2Complete && step3Complete && timeRemaining <= 0 && "Session has expired"}
              </div>
            )}
          </div>
        </div>
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

      {/* Debug Panel - Remove this after fixing */}
      <div className="card mt-4 border-warning">
        <div className="card-header bg-warning text-dark">
          <h6 className="mb-0"><i className="fas fa-bug me-2"></i>Debug Info (Remove after fixing)</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <small>
                <strong>Session State:</strong><br/>
                • Is Active: {isSessionActive ? '✅ Yes' : '❌ No'}<br/>
                • Is Paused: {isSessionPaused ? '⏸️ Yes' : '▶️ No'}<br/>
                • Time Remaining: {timeRemaining}s<br/>
                • Teacher: {teacherName || 'Not set'}
              </small>
            </div>
            <div className="col-md-6">
              <small>
                <strong>Storage:</strong><br/>
                • Session ID: {localStorage.getItem('activeAttendanceSessionId') || 'None'}<br/>
                • Token: {localStorage.getItem('attendanceToken') ? '✅ Present' : '❌ Missing'}<br/>
                • User: {localStorage.getItem('attendanceUser') ? '✅ Present' : '❌ Missing'}
              </small>
            </div>
          </div>
          <div className="mt-2">
            <button 
              className="btn btn-sm btn-outline-info me-2" 
              onClick={checkActiveSession}
            >
              🔄 Check Session Now
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => console.log('Current state:', {
                isSessionActive, isSessionPaused, timeRemaining, 
                teacherName, sessionEndTime
              })}
            >
              📋 Log Current State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;