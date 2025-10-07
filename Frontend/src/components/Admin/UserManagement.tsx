import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  batch?: string;
  status: string;
  enabled: boolean;
  department?: string;
  section?: string;
  designation?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'active'
  });

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('attendanceToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      if (data.success) {
        setUsers(data.users || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('attendanceToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      if (data.success) {
        // Refresh users list
        fetchUsers();
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.status
    });
    setShowAddModal(true);
  };

  const getFilteredUsers = () => {
    if (filterRole === 'all') return users;
    return users.filter(user => user.role.toLowerCase() === filterRole);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'danger';
      case 'teacher': return 'success';
      case 'student': return 'primary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="fade-in text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <div className="alert alert-danger">
          <h6>Error loading users</h6>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={fetchUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>User Management
              </h5>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-outline-primary"
                onClick={fetchUsers}
              >
                <i className="fas fa-sync me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3>{users.length}</h3>
              <p className="mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3>{users.filter(u => u.role.toLowerCase() === 'student').length}</h3>
              <p className="mb-0">Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3>{users.filter(u => u.role.toLowerCase() === 'teacher').length}</h3>
              <p className="mb-0">Teachers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h6><i className="fas fa-table me-2"></i>Users List</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredUsers().map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                             style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-user text-white"></i>
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditUser(user)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
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

      {/* User Details Modal */}
      {showAddModal && editingUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user me-2"></i>User Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Name:</strong> {editingUser.name}
                  </div>
                  <div className="col-md-6">
                    <strong>Username:</strong> {editingUser.username}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-6">
                    <strong>Email:</strong> {editingUser.email}
                  </div>
                  <div className="col-md-6">
                    <strong>Phone:</strong> {editingUser.phone || 'N/A'}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-6">
                    <strong>Role:</strong> 
                    <span className={`badge bg-${getRoleBadgeColor(editingUser.role)} ms-2`}>
                      {editingUser.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                {editingUser.batch && (
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <strong>Batch:</strong> {editingUser.batch}
                    </div>
                  </div>
                )}
                {editingUser.department && (
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <strong>Department:</strong> {editingUser.department}
                    </div>
                    {editingUser.designation && (
                      <div className="col-md-6">
                        <strong>Designation:</strong> {editingUser.designation}
                      </div>
                    )}
                    {editingUser.section && (
                      <div className="col-md-6">
                        <strong>Section:</strong> {editingUser.section}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;