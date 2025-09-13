import React, { useState, useEffect } from 'react';

const ActivateAttendance = () => {
  const [currentClass, setCurrentClass] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [attendedStudents, setAttendedStudents] = useState([]);

  // Mock current class
  useEffect(() => {
    const mockClass = {
      subject: 'Computer Science 101',
      room: 'Room 101',
      time: '9:00 AM - 11:00 AM',
      totalStudents: 35,
      isScheduled: true
    };
    setCurrentClass(mockClass);
  }, []);

  // Mock attended students
  const mockAttendedStudents = [
    { id: 1, name: 'John Smith', rollNo: 'CS001', time: '9:05 AM' },
    { id: 2, name: 'Jane Doe', rollNo: 'CS002', time: '9:07 AM' },
    { id: 3, name: 'Mike Johnson', rollNo: 'CS003', time: '9:10 AM' },
  ];

  // Timer for attendance window
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, timeRemaining]);

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAttendanceCode(code);
  };

  const startAttendance = () => {
    if (!attendanceCode) {
      generateCode();
    }
    setTimeRemaining(timeLimit * 60); // Convert to seconds
    setIsActive(true);
    setAttendedStudents(mockAttendedStudents);
  };

  const stopAttendance = () => {
    setIsActive(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const markStudentManually = (studentName) => {
    const newStudent = {
      id: attendedStudents.length + 1,
      name: studentName,
      rollNo: `CS${(attendedStudents.length + 4).toString().padStart(3, '0')}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAttendedStudents([...attendedStudents, newStudent]);
  };

  if (!currentClass || !currentClass.isScheduled) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-clock fa-4x text-muted mb-3"></i>
        <h3 className="text-muted">No Scheduled Class</h3>
        <p>There are no scheduled classes at the moment. Attendance can only be activated during scheduled class hours.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Class Information */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <div className="row align-items-center">
            <div className="col">
              <h5><i className="fas fa-chalkboard-teacher me-2"></i>Current Class</h5>
            </div>
            <div className="col-auto">
              <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h4 className="text-primary">{currentClass.subject}</h4>
              <p className="mb-1"><strong>Room:</strong> {currentClass.room}</p>
              <p className="mb-1"><strong>Time:</strong> {currentClass.time}</p>
              <p className="mb-0"><strong>Total Students:</strong> {currentClass.totalStudents}</p>
            </div>
            <div className="col-md-4 text-md-end">
              {isActive && (
                <div className="alert alert-success mb-0">
                  <h5 className="mb-1">Time Remaining</h5>
                  <h3 className="mb-0">{formatTime(timeRemaining)}</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Attendance Control */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5><i className="fas fa-cog me-2"></i>Attendance Control</h5>
            </div>
            <div className="card-body">
              {!isActive ? (
                <>
                  <div className="mb-3">
                    <label className="form-label">Time Limit (minutes)</label>
                    <select 
                      className="form-select"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    >
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Attendance Code</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control text-center"
                        value={attendanceCode}
                        readOnly
                        placeholder="Click generate to create code"
                        style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={generateCode}
                      >
                        <i className="fas fa-refresh"></i>
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn btn-success btn-lg w-100"
                    onClick={startAttendance}
                  >
                    <i className="fas fa-play me-2"></i>
                    Start Attendance
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <h2 className="text-success mb-2">Attendance Active</h2>
                    <div className="bg-light p-3 rounded">
                      <h1 className="display-4 mb-0" style={{ letterSpacing: '0.5rem' }}>
                        {attendanceCode}
                      </h1>
                      <small className="text-muted">Share this code with students</small>
                    </div>
                  </div>
                  
                  <button
                    className="btn btn-danger btn-lg w-100"
                    onClick={stopAttendance}
                  >
                    <i className="fas fa-stop me-2"></i>
                    Stop Attendance
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Status */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5><i className="fas fa-users me-2"></i>Attendance Status</h5>
              <span className="badge bg-primary">
                {attendedStudents.length} / {currentClass.totalStudents}
              </span>
            </div>
            <div className="card-body">
              <div className="progress mb-3" style={{ height: '10px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: `${(attendedStudents.length / currentClass.totalStudents) * 100}%`
                  }}
                ></div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {attendedStudents.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-user-clock fa-2x mb-2"></i>
                    <p>Waiting for students to mark attendance...</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {attendedStudents.map((student, index) => (
                      <div key={student.id} className="list-group-item d-flex align-items-center px-0">
                        <div className="me-auto">
                          <div className="fw-semibold">{student.name}</div>
                          <small className="text-muted">{student.rollNo}</small>
                        </div>
                        <small className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          {student.time}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Actions */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-download fa-2x text-primary mb-2"></i>
              <h6>Export List</h6>
              <button className="btn btn-outline-primary btn-sm">
                <i className="fas fa-file-csv me-1"></i>Download CSV
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-email fa-2x text-success mb-2"></i>
              <h6>Send Report</h6>
              <button className="btn btn-outline-success btn-sm">
                <i className="fas fa-paper-plane me-1"></i>Email Report
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-history fa-2x text-info mb-2"></i>
              <h6>View History</h6>
              <button className="btn btn-outline-info btn-sm">
                <i className="fas fa-eye me-1"></i>View Past
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateAttendance;