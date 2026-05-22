import { useEffect, useState } from 'react';
import PageShell from '../components/common/PageShell';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const UserManagementPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await userService.getUsers({ limit: 100 });
      setUsers(response.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const handleRoleChange = async (userId, role) => {
    try {
      await userService.updateUserRole(userId, role);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update role.');
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await userService.updateUserStatus(userId, isActive);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete user.');
    }
  };

  return (
    <PageShell title="User Management" description="Admins can view and manage user roles and account status.">
      {error && <div className="alert alert-error">{error}</div>}
      {user?.role !== 'admin' ? (
        <p>You need admin access to view this page.</p>
      ) : loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
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
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user._id, event.target.value)}
                    >
                      <option value="admin">admin</option>
                      <option value="manager">manager</option>
                      <option value="user">user</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={user.isActive ? 'active' : 'inactive'}
                      onChange={(event) => handleStatusChange(user._id, event.target.value === 'active')}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </td>
                  <td>
                    <button className="button button-danger" onClick={() => handleDelete(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

export default UserManagementPage;
