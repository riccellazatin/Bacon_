import './App.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/actions/authActions';
import Landing from './screens/Landing/Landing';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import About from './screens/About/About';
import Shop from './screens/Shop/Shop';
import Login from './screens/Login/Login';
import Signup from './screens/Signup/Signup';
import Preferences from './screens/Preferences/Preferences';
import Dashboard from './screens/Dashboard/Dashboard';
import AddTask from './screens/AddTask/AddTask';
import SubmissionCalendar from './calendar/calendar';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';

export default function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.token && !auth.userInfo && !auth.loading) {
      dispatch(fetchCurrentUser());
    }
  }, [auth.token, auth.userInfo, auth.loading, dispatch]);

  const isLoggedIn = !!auth.token;

  if (isLoggedIn) {
    return (
      <Router>
        <Sidebar />
        <div className='main-content'>
          <Routes>
            <Route path='/preferences' element={<PrivateRoute><Preferences /></PrivateRoute>} />
            <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path='/tasks/new' element={<PrivateRoute><AddTask /></PrivateRoute>} />
            <Route path='/calendar' element={<PrivateRoute><SubmissionCalendar /></PrivateRoute>} />
            <Route path='/shop' element={<Shop />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Signup />} />
          </Routes>
        </div>
      </Router>
    );
  } else {
    return (
      <Router>
        <Header />
        <main className="py-3" style={{ minHeight: '70vh' }}>
          <Routes>
            <Route path='/' element={<Landing />} exact />
            <Route path='/about' element={<About />} />
            <Route path='/shop' element={<Shop />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Signup />} />
            <Route path='/calendar' element={<PrivateRoute><SubmissionCalendar /></PrivateRoute>} />
            <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </Router>
    );
  }
}