import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserManagementPage from './pages/UserManagementPage';
import TasksPage from './pages/TasksPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/activity-logs" element={<ActivityLogsPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
