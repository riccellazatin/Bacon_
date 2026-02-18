import { useState } from 'react';
import axios from 'axios';

function SignupPage({ onBack }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup/', {
        username,
        email,
        password,
        password_confirm: confirmPassword
      });
      console.log('Signup successful:', response.data);
      alert('Account created successfully! Please log in.');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onBack();
    } catch (err) {
      console.error('Signup error:', err);
      const errorMsg = err.response?.data?.errors || err.response?.data?.error || 'Signup failed';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5', margin: 0, padding: 0 }}>
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#6b7280', padding: '1.5rem 2rem' }}>
        <div className="container-fluid" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a className="navbar-brand fw-bold" href="#home" style={{ fontSize: '1.8rem', letterSpacing: '2px', color: 'white', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); onBack(); }}>BACON</a>
          <a href="#about" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>About</a>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '550px', width: '100%', backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', padding: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937', fontSize: '1.8rem' }}>Create Account</h2>
          {error && <div style={{ backgroundColor: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', width: '100%', boxSizing: 'border-box' }}
            />
            <input
              type="email"
              className="form-control"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', width: '100%', boxSizing: 'border-box' }}
            />
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', paddingRight: '3rem', width: '100%', boxSizing: 'border-box' }}
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
                  color: '#6b7280'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ padding: '0.75rem 1.5rem', border: '2px solid #d1d5db', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', paddingRight: '3rem', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#6b7280'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="fw-semibold" 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{ 
                borderRadius: '50px', 
                padding: '0.75rem 2rem', 
                marginTop: '1rem',
                backgroundColor: loading ? '#ccc' : (isHovering ? '#4b5563' : '#6b7280'),
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
                border: 'none',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.95rem' }}>Already have an account?</p>
              <button 
                type="button"
                onClick={() => window.location.hash = '#login'}
                style={{ color: 'white', textDecoration: 'none', display: 'inline-block', padding: '0.75rem 2rem', backgroundColor: '#6b7280', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s ease', minWidth: '150px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'} onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}>
                LOG IN
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default SignupPage;
