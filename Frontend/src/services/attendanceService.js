// Attendance service for API calls
const API_BASE_URL = 'http://localhost:8080';

const attendanceService = {
  // Get attendance overview data
  async getAttendanceOverview(filters = {}) {
    try {
      const token = localStorage.getItem('attendanceToken');
      let url = `${API_BASE_URL}/api/admin/attendance/overview`;
      
      const params = new URLSearchParams();
      if (filters.batch && filters.batch !== 'all') {
        params.append('batch', filters.batch);
      }
      if (filters.course && filters.course !== 'all') {
        params.append('courseCode', filters.course);
      }
      if (filters.dateRange) {
        params.append('dateRange', filters.dateRange);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance overview:', error);
      throw error;
    }
  },

  // Get attendance statistics
  async getStatistics() {
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/attendance/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Get batches
  async getBatches() {
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/attendance/batches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Get courses
  async getCourses() {
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/attendance/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get batch summary
  async getBatchSummary() {
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/attendance/batch-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batch summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching batch summary:', error);
      throw error;
    }
  },

  // Get student statistics (real data)
  async getStudentStatistics(userId, courseCode = null) {
    try {
      const token = localStorage.getItem('attendanceToken');
      let url = `${API_BASE_URL}/api/users/student/statistics/${userId}`;
      if (courseCode && courseCode !== 'all') {
        url += `?courseCode=${encodeURIComponent(courseCode)}`;
      }
      console.log('Fetching from URL:', url);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw error;
    }
  },

  // Get teacher statistics (real data)
  async getTeacherStatistics(userId, courseCode) {
    try {
      const token = localStorage.getItem('attendanceToken');
      let url = `${API_BASE_URL}/api/users/teacher/statistics/${userId}`;
      if (courseCode && courseCode !== 'all' && courseCode !== null && courseCode !== undefined) {
        url += `?courseCode=${encodeURIComponent(courseCode)}`;
      }
      console.log('Fetching teacher stats from URL:', url);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Teacher stats response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Teacher stats error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher statistics:', error);
      throw error;
    }
  },

  // Get teacher dashboard data (real data)
  async getTeacherDashboard(userId) {
    try {
      const token = localStorage.getItem('attendanceToken');
      const url = `${API_BASE_URL}/api/users/teacher/dashboard/${userId}`;
      console.log('Fetching teacher dashboard from URL:', url);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Teacher dashboard response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Teacher dashboard error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher dashboard:', error);
      throw error;
    }
  },

  // Get teacher attendance records (real data)
  async getTeacherAttendanceRecords(userId, courseCode = null, date = null) {
    try {
      const token = localStorage.getItem('attendanceToken');
      let url = `${API_BASE_URL}/api/users/teacher/attendance/${userId}`;
      
      const params = new URLSearchParams();
      if (courseCode && courseCode !== 'all') {
        params.append('courseCode', courseCode);
      }
      if (date) {
        params.append('date', date);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching teacher attendance records from URL:', url);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Teacher attendance records response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Teacher attendance records error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher attendance records:', error);
      throw error;
    }
  }
};

export default attendanceService;