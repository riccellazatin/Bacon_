import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, completeTask } from '../../redux/actions/taskActions';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '../../components/MiniCalendar/MiniCalendar';
import './Dashboard.css';

export default function Dashboard() {
  const dispatch = useDispatch();
  const tasksState = useSelector((state) => state.tasks);
  const auth = useSelector((state) => state.auth);
  
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const getPriorityLabel = (score) => {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  // Sort by backend priority score, with deadline as tie-breaker.
  const prioritizedTasks = useMemo(() => {
    return [...tasksState.tasks].sort((a, b) => {
      const scoreDiff = (b.priority_score || 0) - (a.priority_score || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;

      if (aDeadline !== bDeadline) {
        return aDeadline - bDeadline;
      }

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : Number.POSITIVE_INFINITY;
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : Number.POSITIVE_INFINITY;
      return aCreated - bCreated;
    });
  }, [tasksState.tasks]);

  const grouped = prioritizedTasks.reduce((acc, t) => {
    const key = t.scheduled_date || 'unscheduled';
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="main-dashboard">
      <div className="welcome-div">
      <h2 className="welcome-user">Hello, User!</h2>
      <p className="welcome-sub">BACON wishes you an amazing and productive day. TASK NUMBER tasks are waiting for you today.</p>
      </div>

      <MiniCalendar />

      <div>
        <strong>Your Points:</strong> {auth.userInfo?.total_points || 0}
      </div>

      <div>
        <Button className="add-task-button" onClick={() => navigate('/tasks/new')}>Add Task</Button>
      </div>

      {Object.keys(grouped).length === 0 && <p>No tasks yet.</p>}
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <h3>{date}</h3>
          <ul>
            {items.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong> — {task.status}
                <p style={{ margin: '0.25rem 0' }}>
                  Priority: {Math.round(task.priority_score || 0)} ({getPriorityLabel(task.priority_score || 0)})
                  {task.priority_source ? ` · ${task.priority_source}` : ''}
                </p>
                {task.description ? (
                  <p style={{ margin: '0.25rem 0' }}>{task.description}</p>
                ) : (
                  <p style={{ margin: '0.25rem 0', opacity: 0.6 }}>
                    No description yet.
                  </p>
                )}
                {task.priority_reason ? (
                  <p style={{ margin: '0.25rem 0', opacity: 0.75 }}>
                    Why: {task.priority_reason}
                  </p>
                ) : null}
                {task.points_value ? (
                  <span>Points: {task.points_value}</span>
                ) : null}
                {task.status !== 'done' && (
                  <button onClick={() => dispatch(completeTask(task.id))}>Mark done</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
