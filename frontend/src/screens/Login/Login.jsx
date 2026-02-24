import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const auth = useSelector((state) => state.auth);

    useEffect(() => {
        if (auth.token && auth.userInfo) {
            if (!auth.isOnboarded) {
                navigate('/preferences');
            } else {
                navigate('/dashboard');
            }
        }
    }, [auth.token, auth.userInfo, auth.isOnboarded, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(login(email, password));
    };

    return (
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                    <div style={{ maxWidth: '550px', width: '100%', backgroundColor: '#fcd87e', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '3rem' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ce4636' }}>Log In</h2>

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control"
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-control"
                            />

                            <button type="submit" className="fw-semibold" style={{ backgroundColor: '#ce4636', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none' }}>
                                LOG IN
                            </button>

                            {auth.error && <div style={{ color: 'red' }}>{JSON.stringify(auth.error)}</div>}
                        </form>
                    </div>
                </main>
    );
}

export default LoginPage;