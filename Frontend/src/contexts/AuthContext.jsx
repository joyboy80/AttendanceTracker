import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    username: 'student1',
    role: 'STUDENT',
    name: 'John Student',
    email: 'john.student@university.edu'
  },
  {
    id: '2',
    username: 'teacher1',
    role: 'TEACHER',
    name: 'Dr. Jane Teacher',
    email: 'jane.teacher@university.edu'
  },
  {
    id: '3',
    username: 'admin1',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@university.edu'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('attendanceUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('attendanceUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user.userID,
          username: data.user.username,
          role: data.user.role,
          name: data.user.name,
          email: data.user.email,
          token: data.token
        };
        
        setUser(userData);
        localStorage.setItem('attendanceUser', JSON.stringify(userData));
        localStorage.setItem('attendanceToken', data.token);
        setIsLoading(false);
        return true;
      } else {
        // Fallback to mock users for demo
        const foundUser = mockUsers.find(u => u.username === username);
        if (foundUser && password === 'password') {
          setUser(foundUser);
          localStorage.setItem('attendanceUser', JSON.stringify(foundUser));
          setIsLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock users for demo
      const foundUser = mockUsers.find(u => u.username === username);
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('attendanceUser', JSON.stringify(foundUser));
        setIsLoading(false);
        return true;
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendanceUser');
    localStorage.removeItem('attendanceToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};