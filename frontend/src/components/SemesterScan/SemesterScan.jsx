import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { uploadSchedule } from '../../redux/actions/scheduleActions';
import { useNavigate } from 'react-router-dom';

const SemesterScan = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showReview, setShowReview] = useState(false); // New state for verification
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success, blocks } = useSelector((state) => state.schedule);

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
    // Now that the user has seen it, we move to the schedule overview
    navigate('/schedule-overview');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {!showReview ? (
                <div className="text-center">
                  <h2 className="fw-bold mb-3">Semester Scan</h2>
                  <p className="text-muted mb-4">Upload your schedule to begin.</p>
                  
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form onSubmit={submitHandler}>
                    <Form.Group controlId="formFile" className="mb-4">
                      <Form.Label className="upload-label py-5 w-100 border border-dashed rounded cursor-pointer bg-light">
                        {preview ? (
                          <img src={preview} alt="Preview" style={{ maxHeight: '200px' }} className="rounded" />
                        ) : (
                          <span>Click to upload photo</span>
                        )}
                        <Form.Control type="file" onChange={handleFileChange} accept="image/*" hidden />
                      </Form.Label>
                    </Form.Group>

                    <Button variant="primary" type="submit" size="lg" className="w-100" disabled={!file || loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Analyze Schedule'}
                    </Button>
                  </Form>
                </div>
              ) : (
                <div>
                  <h3 className="fw-bold text-center mb-4">Verify Extracted Schedule</h3>
                  <Alert variant="info">Please check if the AI read your classes correctly.</Alert>
                  
                  <Table responsive striped hover className="mt-3">
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
                          <td className="fw-bold">{block.subject}</td>
                          <td>{block.day_of_week}</td>
                          <td>{block.start_time} - {block.end_time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="d-flex gap-3 mt-4">
                    <Button variant="outline-secondary" className="w-100" onClick={() => setShowReview(false)}>
                      Re-upload / Fix
                    </Button>
                    <Button variant="success" className="w-100" onClick={handleConfirm}>
                      Confirm & Continue
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SemesterScan;