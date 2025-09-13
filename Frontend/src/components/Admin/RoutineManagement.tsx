import React, { useState } from 'react';

const RoutineManagement = () => {
  const [routines, setRoutines] = useState([
    { id: 1, day: 'Monday', time: '9:00 AM - 11:00 AM', subject: 'Computer Science', teacher: 'Dr. Smith', room: 'Room 101' },
    { id: 2, day: 'Monday', time: '2:00 PM - 4:00 PM', subject: 'Mathematics', teacher: 'Prof. Johnson', room: 'Room 203' },
    { id: 3, day: 'Tuesday', time: '10:00 AM - 12:00 PM', subject: 'Physics', teacher: 'Dr. Wilson', room: 'Lab 1' },
    { id: 4, day: 'Wednesday', time: '9:00 AM - 11:00 AM', subject: 'Chemistry', teacher: 'Prof. Davis', room: 'Lab 2' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '',
    subject: '',
    teacher: '',
    room: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleAddRoutine = () => {
    const newRoutine = {
      id: routines.length + 1,
      ...formData
    };
    setRoutines([...routines, newRoutine]);
    setFormData({ day: 'Monday', time: '', subject: '', teacher: '', room: '' });
    setShowAddModal(false);
  };

  const handleEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setFormData({
      day: routine.day,
      time: routine.time,
      subject: routine.subject,
      teacher: routine.teacher,
      room: routine.room
    });
    setShowAddModal(true);
  };

  const handleUpdateRoutine = () => {
    setRoutines(routines.map(routine => 
      routine.id === editingRoutine.id ? { ...editingRoutine, ...formData } : routine
    ));
    setFormData({ day: 'Monday', time: '', subject: '', teacher: '', room: '' });
    setEditingRoutine(null);
    setShowAddModal(false);
  };

  const handleDeleteRoutine = (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      setRoutines(routines.filter(routine => routine.id !== routineId));
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target.result;
          const lines = csvContent.split('\n');
          const headers = lines[0].split(',');
          
          const newRoutines = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',');
            return {
              id: routines.length + index + 1,
              day: values[0]?.trim() || '',
              time: values[1]?.trim() || '',
              subject: values[2]?.trim() || '',
              teacher: values[3]?.trim() || '',
              room: values[4]?.trim() || ''
            };
          });
          
          setRoutines([...routines, ...newRoutines]);
          alert('CSV uploaded successfully!');
        } catch (error) {
          alert('Error processing CSV file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Day,Time,Subject,Teacher,Room\nMonday,9:00 AM - 11:00 AM,Sample Subject,Sample Teacher,Room 101';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routine_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportRoutines = () => {
    const csvContent = [
      ['Day', 'Time', 'Subject', 'Teacher', 'Room'],
      ...routines.map(routine => [routine.day, routine.time, routine.subject, routine.teacher, routine.room])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routines_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      {/* Header Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>Routine Management
              </h5>
            </div>
            <div className="col-md-8 text-end">
              <div className="btn-group me-2">
                <button 
                  className="btn btn-outline-info"
                  onClick={downloadTemplate}
                >
                  <i className="fas fa-download me-2"></i>Template
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={exportRoutines}
                >
                  <i className="fas fa-file-export me-2"></i>Export
                </button>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus me-2"></i>Add Routine
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Upload */}
      <div className="card mb-4">
        <div className="card-header">
          <h6><i className="fas fa-upload me-2"></i>Bulk Upload</h6>
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0">Upload a CSV file to add multiple routines at once.</p>
              <small className="text-muted">
                Format: Day, Time, Subject, Teacher, Room
              </small>
            </div>
            <div className="col-md-6">
              <input
                type="file"
                className="form-control"
                accept=".csv"
                onChange={handleCSVUpload}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule View */}
      <div className="card mb-4">
        <div className="card-header">
          <h6><i className="fas fa-calendar-week me-2"></i>Weekly Schedule Overview</h6>
        </div>
        <div className="card-body">
          <div className="row">
            {days.map(day => (
              <div key={day} className="col-md-2 mb-3">
                <div className="card bg-light">
                  <div className="card-header bg-primary text-white text-center py-2">
                    <strong>{day}</strong>
                  </div>
                  <div className="card-body p-2">
                    {routines
                      .filter(routine => routine.day === day)
                      .map(routine => (
                        <div key={routine.id} className="mb-2">
                          <div className="card card-body p-2">
                            <div className="small">
                              <div className="fw-bold">{routine.time}</div>
                              <div className="text-primary">{routine.subject}</div>
                              <div className="text-muted">{routine.room}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Routines Table */}
      <div className="card">
        <div className="card-header">
          <h6><i className="fas fa-list me-2"></i>All Routines</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Room</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routines.map((routine) => (
                  <tr key={routine.id}>
                    <td>
                      <span className="badge bg-primary">{routine.day}</span>
                    </td>
                    <td>{routine.time}</td>
                    <td className="fw-semibold">{routine.subject}</td>
                    <td>{routine.teacher}</td>
                    <td>
                      <span className="badge bg-light text-dark">{routine.room}</span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditRoutine(routine)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteRoutine(routine.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Routine Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRoutine ? 'Edit Routine' : 'Add New Routine'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRoutine(null);
                    setFormData({ day: 'Monday', time: '', subject: '', teacher: '', room: '' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Day</label>
                    <select
                      className="form-select"
                      value={formData.day}
                      onChange={(e) => setFormData({...formData, day: e.target.value})}
                    >
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      placeholder="e.g., 9:00 AM - 11:00 AM"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Enter subject name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teacher</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.teacher}
                      onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                      placeholder="Enter teacher name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Room</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      placeholder="Enter room number"
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRoutine(null);
                    setFormData({ day: 'Monday', time: '', subject: '', teacher: '', room: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={editingRoutine ? handleUpdateRoutine : handleAddRoutine}
                >
                  {editingRoutine ? 'Update Routine' : 'Add Routine'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineManagement;