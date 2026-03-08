import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';
import './Signup.css'


function SignupPage() {
        const [username, setUsername] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [isHovering, setIsHovering] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        const handleSignup = (e) => {
                e.preventDefault();
                if (password !== confirmPassword) {
                        alert('Passwords do not match!');
                        return;
                }
                dispatch(register(username, email, password));
        };

    return (
        <>
        <div className="signup-body">
                <div className="signup-left">
                    <h2 className="signup-title">Create Account</h2>
                    <form onSubmit={handleSignup}>
                        <input 
                            type="text"
                            className="form-control"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <input 
                            type="email"
                            className="form-control"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                className="reveal"
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👀' : '🔍'}
                            </button>
                        </div>

                        <div>
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <button 
                                className="reveal"
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '👀' : '🔍'}
                            </button>
                        </div>

                        <div className="button-container">
                            <button
                                type="submit"
                                className="signup-button"
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                            >
                                SIGN UP
                            </button>
                        </div>

                        <div className="login">
                            <p className="already">Already have an account?</p>
                            
                            <a href="/login" className="login-button"><p>Log In</p></a>
                        </div>
                    </form>
                </div>

                <div className="signup-right">
                    <img src="./images/bacon_asset1.png" />
                </div>
        </div>
        </>
    );
}

export default SignupPage;