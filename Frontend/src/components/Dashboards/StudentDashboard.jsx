import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import StudentOverview from '../Student/StudentOverview';
import AttendancePage from '../Student/AttendancePage';
import StatisticsPage from '../Student/StatisticsPage';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/student/attendance':
        return 'Give Attendance';
      case '/student/statistics':
        return 'Attendance Statistics';
      default:
        return 'Student Dashboard';
    }
  };

  return (
    <div className="d-flex min-vh-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="main-content" style={{ marginLeft: window.innerWidth >= 768 ? '250px' : '0' }}>
        <Header 
          toggleSidebar={toggleSidebar} 
          title={getPageTitle(window.location.pathname)}
        />
        
        <div className="container-fluid">
          <Routes>
            <Route path="/" element={<StudentOverview />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;