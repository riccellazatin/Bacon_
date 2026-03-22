import React, { useState,useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../api/axios'; // Use configured axios instance
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
// Assuming you have a way to update user state after unlock, 
// e.g., refreshing user profile or manually updating redux state.
import { fetchCurrentUser } from '../../redux/actions/authActions'; 
import './Payment.css'; // Optional: for custom styling

// Define options outside component to avoid re-renders
const initialOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test", // Fallback for development if needed, but better to fail explicitly or use env
    currency: "PHP",
    intent: "capture",
};

const Payment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.userInfo);
    // Token is handled automatically by api/axios interceptors
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already unlocked
    useEffect(() => {
        if (user?.has_exclusive_access) {
            navigate('/shop');
        }
    }, [user, navigate]);

    // Check if Client ID is missing
    if (!initialOptions["client-id"] || initialOptions["client-id"] === "your_paypal_client_id_here") {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', maxWidth: '100%' }}>
                <Alert variant="danger">
                    Error: PayPal Client ID is missing. Please checking your .env file or restart the server.
                </Alert>
            </Container>
        );
    }

    const handleApprove = async (data, actions) => {
        try {
            const details = await actions.order.capture();
            setLoading(true);
            
            // Verify payment on backend and unlock exclusive access
            // Using configured api instance which handles token refresh automatically
            await api.post('/shop/unlock_exclusive/', {});
            
            setMessage(`Transaction completed by ${details.payer.name.given_name}. Unlocking exclusive items...`);
            
            // Refresh user data to update has_exclusive_access status
            await dispatch(fetchCurrentUser());
            
            setTimeout(() => {
                navigate('/shop');
            }, 2000);
        } catch (error) {
            console.error("Payment Error:", error);
            const errorMsg = error.response && error.response.data 
                ? (error.response.data.detail || JSON.stringify(error.response.data))
                : error.message;
            setMessage(`Payment successful but failed to update status. Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="payment-wrapper">
            <Card className="payment-card">
                <Card.Body>
                    <Card.Title className="text-center mb-4"><h1>Benefits for only ₱500.00!</h1></Card.Title>
                    <Card.Text className="text-center mb-4">
                        Unlock Google Calendar Sync
                    </Card.Text>
                    <Card.Title className="text-center mb-4">Unlock Exclusive Shop</Card.Title>
                    
                    {message && <Alert variant="success">{message}</Alert>}
                    
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <PayPalScriptProvider options={initialOptions}>
                            <PayPalButtons
                                style={{ layout: "vertical" }}
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        purchase_units: [
                                            {
                                                amount: {
                                                    value: "500.00", // Fixed price for unlocking exclusive shop
                                                    currency_code: "PHP"
                                                },
                                            },
                                        ],
                                    });
                                }}
                                onApprove={handleApprove}
                                onError={(err) => {
                                    console.error(err);
                                    setMessage("Payment failed. Please try again.");
                                }}
                            />
                        </PayPalScriptProvider>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Payment;
