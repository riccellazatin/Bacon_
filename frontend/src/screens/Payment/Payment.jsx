import React, { useState,useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../api/axios'; // Use configured axios instance
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
// Assuming you have a way to update user state after unlock, 
// e.g., refreshing user profile or manually updating redux state.
import { fetchCurrentUser } from '../../redux/actions/authActions'; 

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

    const initialOptions = {
        "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
        currency: "PHP",
        intent: "capture",
    };

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
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px', padding: '20px' }}>
                <Card.Body>
                    <Card.Title className="text-center mb-4">Unlock Exclusive Shop</Card.Title>
                    <Card.Text className="text-center mb-4">
                        Get access to premium vouchers and deals for only ₱500.00!
                    </Card.Text>
                    
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
