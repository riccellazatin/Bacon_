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
        <main className="login-form">
            <div className="login-left">
                <img src="./images/bacon_asset2.png" className="login-asset" alt="Bacon login asset"/>
            </div>
                    <div className="login-right">
                        <h2 className="welcome">Welcome Back!</h2>

                        <form onSubmit={handleLogin}>
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

                            <div className="button-div">
                            <button type="submit" className="login">
                                LOG IN
                            </button>
                            </div>

                            <div className="signup">
                                <p className="not-yet">Don't have an account yet?</p>
                                <a href="/register" className="sign-button"><p>Register Now</p></a>
                            </div>

                            {auth.error && <div style={{ color: 'red' }}>{JSON.stringify(auth.error)}</div>}
                        </form>
                    </div>
                </main>
    );
}

export default LoginPage