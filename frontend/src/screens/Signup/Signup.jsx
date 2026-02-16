import {useState} from 'react';
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

function SignupPage({ onBack }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Signup attempt:', {username, email, password});
    };

    return (
        <>
        <div className='signup-body'>
            <div className='header-container'>
                <Header />
            </div>

            <main style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'}}>
                <div style={{maxWidth: '550px', width: '100%', backgroundColor: '#fcd87e', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '4rem'}}>
                    <h2 style={{textAlign: 'center', marginBottom: '2rem', color: '#ce4636', fontSize: '1.8rem', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}}>Create Account</h2>
                    <form onSubmit={handleSignup} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        <input 
                            type="text"
                            className="form-control"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', width: '100%', boxSizing: 'border-box', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}}
                        />

                        <input 
                            type="email"
                            className="form-control"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', width: '100%', boxSizing: 'border-box', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}}
                        />

                        <div style={{position: 'relative', width: '100%'}}>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius:'50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', paddingRight: '3rem', width: '100%', boxSizing: 'border-box', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    color: '#6b7280',
                                }}
                            >
                                {showPassword ? '👀' : '🔍'}
                            </button>
                        </div>

                        <div style={{position: 'relative', width: '100%'}}>
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{padding: '0.75rem 1.5rem', border: '2px solid #did5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', paddingRight: '3rem', width: '100%', boxSizing: 'border-box', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}}
                            />

                            <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: "absolute",
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    color: '#6b7280'
                            }}>
                                {showConfirmPassword ? '👀' : '🔍'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="fw-semibold"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            style={{
                                borderradius: '50px',
                                padding: '0.75rem 2rem',
                                marginTop: '1rem',
                                backgroundColor: isHovering ? '#ae2d1e' : '#ce4636',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                transition: 'background-color 0.3s ease',
                                border: 'none',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%',
                                boxSizing: 'border-box',
                                fontFamily: 'Libre Baskerville, serif',
                                borderRadius: '50px',
                            }}>
                            SIGN UP
                        </button>

                        <div style={{textAlign: 'center', marginTop: '1rem'}}>
                            <a href="/login" style={{textDecoration: 'none'}}><p style={{marginBottom: '1rem', color: '#ce4636', fontSize: '0.95rem'}}>Already have an account?</p></a>
                            
                            <a href="/login">
                            <button
                                type="button"
                                onClick={() => window.location.hash = '#login'}
                                style={{
                                    color: 'white', textDecoration: 'none', display: 'inline-block', padding: '0.75rem 2 rem', backgroundColor: '#ce4636', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s ease', minWidth: '150px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', fontFamily: 'Libre Baskerville, serif', height: '5vh'
                                }} onMouseEnter={(e) => e.target.style.backgroundColor = '#ae2d1e'} onMouseLeave={(e) => e.target.style.backgroundColor = '#ce4636'}>
                                    LOG IN
                            </button>
                            </a>
                        </div>
                    </form>
                </div>
            </main>
        </div>
        <Footer />
        </>
    );
}

export default SignupPage;