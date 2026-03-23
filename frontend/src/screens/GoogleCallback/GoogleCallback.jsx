import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (code) {
            api.post('/google/callback/', { code })
                .then(() => {
                    navigate('/dashboard', { state: { message: "Google Calendar connected!" } });
                })
                .catch((err) => {
                    navigate('/dashboard', { state: { error: "Failed to connect Google Calendar." } });
                });
        }
    }, [location, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <h2>Connecting to Google Calendar...</h2>
        </div>
    );
};

export default GoogleCallback;