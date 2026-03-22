import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, completeTask } from '../../redux/actions/taskActions';
import { fetchPoints } from '../../redux/actions/pointsActions';
import { Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '../../components/MiniCalendar/MiniCalendar';
import './Dashboard.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';
import Footer from '../../components/Footer/Footer'

export default function Dashboard() {
  const dispatch = useDispatch();
  const tasksState = useSelector((state) => state.tasks);
  const auth = useSelector((state) => state.auth);
  const points = useSelector((state) => state.points);
  
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Fetch user points on mount and whenever auth changes
  useEffect(() => {
    if (auth.token) {
      dispatch(fetchPoints());
    }
  }, [auth.token, dispatch])

  const handleCompleteTask = (taskId) => {
    dispatch(completeTask(taskId)).then((response) => {
      // Points are already updated in Redux by completeTask action
      // No need to manually update here
    }).catch((error) => {
      console.error('Error completing task:', error)
    })
  }

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
    const d = task.suggested_start_time || task.deadline;
    return d ? String(d) : '9999-12-31T23:59:59.999Z';
  };

  const getDeadlineDateTimeKey = (task) => {
    const d = task.suggested_start_time || task.deadline;
    if (!d) return null;
    const normalized = String(d).replace('Z', '');
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

  const getGroupKey = (task) => {
    const timeKey = getDeadlineDateTimeKey(task);
    if (!timeKey) return 'unscheduled';
    if (task.suggested_start_time) return `sched|${timeKey}`;
    return `dead|${timeKey}`;
  };

  const groupByDeadline = (tasks) => {
    return tasks.reduce((acc, task) => {
      const key = getGroupKey(task);
      acc[key] = acc[key] || [];
      acc[key].push(task);
      return acc;
    }, {});
  };

  const ongoingTasks = prioritizedTasks.filter((task) => task.status !== 'missing' && task.status !== 'done');
  const missedTasks = prioritizedTasks.filter((task) => task.status === 'missing');
  const completedTasks = prioritizedTasks.filter((task) => task.status === 'done');

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
    <li key={task.id} className="todo-border">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong>{task.title}</strong>
          <span className={`badge bg-${task.status === 'done' ? 'success' : 'secondary'} ms-2`}>   {task.status}</span>
        </div>
        {task.status !== 'done' && (
          <Button className="progress-button" size="sm" variant="outline-success" onClick={() => handleCompleteTask(task.id)}>Mark Done</Button>
        )}
      </div>
      
      <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
        {task.suggested_start_time ? (
          <div className="text-success fw-bold">
            📅 Suggested Start: {new Date(task.suggested_start_time).toLocaleString()}
          </div>
        ) : null}
        {task.deadline ? (
          <div className="text-danger">
            ⏰ Deadline: {new Date(task.deadline).toLocaleString()}
          </div>
        ) : null}
      </div>

      <p style={{ margin: '0.5rem 0 0.25rem' }}>
        Priority: {Math.round(task.priority_score || 0)} ({getPriorityLabel(task.priority_score || 0)})
      </p>
      
      {task.description && <p style={{ margin: '0.25rem 0' }}>{task.description}</p>}
      
      {task.priority_reason && (
        <p style={{ margin: '0.25rem 0', fontStyle: 'italic', fontSize: '0.85em', color: '#555' }}>
          🤖 AI Reason: {task.priority_reason}
        </p>
      )}
      
      {task.points_value > 0 && (
        <div style={{ marginTop: '5px', fontWeight: 'bold', color: '#fd5732' }}>
           🔥 +{task.points_value} Points ({task.difficulty || 'medium'})
        </div>
      )}
    </li>
  );

  const renderGroupedTasks = (groups, emptyMessage) => {
    const entries = Object.entries(groups).sort((a, b) => {
        // Sort groups by time key (embedded in the string)
        const timeA = a[0].split('|')[1] || '';
        const timeB = b[0].split('|')[1] || '';
        return timeA.localeCompare(timeB);
    });

    if (entries.length === 0) {
      return <p>{emptyMessage}</p>;
    }

    return entries.map(([key, items]) => {
      let label = key;
      if (key.startsWith('sched|')) label = `Scheduled Start: ${key.substring(6)}`;
      else if (key.startsWith('dead|')) label = `Deadline: ${key.substring(5)}`;
      else if (key === 'unscheduled') label = 'Unscheduled';

      return (
        <div key={key} className="mb-4">
          <h4 className="text-primary border-bottom pb-2">{label}</h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0}}>
            {items.map((task) => renderTaskItem(task))}
          </ul>
        </div>
      );
    });
  };

  return (
    <div className="main-dashboard">
      <Sidebar />
      <div className="top-div">
        <div className="welcome-div">
          <h2 className="welcome-user">Hello, {welcomeName}!</h2>
          <p className="welcome-sub">BACON wishes you an amazing and productive day. {ongoingTasks.filter(t => t.status === 'ongoing').length} tasks are waiting for you today.</p>
        </div>

        <div className="points-section" style={{
        backgroundColor: '#fd5732',
        color: 'white',
        padding: '15px',
        borderRadius: '24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <strong>Total Points</strong>
          <p style={{ fontSize: '2em', margin: '5px 0' }}>{points?.total_points ?? auth.userInfo?.total_points ?? 0}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong>This Week</strong>
          <p style={{ fontSize: '1.5em', margin: '5px 0' }}>{points?.points_earned_this_week ?? 0}/15</p>
          {points?.points_earned_this_week >= 15 && (
            <p style={{ fontSize: '0.9em', marginTop: '5px', color: '#fff', fontWeight: 'bold' }}>
              ⚠️ Weekly limit reached! Earn more next week.
            </p>
          )}
        </div>
      </div>
      </div>

      {tasksState.error && (
        <Alert variant="danger">
          {typeof tasksState.error === 'string'
            ? tasksState.error
            : (tasksState.error.detail || 'Action failed. Please try again.')}
        </Alert>
      )}

      <MiniCalendar />

      <div className="main-task-div">
        <div className="task-button-div">
          <p className="task-button-desc">
            Fire up some tasks today!
          </p>

          <div className="add-div">
            <Button className="add-task-button" onClick={() => navigate('/tasks/new')}>Add Task</Button>
          </div>
        </div>

        <div className="task-kanban">
          {prioritizedTasks.length === 0 ? <p>No tasks yet.</p> : null}

          {prioritizedTasks.length > 0 ? (
            <>
              <div className="ongoing-tasks">
                <h2 className="task-title">Ongoing</h2>

                <h3 className="task-subtitle">Current</h3>
                {renderGroupedTasks(currentGrouped, 'No current tasks.')}

                <h3 className="task-subtitle">Upcoming</h3>
                {renderGroupedTasks(upcomingGrouped, 'No upcoming tasks.')}
              </div>

              <div className="missed-tasks">
                <h2 className="task-title">Missed</h2>
                {renderGroupedTasks(missedGrouped, 'No missed tasks.')}
              </div>

              <div className="completed-tasks">
                <h2 className="task-title">Completed</h2>
                {completedTasks.length === 0 ? (
                  <p>No completed tasks yet. Start completing tasks to see them here!</p>
                
                  ) : (
                  <ul className="kanban-list">
                    {completedTasks.map((task) => renderTaskItem(task))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>
        
      </div>

    <Footer />
    </div>
  );
}
