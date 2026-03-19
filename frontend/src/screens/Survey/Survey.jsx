import React, {useState} from 'react';
import {Container, Row, Col, Form, Button, Card} from 'react-bootstrap';

const Survey = () => {
    const [selectedDays, setSelectedDays] = useState([]);

    const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    const handleCheckboxChange = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !==day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Available Days:", selectedDays);
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Row>
                <Col>
                    <Card className="p-4 shadow">
                        <h3 className="text-center mb-4">Select Your Available Days</h3>
                        <Form onSubmit={handleSubmit}>
                            {daysOfWeek.map((map) => (
                                <Form.Check
                                    key={day}
                                    type="checkbox"
                                    label={day}
                                    className="mb-2"
                                    checked={selectedDays.includes(day)}
                                    onChange={() => handleCheckboxChange(day)}
                                />
                            ))}

                        <div className="d-grid mt-4">
                            <Button variant="primary" type="submit">
                                Save
                            </Button>
                        </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Survey;