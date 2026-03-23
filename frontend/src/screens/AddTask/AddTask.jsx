import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, fetchTasks } from '../../redux/actions/taskActions';
import api from '../../api/axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './AddTask.css'

export default function AddTask() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userInfo);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  // User can still pick a date, but AI will suggest a 'suggested_start_time' based on gaps
  const [scheduledDate, setScheduledDate] = useState(''); 
  const [duration, setDuration] = useState(0); // Default 0 means AI predicts it
  const [creating, setCreating] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    if (user?.has_exclusive_access) {
      api.get('/google/status/')
        .then(res => setIsGoogleConnected(res.data.is_connected))
        .catch(err => {
          // Silent error handling
        });
    }
  }, [user]);

  const connectGoogle = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        try {
          await api.post('/google/callback/', { 
            code: tokenResponse.code,
            redirect_uri: 'postmessage' // Explicitly set for popup flow
          });
          setIsGoogleConnected(true);
        } catch (err) {
            alert("Google connection failed.");
        }
      },
      flow: 'auth-code',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      onError: error => {
        // Handle error silently or show UI feedback
        alert('Google connection failed.');
      }
  });

  const handleConnectGoogle = () => {
    connectGoogle();
  };

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
      add_to_google_calendar: addToCalendar,
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
            // Silent error - task deletion failed, continue
          }
          return;
        }
      }

      dispatch(fetchTasks());
      navigate('/dashboard');
    } catch (err) {
      // Error handling - show would be in Redux action or UI
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="main-task-body">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h2 className="mb-4">Create New Task</h2>
          <Alert variant="info" className="small">
            ✨ <strong>AI Analysis Active:</strong> Your instructions and deadline will be used to 
            calculate difficulty and find the best vacant slot in your schedule.
          </Alert>

          <div className="form-body">
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
              <Form.Text className="text-muted mb-4" style={{ display: "block"}}>
                Detailed instructions help the AI sort this task accurately against your class schedule. <br></br><br></br> <strong>Note:</strong> Most of the time, the AI will suggest you to start as soon as possible when the task does not clash with a current schedule. If the AI doesn't find a suitable start time, it will automatically set the deadline and not suggest a suggested start time.
              </Form.Text>
            </Form.Group>

            <div className="row mt-4">
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

            {user?.has_exclusive_access && (
              <div className="mb-3 p-3 border rounded bg-light">
                <div className="d-flex align-items-center justify-content-between">
                  <Form.Check 
                    type="checkbox"
                    id="google-calendar-check"
                    label="Add to Google Calendar"
                    checked={addToCalendar}
                    disabled={!isGoogleConnected}
                    onChange={(e) => setAddToCalendar(e.target.checked)}
                  />
                  {!isGoogleConnected && (
                    <Button variant="outline-primary" size="sm" onClick={handleConnectGoogle} type="button">
                      Connect Google Calendar
                    </Button>
                  )}
                </div>
                {!isGoogleConnected && (
                  <Form.Text className="text-muted d-block mt-1">
                    Connect your account to enable calendar syncing.
                  </Form.Text>
                )}
              </div>
            )}

            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button variant="light" onClick={() => navigate('/dashboard')} className="addtask-button">
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={creating} className="addtask-button">
                {creating ? 'AI is Prioritizing...' : 'Create Task'}
              </Button>
            </div>
          </Form>
          </div>
          
        </Card.Body>
      </Card>
    </div>
  );
}