import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, completeTask } from '../../redux/actions/taskActions';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '../../components/MiniCalendar/MiniCalendar';
import './Dashboard.css';
import Sidebar from '../../components/Sidebar/Sidebar';

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

  const welcomeName =
    auth.userInfo?.username ||
    auth.userInfo?.name ||
    auth.userInfo?.email?.split('@')[0] ||
    'there';

  const getDeadlineSortKey = (task) => {
    return task.deadline ? String(task.deadline) : '9999-12-31T23:59:59.999Z';
  };

  const getDeadlineDateTimeKey = (task) => {
    if (!task.deadline) return null;
    const normalized = String(task.deadline).replace('Z', '');
    if (normalized.length >= 16) {
      return normalized.slice(0, 16).replace('T', ' ');
    }
    return normalized.replace('T', ' ');
  };

  const getDeadlineDateKey = (task) => {
    const dateTimeKey = getDeadlineDateTimeKey(task);
    if (!dateTimeKey) {
      return null;
    }
    return dateTimeKey.slice(0, 10);
  };

  // AI-first sort: priority score/confidence first, then deadline as tie-breaker.
  const prioritizedTasks = useMemo(() => {
    return [...tasksState.tasks].sort((a, b) => {
      const scoreDiff = (b.priority_score || 0) - (a.priority_score || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const confidenceDiff = (b.priority_confidence || 0) - (a.priority_confidence || 0);
      if (confidenceDiff !== 0) {
        return confidenceDiff;
      }

      const aDeadline = getDeadlineSortKey(a);
      const bDeadline = getDeadlineSortKey(b);
      if (aDeadline !== bDeadline) {
        return aDeadline.localeCompare(bDeadline);
      }

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : Number.POSITIVE_INFINITY;
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : Number.POSITIVE_INFINITY;
      return aCreated - bCreated;
    });
  }, [tasksState.tasks]);

  const todayDateKey = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const groupByDeadline = (tasks) => {
    return tasks.reduce((acc, task) => {
      const key = getDeadlineDateTimeKey(task) || 'No deadline';
      acc[key] = acc[key] || [];
      acc[key].push(task);
      return acc;
    }, {});
  };

  const ongoingTasks = prioritizedTasks.filter((task) => task.status !== 'missing');
  const missedTasks = prioritizedTasks.filter((task) => task.status === 'missing');

  const currentOngoing = ongoingTasks.filter((task) => {
    const deadlineDateKey = getDeadlineDateKey(task);
    return deadlineDateKey !== null && deadlineDateKey <= todayDateKey;
  });

  const upcomingOngoing = ongoingTasks.filter((task) => {
    const deadlineDateKey = getDeadlineDateKey(task);
    return deadlineDateKey === null || deadlineDateKey > todayDateKey;
  });

  const currentGrouped = groupByDeadline(currentOngoing);
  const upcomingGrouped = groupByDeadline(upcomingOngoing);
  const missedGrouped = groupByDeadline(missedTasks);

  const renderTaskItem = (task) => (
    <li key={task.id}>
      <strong>{task.title}</strong> — {task.status}
      <p style={{ margin: '0.25rem 0' }}>
        Priority: {Math.round(task.priority_score || 0)} ({getPriorityLabel(task.priority_score || 0)})
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
  );

  const renderGroupedTasks = (groups, emptyMessage) => {
    const entries = Object.entries(groups);
    if (entries.length === 0) {
      return <p>{emptyMessage}</p>;
    }

    return entries.map(([deadline, items]) => (
      <div key={deadline}>
        <h4>{deadline}</h4>
        <ul>
          {items.map((task) => renderTaskItem(task))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="main-dashboard">
      <Sidebar />
      <div className="welcome-div">
      <h2 className="welcome-user">Hello, {welcomeName}!</h2>
      <p className="welcome-sub">BACON wishes you an amazing and productive day. TASK NUMBER tasks are waiting for you today.</p>
      </div>

      <MiniCalendar />

      <div>
        <strong>Your Points:</strong> {auth.userInfo?.total_points || 0}
      </div>

      <div>
        <Button className="add-task-button" onClick={() => navigate('/tasks/new')}>Add Task</Button>
      </div>

      {prioritizedTasks.length === 0 ? <p>No tasks yet.</p> : null}

      {prioritizedTasks.length > 0 ? (
        <>
          <h2>Ongoing</h2>

          <h3>Current</h3>
          {renderGroupedTasks(currentGrouped, 'No current tasks.')}

          <h3>Upcoming</h3>
          {renderGroupedTasks(upcomingGrouped, 'No upcoming tasks.')}

          <h2>Missed</h2>
          {renderGroupedTasks(missedGrouped, 'No missed tasks.')}
        </>
      ) : null}
    </div>
  );
}
