import React, { useEffect, } from 'react';
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


  const grouped = tasksState.tasks.reduce((acc, t) => {
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
