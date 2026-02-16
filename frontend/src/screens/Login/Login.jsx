import {useState} from 'react';
import Header from '../../components/Header/Header'
import './Login.css'
import Footer from '../../components/Footer/Footer';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Login Attempt:', {username, password});
    };

    return (
        <>
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f0dd', margin: 0, padding: 0}}>
            <div className='header-container'>
                <Header />
            </div>

            <main style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'}}>
                <div style={{maxWidth: '550px', width: '100%', backgroundColor: '#fcd87e', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', padding: '4rem'}}>
                    <h2 style={{textAlign: 'center', marginBottom: '2rem', color: '#ce4636', fontSize: '1.8rem', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}}>Log In</h2>
                    <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', width: '100%', boxSizing: 'border-box', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}} />
                        
                        <div style={{position: 'relative', width: '100%'}}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Enter Password"
                                value={password}
                                onchange={(e) => setPassword(e.target.value)}
                                required
                                style={{padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', paddingRight: '3rem', width: '100%', boxSizing: 'border-box', fontFamily: 'Libre Baskerville, serif', fontStyle: 'italic'}} />
                            
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '58%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    color: '#6b7280'
                                }}>
                                {showPassword ? '👀' : '🔍'}
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
                                LOG IN
                        </button>

                        <div style={{textAlign: 'center', marginTop: '1rem'}}>
                            <a href="/register" style={{textDecoration: 'none'}}><p style={{marginBottom: '1rem', color: '#ce4636', fontSize: '0.95rem'}}>Don't have an account?</p></a>

                            <a href="/register">
                            <button
                                type="button"
                                onClick={() => window.location.hash = '#signup'}
                                style={{
                                    color: 'white', textDecoration: 'none', display: 'inline-block', padding: '0.75rem 2 rem', backgroundColor: '#ce4636', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s ease', minWidth: '150px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', fontFamily: 'Libre Baskerville, serif', height: '5vh'
                                }} onMouseEnter={(e) => e.target.style.backgroundColor = '#ae2d1e'} onMouseLeave={(e) => e.target.style.backgroundColor = '#ce4636'}>
                                    SIGN UP
                            </button>
                            </a>
                        </div>
                    </form>
                </div>
            </main>
        </div>
        <Footer />
        </>
    )
}

export default LoginPage;