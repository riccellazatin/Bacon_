import React, { useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Survey.css";

const Survey = () => {
  const [selectedDays, setSelectedDays] = useState([]);
  const navigate = useNavigate();

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  ];

  const handleToggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Available Days:", selectedDays);
    navigate("/"); 
  };

  return (
    <Container fluid className="availability-container d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6}>
          <Card className="availability-card p-5 border-0">
            <h2 className="availability-title text-center mb-4">
              When are you cooking?
            </h2>
            
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

            <div className="d-grid mt-5">
              <Button className="save-btn mb-3" onClick={handleSubmit}>
                Save My Schedule
              </Button>
              
              {/* The Go Back Button */}
              <button 
                type="button" 
                className="back-link-btn" 
                onClick={() => navigate("/")}
              >
                Go Back to Home
              </button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Survey;