import React, { useState, useEffect } from 'react';

const AttendancePage = () => {
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock current class data
  useEffect(() => {
    // Simulate checking if there's an active class
    const mockClass = {
      subject: 'Computer Science',
      teacher: 'Dr. Jane Smith',
      room: 'Room 101',
      time: '9:00 AM - 11:00 AM',
      isActive: true
    };
    setCurrentClass(mockClass);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (currentClass && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentClass, timeRemaining]);

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

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Attendance marked successfully!');
      setIsSubmitting(false);
      // Reset form
      setAttendanceCode('');
      setIsLocationVerified(false);
      setIsBiometricVerified(false);
    }, 2000);
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

  const canSubmit = attendanceCode.length === 6 && isLocationVerified && isBiometricVerified;

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
              <div className="h5 mb-0">Time Remaining: {formatTime(timeRemaining)}</div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5 className="text-primary">{currentClass.subject}</h5>
              <p className="mb-1"><strong>Teacher:</strong> {currentClass.teacher}</p>
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
                <i className={`fas fa-keyboard fa-3x ${attendanceCode.length === 6 ? 'text-success' : 'text-muted'}`}></i>
              </div>
              <div className="mb-3">
                <label htmlFor="attendanceCode" className="form-label">6-Digit Code</label>
                <input
                  type="text"
                  className="form-control text-center"
                  id="attendanceCode"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                />
              </div>
              {attendanceCode.length === 6 && (
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
                width: `${((attendanceCode.length === 6 ? 1 : 0) + 
                         (isLocationVerified ? 1 : 0) + 
                         (isBiometricVerified ? 1 : 0)) * 33.33}%`
              }}
            ></div>
          </div>
          <div className="text-center mt-2">
            <small className="text-muted">
              Progress: {(attendanceCode.length === 6 ? 1 : 0) + 
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