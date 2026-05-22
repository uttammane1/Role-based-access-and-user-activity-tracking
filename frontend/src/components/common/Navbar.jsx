import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">RBAC Tracker</Link>
      </div>
      <nav className="navbar-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/activity-logs">Activity Logs</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin/users">Users</NavLink>}
      </nav>
      <div className="navbar-actions">
        <span>{user?.name || 'Guest'}</span>
        {user && (
          <button type="button" onClick={logout} className="button button-link">
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
