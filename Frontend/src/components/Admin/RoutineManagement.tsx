import React, { useState, useEffect } from 'react';

interface Routine {
  routineId: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  courseTime: string;
  endTime: string;
  day: string;
  teacherId: number;
  teacherName: string;
  teacherUsername: string;
  studentBatch: string;
  createdAt: string;
}

interface Teacher {
  id: number;
  username: string;
  name: string;
  email: string;
}

const RoutineManagement = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '',
    endTime: '',
    courseId: '',
    batch: '',
    teacherId: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchStudentBatches();
    fetchTeachers();
    fetchCourses();
    fetchRoutines();
  }, []);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch('http://localhost:8080/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data || []);
      } else {
        console.error('Failed to fetch courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchTeacherCourses = async (teacherId: string) => {
    if (!teacherId) {
      setTeacherCourses([]);
      return;
    }

    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/admin/courses/teacher/${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeacherCourses(data.courses || []);
      } else {
        console.error('Failed to fetch teacher courses');
        setTeacherCourses([]);
      }
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      setTeacherCourses([]);
    }
  };

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch('http://localhost:8080/api/admin/routines', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched routines data:', data); // Debug log
        if (data.success) {
          // Map the response to match frontend interface
          const mappedRoutines = (data.routines || []).map((routine: any) => ({
            routineId: routine.routineId,
            courseId: routine.courseId,
            courseCode: routine.courseCode,
            courseTitle: routine.courseTitle,
            courseTime: typeof routine.courseTime === 'string' ? routine.courseTime : routine.courseTime.toString(),
            endTime: typeof routine.endTime === 'string' ? routine.endTime : routine.endTime.toString(),
            day: routine.day,
            teacherId: routine.teacherId,
            teacherName: routine.teacherName,
            teacherUsername: routine.teacherUsername,
            studentBatch: routine.studentBatch,
            createdAt: routine.createdAt
          }));
          console.log('Mapped routines:', mappedRoutines); // Debug log
          setRoutines(mappedRoutines);
        } else {
          console.error('API returned success: false', data);
        }
      } else {
        console.error('Failed to fetch routines, status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentBatches = async () => {
    setLoading(true);
    try {
      // Generate batch numbers from 20 to 29
      const generatedBatches = [];
      for (let i = 20; i <= 29; i++) {
        generatedBatches.push(i.toString());
      }
      setBatches(generatedBatches);
    } catch (error) {
      console.error('Error generating student batches:', error);
      // Fallback to hardcoded batch numbers if something goes wrong
      setBatches(['20', '21', '22', '23', '24', '25', '26', '27', '28', '29']);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch('http://localhost:8080/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      } else {
        console.error('Failed to fetch teachers');
        // Fallback to hardcoded teachers if API fails
        setTeachers([
          { id: 1, username: 'dr_smith', name: 'Dr. Smith', email: 'smith@university.edu' },
          { id: 2, username: 'prof_johnson', name: 'Prof. Johnson', email: 'johnson@university.edu' },
          { id: 3, username: 'dr_wilson', name: 'Dr. Wilson', email: 'wilson@university.edu' },
          { id: 4, username: 'prof_davis', name: 'Prof. Davis', email: 'davis@university.edu' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Fallback to hardcoded teachers if API fails
      setTeachers([
        { id: 1, username: 'dr_smith', name: 'Dr. Smith', email: 'smith@university.edu' },
        { id: 2, username: 'prof_johnson', name: 'Prof. Johnson', email: 'johnson@university.edu' },
        { id: 3, username: 'dr_wilson', name: 'Dr. Wilson', email: 'wilson@university.edu' },
        { id: 4, username: 'prof_davis', name: 'Prof. Davis', email: 'davis@university.edu' }
      ]);
    } finally {
      setTeachersLoading(false);
    }
  };

  const getAvailableCourses = () => {
    // Return courses assigned to the selected teacher
    return teacherCourses;
  };

  const addRoutine = async () => {
    if (!formData.courseId || !formData.time || !formData.endTime || !formData.batch || !formData.teacherId) {
      alert('Please fill all fields');
      return;
    }

    // Validate that end time is after start time
    if (formData.endTime <= formData.time) {
      alert('End time must be after start time');
      return;
    }

    // Validate that the selected course is assigned to the selected teacher
    const isValidCourseTeacherMatch = teacherCourses.some(course => 
      course.id.toString() === formData.courseId
    );

    if (!isValidCourseTeacherMatch) {
      alert('Selected course is not assigned to the selected teacher. Please choose a valid course-teacher combination.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      
      // Get teacher username for the API call
      const selectedTeacher = teachers.find(t => t.id.toString() === formData.teacherId);
      if (!selectedTeacher) {
        alert('Selected teacher not found');
        return;
      }

      const routineData = {
        courseId: parseInt(formData.courseId),
        courseTime: formData.time,
        endTime: formData.endTime,
        day: formData.day,
        username: selectedTeacher.username,
        studentBatch: formData.batch
      };

      const response = await fetch('http://localhost:8080/api/routine', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routineData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Add routine response:', data); // Debug log
        if (data.success) {
          alert('Routine added successfully!');
          setFormData({ day: 'Monday', time: '', endTime: '', courseId: '', batch: '', teacherId: '' });
          setTeacherCourses([]);
          setShowModal(false);
          // Force refresh the routines list
          await fetchRoutines(); 
          console.log('Routines refreshed after adding'); // Debug log
        } else {
          alert(data.message || 'Failed to add routine');
        }
      } else {
        const errorData = await response.json();
        console.error('Add routine failed:', errorData);
        alert(errorData.message || 'Failed to add routine');
      }
    } catch (error) {
      console.error('Error adding routine:', error);
      alert('Error adding routine');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutine = async (routineId: number) => {
    if (!confirm('Are you sure you want to delete this routine?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/admin/routine/${routineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Routine deleted successfully!');
          fetchRoutines(); // Refresh the list
        } else {
          alert(data.message || 'Failed to delete routine');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete routine');
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      alert('Error deleting routine');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutines = routines.filter(routine => 
    !selectedBatch || routine.studentBatch === selectedBatch
  );

  return (
    <div className="fade-in">
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h4>Routine Management</h4>
              <p className="text-muted">Manage class schedules</p>
            </div>
            <div className="col-md-6 text-end">
              <button 
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                Add Routine
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Filter by Batch</label>
              <select
                className="form-select"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={loading}
              >
                <option value="">{loading ? 'Loading batches...' : 'All Batches'}</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h6>Routines ({filteredRoutines.length})</h6>
        </div>
        <div className="card-body">
          {filteredRoutines.length === 0 ? (
            <div className="text-center py-4">
              <p>No routines found. Add your first routine!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Course</th>
                    <th>Teacher</th>
                    <th>Batch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutines.map(routine => (
                    <tr key={routine.routineId}>
                      <td>{routine.day}</td>
                      <td>{routine.courseTime}</td>
                      <td>{routine.endTime}</td>
                      <td>{routine.courseTitle}</td>
                      <td>{routine.teacherName}</td>
                      <td>
                        <span className="badge bg-info">{routine.studentBatch}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteRoutine(routine.routineId)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Routine</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Batch</label>
                  <select
                    className="form-select"
                    value={formData.batch}
                    onChange={(e) => setFormData({...formData, batch: e.target.value, courseId: ''})}
                    disabled={loading}
                  >
                    <option value="">{loading ? 'Loading batches...' : 'Select Batch'}</option>
                    {batches.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                  {batches.length === 0 && !loading && (
                    <small className="text-muted">No batches available.</small>
                  )}
                </div>
                
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
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    placeholder="HH:MM"
                  />
                  <small className="text-muted">Use 24-hour format (e.g., 09:00, 14:30)</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    placeholder="HH:MM"
                  />
                  <small className="text-muted">End time must be after start time</small>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    disabled={!formData.teacherId || teacherCourses.length === 0}
                  >
                    <option value="">
                      {!formData.teacherId ? "Select teacher first" : 
                       teacherCourses.length === 0 ? "No courses assigned to teacher" : "Select Course"}
                    </option>
                    {formData.teacherId && getAvailableCourses().map((course: any) => (
                      <option key={course.id} value={course.id.toString()}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                  {formData.teacherId && teacherCourses.length === 0 && (
                    <small className="text-muted">This teacher has no assigned courses. Please assign courses first.</small>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Teacher</label>
                  <select
                    className="form-select"
                    value={formData.teacherId}
                    onChange={(e) => {
                      setFormData({...formData, teacherId: e.target.value, courseId: ''});
                      fetchTeacherCourses(e.target.value);
                    }}
                    disabled={teachersLoading}
                  >
                    <option value="">
                      {teachersLoading ? "Loading teachers..." : "Select Teacher"}
                    </option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name} (@{teacher.username})
                      </option>
                    ))}
                  </select>
                  {teachers.length === 0 && !teachersLoading && (
                    <small className="text-muted">No teachers found. Make sure teachers are registered first.</small>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={addRoutine}
                >
                  Add Routine
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