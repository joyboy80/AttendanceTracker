import React, { useState } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Smith', email: 'john@university.edu', role: 'teacher', status: 'active' },
    { id: 2, name: 'Jane Doe', email: 'jane@university.edu', role: 'student', status: 'active' },
    { id: 3, name: 'Mike Wilson', email: 'mike@university.edu', role: 'teacher', status: 'inactive' },
    { id: 4, name: 'Sarah Johnson', email: 'sarah@university.edu', role: 'student', status: 'active' },
    { id: 5, name: 'Tom Brown', email: 'tom@university.edu', role: 'admin', status: 'active' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'active'
  });

  const handleAddUser = () => {
    const newUser = {
      id: users.length + 1,
      ...formData
    };
    setUsers([...users, newUser]);
    setFormData({ name: '', email: '', role: 'student', status: 'active' });
    setShowAddModal(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowAddModal(true);
  };

  const handleUpdateUser = () => {
    setUsers(users.map(user => 
      user.id === editingUser.id ? { ...editingUser, ...formData } : user
    ));
    setFormData({ name: '', email: '', role: 'student', status: 'active' });
    setEditingUser(null);
    setShowAddModal(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const getFilteredUsers = () => {
    if (filterRole === 'all') return users;
    return users.filter(user => user.role === filterRole);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'teacher': return 'success';
      case 'student': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' ? 'success' : 'secondary';
  };

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
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus me-2"></i>Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3>{users.length}</h3>
              <p className="mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3>{users.filter(u => u.role === 'student').length}</h3>
              <p className="mb-0">Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3>{users.filter(u => u.role === 'teacher').length}</h3>
              <p className="mb-0">Teachers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h3>{users.filter(u => u.status === 'active').length}</h3>
              <p className="mb-0">Active</p>
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
                  <th>Status</th>
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
                      <span className={`badge bg-${getStatusBadgeColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(user.id)}
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

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', role: 'student', status: 'active' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', role: 'student', status: 'active' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                >
                  {editingUser ? 'Update User' : 'Add User'}
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