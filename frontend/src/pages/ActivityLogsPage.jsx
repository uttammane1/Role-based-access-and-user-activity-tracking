import { useEffect, useState } from 'react';
import PageShell from '../components/common/PageShell';
import { activityService } from '../services/activityService';
import { useAuth } from '../context/AuthContext';

const ActivityLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setError('');
    setLoading(true);

    try {
      let response;
      if (user?.role === 'admin' || user?.role === 'manager') {
        response = await activityService.getLogs({ limit: 100 });
        setSummary(await activityService.getSummary());
      } else {
        const userId = user?._id || 'me';
        response = await activityService.getUserLogs(userId, { limit: 100 });
        const grouped = (response.logs || []).reduce((acc, log) => {
          const key = log.action || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        setSummary(Object.entries(grouped).map(([action, count]) => ({ _id: action, count })));
      }
      setLogs(response.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user]);

  return (
    <PageShell title="Activity Logs" description="Review system and user activity in one place.">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="panel">
        <h2>Activity summary</h2>
        <div className="activity-summary-grid">
          {summary.length > 0 ? (
            summary.map((item) => (
              <div key={item._id} className="summary-card">
                <p>{item._id}</p>
                <strong>{item.count}</strong>
              </div>
            ))
          ) : (
            <p>No activity summary available.</p>
          )}
        </div>
      </div>
      <div className="panel">
        <h2>Recent logs</h2>
        {loading ? (
          <p>Loading logs...</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.userId?.name || 'System'}</td>
                    <td>{log.action}</td>
                    <td>{log.resource || 'General'}</td>
                    <td>{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ActivityLogsPage;
