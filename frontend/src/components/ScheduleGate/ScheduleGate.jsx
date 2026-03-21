// components/ScheduleGate/ScheduleGate.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';

const ScheduleGate = ({ children }) => {
  const { hasSchedule, loading } = useSelector((state) => state.schedule);
  const { isOnboarded } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // If user is onboarded (existing user), allow access to dashboard
  if (isOnboarded) {
    return children;
  }

  // If no schedule is found and user is not onboarded, redirect them to the scan page
  if (!hasSchedule) {
    return <Navigate to="/scan" replace />;
  }

  return children;
};

export default ScheduleGate;