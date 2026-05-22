import { useEffect, useState } from 'react';
import PageShell from '../components/common/PageShell';
import { activityService } from '../services/activityService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [stats, setStats] = useState({ tasks: 0, users: 0, logs: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const taskList = await taskService.getTasks({ limit: 1 });
        let summaryItems = [];
        let logsCount = 0;
        let userCount = 0;

        if (user?.role === 'admin' || user?.role === 'manager') {
          summaryItems = await activityService.getSummary();
          logsCount = summaryItems.reduce((acc, item) => acc + item.count, 0);
          const usersResponse = await userService.getUsers({ limit: 1 });
          userCount = usersResponse.total;
        }

        setStats({ tasks: taskList.total, users: userCount, logs: logsCount });
        setSummary(summaryItems);
      } catch (err) {
        setError('Unable to load dashboard information.');
      }
    };

    fetchStats();
  }, [user]);

  return (
    <PageShell title="Dashboard" description="Overview of your tasks, users, and activity logs.">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">Tasks</p>
          <strong>{stats.tasks}</strong>
        </div>
        <div className="summary-card">
          <p className="summary-label">Activity Logs</p>
          <strong>{stats.logs}</strong>
        </div>
        <div className="summary-card">
          <p className="summary-label">Users</p>
          <strong>{user?.role === 'admin' || user?.role === 'manager' ? stats.users : '—'}</strong>
        </div>
      </div>
      <div className="panel">
        <h2>Recent activity</h2>
        <div className="panel-body">
          {summary.length > 0 ? (
            <ul className="activity-summary-list">
              {summary.map((item) => (
                <li key={item._id}>
                  <span>{item._id}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity statistics available.</p>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
