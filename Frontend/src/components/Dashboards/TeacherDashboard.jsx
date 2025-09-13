import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import TeacherOverview from '../Teacher/TeacherOverview';
import ActivateAttendance from '../Teacher/ActivateAttendance';
import TeacherStatistics from '../Teacher/TeacherStatistics';

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/teacher/activate':
        return 'Activate Attendance';
      case '/teacher/statistics':
        return 'Teaching Statistics';
      default:
        return 'Teacher Dashboard';
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
            <Route path="/" element={<TeacherOverview />} />
            <Route path="/activate" element={<ActivateAttendance />} />
            <Route path="/statistics" element={<TeacherStatistics />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;