// Admin Dashboard Service
// Handles API calls for admin dashboard functionality

const API_BASE_URL = 'http://localhost:8080/api/admin';

class AdminDashboardService {
    
    // Get dashboard overview statistics
    async getDashboardOverview() {
        try {
            const token = localStorage.getItem('attendanceToken');
            const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
            throw error;
        }
    }

    // Get attendance trends for pie charts
    async getAttendanceTrends() {
        try {
            const token = localStorage.getItem('attendanceToken');
            const response = await fetch(`${API_BASE_URL}/dashboard/attendance-trends`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching attendance trends:', error);
            throw error;
        }
    }

    // Get low attendance classes
    async getLowAttendanceClasses() {
        try {
            const token = localStorage.getItem('attendanceToken');
            const response = await fetch(`${API_BASE_URL}/dashboard/low-attendance`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching low attendance classes:', error);
            throw error;
        }
    }

    // Get recent activity/notices
    async getRecentActivity() {
        try {
            const token = localStorage.getItem('attendanceToken');
            const response = await fetch(`${API_BASE_URL}/dashboard/recent-activity`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }

    // Delete/End active class
    async deleteActiveClass(sessionId) {
        try {
            const token = localStorage.getItem('attendanceToken');
            const response = await fetch(`${API_BASE_URL}/dashboard/active-classes/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error ending active class:', error);
            throw error;
        }
    }
}

const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;