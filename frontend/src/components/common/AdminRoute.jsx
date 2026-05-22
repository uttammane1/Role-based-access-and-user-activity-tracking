import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-shell">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
