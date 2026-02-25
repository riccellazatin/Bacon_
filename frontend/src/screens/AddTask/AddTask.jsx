import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTask, fetchTasks } from '../../redux/actions/taskActions';
import api from '../../api/axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function AddTask() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      deadline: deadline || null,
      scheduled_date: scheduledDate || null,
      duration_minutes: Number(duration) || 0,
    };
    try {
      setCreating(true);
      const res = await dispatch(createTask(payload));
      // If backend returned a warning about off-days, prompt user
      if (res?.warning) {
        const proceed = window.confirm('This date is one of your preferred off-days. Save anyway?');
        if (!proceed) {
          try {
            await api.delete(`/tasks/${res.id}/`);
            dispatch(fetchTasks());
          } catch (delErr) {
            console.error('Failed to delete task after user cancelled:', delErr);
          }
          return;
        }
      }
      // Refresh tasks and navigate back
      dispatch(fetchTasks());
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Add Task</h2>
      <Form onSubmit={handleCreate} style={{ maxWidth: 600 }}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Deadline</Form.Label>
          <Form.Control type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Scheduled Date</Form.Label>
          <Form.Control type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Form.Group>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
        </div>
      </Form>
    </div>
  );
}
