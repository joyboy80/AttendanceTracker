import React, { useState } from 'react';

const AttendanceSessionTester = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results = {
      timestamp: new Date().toLocaleString(),
      tests: []
    };

    const token = localStorage.getItem('attendanceToken');
    if (!token) {
      results.tests.push({
        name: 'Authentication Check',
        status: 'FAILED',
        message: 'No authentication token found'
      });
      setTestResults(results);
      setIsLoading(false);
      return;
    }

    // Test 1: Check if backend is running
    try {
      const healthRes = await fetch('http://localhost:8080/api/attendance/debug-sessions?courseCode=CS101', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (healthRes.ok) {
        const debugData = await healthRes.json();
        results.tests.push({
          name: 'Backend Connection',
          status: 'PASSED',
          message: 'Backend is running and responsive',
          data: debugData
        });
      } else {
        results.tests.push({
          name: 'Backend Connection',
          status: 'FAILED',
          message: `Backend returned status: ${healthRes.status}`
        });
      }
    } catch (e) {
      results.tests.push({
        name: 'Backend Connection',
        status: 'FAILED',
        message: `Cannot connect to backend: ${e.message}`
      });
    }

    // Test 2: Generate a test session
    try {
      const user = JSON.parse(localStorage.getItem('attendanceUser') || '{}');
      const genRes = await fetch(`http://localhost:8080/api/attendance/generate?courseCode=CS101&teacherName=${encodeURIComponent('Test Teacher')}&teacherUsername=${encodeURIComponent('testuser')}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (genRes.ok) {
        const genData = await genRes.json();
        results.tests.push({
          name: 'Session Generation',
          status: 'PASSED',
          message: 'Session created successfully',
          data: genData
        });

        // Test 3: Start the session
        try {
          const startRes = await fetch(`http://localhost:8080/api/attendance/start?sessionId=${genData.sessionId}&duration=180`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (startRes.ok) {
            const startData = await startRes.json();
            results.tests.push({
              name: 'Session Start',
              status: 'PASSED',
              message: 'Session started successfully',
              data: startData
            });

            // Test 4: Check if students can detect it
            setTimeout(async () => {
              try {
                const detectRes = await fetch('http://localhost:8080/api/attendance/active?courseCode=CS101', {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (detectRes.ok) {
                  const detectData = await detectRes.json();
                  if (detectData && detectData.sessionID) {
                    results.tests.push({
                      name: 'Student Detection',
                      status: 'PASSED',
                      message: 'Students can detect the active session',
                      data: detectData
                    });
                  } else {
                    results.tests.push({
                      name: 'Student Detection',
                      status: 'FAILED',
                      message: 'Students cannot detect the session',
                      data: detectData
                    });
                  }
                } else {
                  results.tests.push({
                    name: 'Student Detection',
                    status: 'FAILED',
                    message: `Detection endpoint failed: ${detectRes.status}`
                  });
                }
                setTestResults({...results});
              } catch (e) {
                results.tests.push({
                  name: 'Student Detection',
                  status: 'FAILED',
                  message: `Detection error: ${e.message}`
                });
                setTestResults({...results});
              }
            }, 1000);

          } else {
            results.tests.push({
              name: 'Session Start',
              status: 'FAILED',
              message: `Failed to start session: ${startRes.status}`
            });
          }
        } catch (e) {
          results.tests.push({
            name: 'Session Start',
            status: 'FAILED',
            message: `Start error: ${e.message}`
          });
        }
      } else {
        results.tests.push({
          name: 'Session Generation',
          status: 'FAILED',
          message: `Failed to generate session: ${genRes.status}`
        });
      }
    } catch (e) {
      results.tests.push({
        name: 'Session Generation',
        status: 'FAILED',
        message: `Generation error: ${e.message}`
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <h5><i className="fas fa-flask me-2"></i>Attendance Session Tester</h5>
      </div>
      <div className="card-body">
        <p>This tool tests the complete flow from Teacher session creation to Student detection.</p>
        
        <button 
          className="btn btn-primary" 
          onClick={runTests} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              Running Tests...
            </>
          ) : (
            <>
              <i className="fas fa-play me-2"></i>
              Run Complete Test
            </>
          )}
        </button>

        {testResults && (
          <div className="mt-4">
            <h6>Test Results ({testResults.timestamp})</h6>
            {testResults.tests.map((test, index) => (
              <div key={index} className={`alert ${test.status === 'PASSED' ? 'alert-success' : 'alert-danger'} mb-2`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{test.name}:</strong> {test.message}
                    {test.data && (
                      <details className="mt-2">
                        <summary>View Data</summary>
                        <pre className="mt-2" style={{fontSize: '12px'}}>
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <span className={`badge ${test.status === 'PASSED' ? 'bg-success' : 'bg-danger'}`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceSessionTester;