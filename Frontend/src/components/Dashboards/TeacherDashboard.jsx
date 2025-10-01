import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import TeacherOverview from '../Teacher/TeacherOverview';
import TeacherStatistics from '../Teacher/TeacherStatistics';
import ActivateAttendance from '../Teacher/ActivateAttendance';
import AssignedCourses from '../Teacher/AssignedCourses.tsx';
import TeacherSchedule from '../Teacher/TeacherSchedule';

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/teacher':
        return 'Teacher Dashboard';
      case '/teacher/overview':
        return 'Overview';
      case '/teacher/schedule':
        return 'My Teaching Schedule';
      case '/teacher/statistics':
        return 'Statistics';
      case '/teacher/activate':
        return 'Activate Attendance';
      case '/teacher/courses':
        return 'Assigned Courses';
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
          title={getPageTitle()}
        />
        
        <div className="container-fluid">
          <Routes>
            <Route path="/" element={<TeacherOverview />} />
            <Route path="/activate" element={<ActivateAttendance />} />
            <Route path="/schedule" element={<TeacherSchedule />} />
            <Route path="/statistics" element={<TeacherStatistics />} />
            <Route path="/courses" element={<AssignedCourses />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;