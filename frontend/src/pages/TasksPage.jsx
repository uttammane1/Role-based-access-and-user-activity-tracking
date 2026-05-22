import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/common/PageShell';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['pending', 'in-progress', 'completed', 'cancelled'];
const priorityOptions = ['low', 'medium', 'high'];

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', status: 'pending', dueDate: '' });

  const canChooseAssignedUser = useMemo(
    () => user?.role === 'admin' || user?.role === 'manager',
    [user]
  );

  const currentUserId = user?._id || 'me';

  const loadTasks = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await taskService.getTasks({ limit: 100 });
      setTasks(response.tasks || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!canChooseAssignedUser) {
      return;
    }

    try {
      const response = await userService.getUsers({ limit: 100 });
      setUsers(response.users || []);
    } catch (err) {
      setError('Unable to load assignee list.');
    }
  };

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [user]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      ...form,
      assignedTo: canChooseAssignedUser ? form.assignedTo : currentUserId
    };

    if (!payload.assignedTo) {
      setError('Please select an assignee.');
      return;
    }

    try {
      await taskService.createTask(payload);
      setForm({ title: '', description: '', assignedTo: '', priority: 'medium', status: 'pending', dueDate: '' });
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create task.');
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await taskService.deleteTask(taskId);
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete task.');
    }
  };

  return (
    <PageShell title="Tasks" description="Create and manage tasks for your team.">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="panel">
        <h2>Create task</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleInput} required />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleInput} rows={3} />
          </label>
          <label>
            Priority
            <select name="priority" value={form.priority} onChange={handleInput}>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleInput}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleInput} />
          </label>
          <label>
            Assigned to
            {canChooseAssignedUser ? (
              <select name="assignedTo" value={form.assignedTo} onChange={handleInput} required>
                <option value="">Select assignee</option>
                {users.map((option) => (
                  <option key={option._id} value={option._id}>{option.name} ({option.role})</option>
                ))}
              </select>
            ) : (
              <input value={user?.name || 'Guest'} disabled />
            )}
          </label>
          <div className="form-actions">
            <button type="submit" className="button button-primary">Create Task</button>
          </div>
        </form>
      </div>
      <div className="panel">
        <h2>Task list</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.assignedTo?.name || 'Unknown'}</td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(event) => handleStatusUpdate(task._id, event.target.value)}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td>{task.priority}</td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="button button-danger" onClick={() => handleDelete(task._id)}>
                        Delete
                      </button>
                    </td>
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

export default TasksPage;
