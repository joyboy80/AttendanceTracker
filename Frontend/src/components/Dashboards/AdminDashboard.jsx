import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import AdminOverview from '../Admin/AdminOverview';
import UserManagement from '../Admin/UserManagement';
import RoutineManagement from '../Admin/RoutineManagement';
import AttendanceOverview from '../Admin/AttendanceOverview';
import CourseManagement from '../Admin/CourseManagement';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/admin/users':
        return 'User Management';
      case '/admin/courses':
        return 'Course Management';
      case '/admin/routine':
        return 'Routine Management';
      case '/admin/overview':
        return 'Attendance Overview';
      default:
        return 'Admin Dashboard';
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
            <Route path="/" element={<AdminOverview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/routine" element={<RoutineManagement />} />
            <Route path="/overview" element={<AttendanceOverview />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;