import React, { useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences } from '../../redux/actions/authActions';
import './Preferences.css';

const Preferences = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [selectedDays, setSelectedDays] = useState(auth.userInfo?.preferences?.off_days || []);
  const [startTime, setStartTime] = useState(auth.userInfo?.preferences?.start_time || '08:00');
  const [endTime, setEndTime] = useState(auth.userInfo?.preferences?.end_time || '17:00');

  const handleToggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // dispatch update to backend
    await dispatch(updatePreferences({ off_days: selectedDays, start_time: startTime, end_time: endTime }));
    navigate('/dashboard');
  };

  return (
    <Container fluid className="availability-container d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6}>
          <Card className="availability-card p-5 border-0">
            <h2 className="availability-title text-center mb-4">When are you cooking?</h2>

            <div className="days-grid d-flex flex-wrap justify-content-center gap-3">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-pill ${selectedDays.includes(day) ? "active" : ""}`}
                  onClick={() => handleToggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="time-row d-flex gap-3 justify-content-center mt-4">
                <div>
                  <label className="time-label">Start</label>
                  <input className="time-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="time-label">End</label>
                  <input className="time-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="d-grid mt-5">
                <Button className="save-btn mb-3" type="submit">Save My Schedule</Button>

                <button type="button" className="back-link-btn" onClick={() => navigate('/')}>Go Back to Home</button>
              </div>
            </form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Preferences;
