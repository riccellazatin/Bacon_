import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { uploadSchedule } from '../../redux/actions/scheduleActions';
import { useNavigate } from 'react-router-dom';
import './SemesterScan.css'
import Footer from '../../components/Footer/Footer'

const SemesterScan = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showReview, setShowReview] = useState(false); // New state for verification
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success, blocks } = useSelector((state) => state.schedule);
  const { userInfo, isOnboarded } = useSelector((state) => state.auth);

  useEffect(() => {
  if (success && blocks && blocks.length > 0) {
    setShowReview(true);
  }
}, [success, blocks]);


useEffect(() => {
  return () => {
    dispatch({ type: 'SCHEDULE_UPLOAD_RESET' });
  };
}, [dispatch]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setShowReview(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (file) dispatch(uploadSchedule(file));
  };

  const handleConfirm = () => {
    // Redirect to Preferences if onboarding is not complete
    // Otherwise, user might be re-scanning, so go to schedule overview
    if (!isOnboarded) {
      navigate('/preferences');
    } else {
      navigate('/schedule-overview');
    }
  };

  return (
    <Container className="sem-scan-body">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {!showReview ? (
                <div className="scan-div">
                  <h2 className="semester-scan-title">Semester Scan</h2>
                  <p className="semester-scan-ins">Upload your schedule to begin.</p>
                  
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form onSubmit={submitHandler}>
                    <Form.Group controlId="formFile" className="sched-form">
                      <Form.Label>
                        {preview ? (
                          <img src={preview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '24px' }} className="rounded" />
                        ) : (
                          <span className="click-me">Click me to upload your schedule</span>
                        )}
                        <Form.Control type="file" onChange={handleFileChange} accept="image/*" hidden />
                      </Form.Label>
                    </Form.Group>

                    <Button variant="primary" type="submit" size="lg" className="analyze-button" disabled={!file || loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Analyze Schedule'}
                    </Button>
                  </Form>
                </div>
              ) : (
                <div className="verify-div">
                  <h3>Verify Extracted Schedule</h3>
                  <Alert variant="info" className="check-alert">Please check if the AI read your classes correctly.</Alert>
                  
                  <Table responsive striped hover className="sched-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Day</th>
                        <th>Time Slot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blocks.map((block, index) => (
                        <tr key={index}>
                          <td className="subject-scan">{block.subject}</td>
                          <td>{block.day_of_week}</td>
                          <td>{block.start_time} - {block.end_time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="secondary-button-div">
                    <Button variant="outline-secondary" className="secondary-button" onClick={() => setShowReview(false)}>
                      Re-upload / Fix
                    </Button>
                    <Button variant="success" className="secondary-button" onClick={handleConfirm}>
                      Confirm & Continue
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default SemesterScan;