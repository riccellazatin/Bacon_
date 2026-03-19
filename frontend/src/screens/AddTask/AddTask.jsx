import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTask, fetchTasks } from '../../redux/actions/taskActions';
import api from '../../api/axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function AddTask() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  // User can still pick a date, but AI will suggest a 'suggested_start_time' based on gaps
  const [scheduledDate, setScheduledDate] = useState(''); 
  const [duration, setDuration] = useState(0); // Default 0 means AI predicts it
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const cleanedDescription = description.trim();
    if (!cleanedDescription) {
      window.alert('Task instructions are required for AI analysis.');
      return;
    }

    if (!deadline) {
      window.alert('A deadline is required so the AI can prioritize this task.');
      return;
    }

    const payload = {
      title,
      description: cleanedDescription,
      deadline: deadline, // Strictly required by your rules
      scheduled_date: scheduledDate || null,
      duration_minutes: Number(duration) || 0,
    };

    try {
      setCreating(true);
      const res = await dispatch(createTask(payload));

      // Handling the 'off-days' preference check
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

      dispatch(fetchTasks());
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container py-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h2 className="mb-4">Create New Task</h2>
          <Alert variant="info" className="small">
            ✨ <strong>AI Analysis Active:</strong> Your instructions and deadline will be used to 
            calculate difficulty and find the best vacant slot in your schedule.
          </Alert>

          <Form onSubmit={handleCreate} style={{ maxWidth: 700 }}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Task Name</Form.Label>
              <Form.Control 
                required 
                placeholder="What needs to be done?" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Task Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Be specific. The AI uses these instructions to predict 'working time' and task difficulty."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Detailed instructions help the AI sort this task accurately against your class schedule.
              </Form.Text>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Deadline</Form.Label>
                  <Form.Control 
                    required
                    type="datetime-local" 
                    value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)} 
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Manual Duration (Optional)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Minutes"
                    min={0} 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                  />
                  <Form.Text className="text-muted">Leave at 0 to let AI predict time.</Form.Text>
                </Form.Group>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button variant="light" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={creating} className="px-4">
                {creating ? 'AI is Prioritizing...' : 'Create Task'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}