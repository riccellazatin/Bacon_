import React, { useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, completeTask } from '../../redux/actions/taskActions';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MiniCalendar from '../../components/MiniCalendar/MiniCalendar';

export default function Dashboard() {
  const dispatch = useDispatch();
  const tasksState = useSelector((state) => state.tasks);
  const auth = useSelector((state) => state.auth);
  
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);


  const grouped = tasksState.tasks.reduce((acc, t) => {
    const key = t.scheduled_date || 'unscheduled';
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Your Points:</strong> {auth.userInfo?.total_points || 0}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <Button onClick={() => navigate('/tasks/new')}>Add Task</Button>
      </div>

      <MiniCalendar />

      {Object.keys(grouped).length === 0 && <p>No tasks yet.</p>}
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} style={{ marginBottom: '1rem' }}>
          <h3>{date}</h3>
          <ul>
            {items.map((task) => (
              <li key={task.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{task.title}</strong> — {task.status}
                {task.points_value ? (
                  <span style={{ marginLeft: '0.75rem', color: '#0b6623' }}>Points: {task.points_value}</span>
                ) : null}
                {task.status !== 'done' && (
                  <button style={{ marginLeft: '1rem' }} onClick={() => dispatch(completeTask(task.id))}>Mark done</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
