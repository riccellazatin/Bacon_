import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import './ScheduleOverview.css';

const ScheduleOverview = () => {
  const navigate = useNavigate();
  const { blocks, loading } = useSelector((state) => state.schedule);

  // Days in order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Generate time slots in 30-minute intervals (6 AM to 10 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  // Find which time slot a class starts in
  const getTimeSlotIndex = (startTime) => {
    const startMinutes = timeToMinutes(startTime);
    const firstSlotMinutes = 6 * 60; // 6 AM
    const slotMinutesDuration = 30; // Each slot is 30 minutes
    return Math.floor((startMinutes - firstSlotMinutes) / slotMinutesDuration);
  };

  // Calculate how many slots a class occupies from start to end
  const getSpannedSlots = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;
    const slotMinutesDuration = 30;
    
    // Calculate span based on duration, rounding up to include partial slots
    return Math.ceil(durationMinutes / slotMinutesDuration);
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="schedule-overview-container">
      <div className="schedule-overview-card">
        <div className="schedule-overview-header">
          <h2 className="fw-bold">Your Weekly Schedule</h2>
        </div>

        {blocks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Alert variant="info" className="text-center m-0">
              No classes found in your schedule. Please upload a schedule to continue.
            </Alert>
          </div>
        ) : (
          <div className="schedule-grid-wrapper">
            <div className="schedule-grid">
                    {/* Header with days */}
                    <div className="time-column-header"></div>
                    {daysOfWeek.map((day) => (
                      <div key={day} className="day-header">
                        {day}
                      </div>
                    ))}

                    {/* Time slot labels with proper grid positioning */}
                    {timeSlots.map((timeSlot, slotIndex) => (
                      <div 
                        key={`label-${slotIndex}`} 
                        className="time-slot-label"
                        style={{
                          gridColumn: '1 / 2',
                          gridRow: `${slotIndex + 2} / ${slotIndex + 3}`
                        }}
                      >
                        {slotIndex % 2 === 0 ? timeSlot : ''}
                      </div>
                    ))}

                    {/* Class blocks */}
                    {blocks.map((block) => {
                      const dayIndex = daysOfWeek.indexOf(block.day_of_week);
                      if (dayIndex === -1) return null;
                      const slotIndex = getTimeSlotIndex(block.start_time);
                      const spannedSlots = getSpannedSlots(block.start_time, block.end_time);
                      return (
                        <div
                          key={`class-${block.id}`}
                          className="class-block"
                          style={{
                            gridColumn: dayIndex + 2,
                            gridRow: `${slotIndex + 2} / span ${spannedSlots}`,
                          }}
                        >
                          <div className="class-subject">{block.subject}</div>
                          <div className="class-time">
                            {formatTime(block.start_time)} - {formatTime(block.end_time)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

        <div style={{ flexShrink: 0, padding: '0.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <Button variant="primary" size="sm" onClick={handleContinue} className="dash-button">
            Continue to Dashboard
          </Button>
          <p className="pref-note">
            You can always adjust your schedule in preferences later.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default ScheduleOverview;
