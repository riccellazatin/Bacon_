import { useState, useEffect } from 'react';
import LoginPage from './frontend/login';
import SignupPage from './frontend/signup';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#signup') {
        setCurrentPage('signup');
      } else {
        setCurrentPage('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return currentPage === 'login' ? <LoginPage /> : <SignupPage onBack={() => window.location.hash = '#'} />;
}

export default App;
