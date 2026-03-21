import './App.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/actions/authActions';
// 1. Import your new schedule list action (we'll define this next)
import { listScheduleBlocks } from './redux/actions/scheduleActions'; 
import Landing from './screens/Landing/Landing';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import About from './screens/About/About';
import Shop from './screens/Shop/Shop';
import LoginPage from './screens/Login/Login';
import Signup from './screens/Signup/Signup';
import Preferences from './screens/Preferences/Preferences';
import Dashboard from './screens/Dashboard/Dashboard';
import AddTask from './screens/AddTask/AddTask';
import SubmissionCalendar from './calendar/calendar';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
// 2. Import the Gate
import ScheduleGate from './components/ScheduleGate/ScheduleGate';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import SemesterScan from './components/SemesterScan/SemesterScan';
import ScheduleOverview from './screens/ScheduleOverview/ScheduleOverview';
import CourseFolderScreen from './screens/CourseFolder/CourseFolderScreen';
import Payment from './screens/Payment/Payment';

export default function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (auth.token && !auth.userInfo && !auth.loading && !auth.error) {
      dispatch(fetchCurrentUser());
    }
  }, [auth.token, auth.userInfo, auth.loading, auth.error, dispatch]);

  // 3. Fetch schedule status on login
  useEffect(() => {
    if (auth.token) {
      dispatch(listScheduleBlocks());
    }
  }, [auth.token, dispatch]);

  const isLoggedIn = !!auth.token;

  if (isLoggedIn) {
    return (
      <Router>
        <Sidebar />
        <div className='main-content'>
          <Routes>
            <Route path='/' element={<Landing />} exact />
            
            {/* 4. Wrapped Routes: Locked until Schedule is Scanned */}
            <Route path='/preferences' element={
              <ScheduleGate>
                <Preferences />
              </ScheduleGate>
            } />
            
            <Route path='/dashboard' element={
              <ScheduleGate>
                <Dashboard />
              </ScheduleGate>
            } />
            
            <Route path='/schedule-overview' element={
              <ScheduleGate>
                <ScheduleOverview />
              </ScheduleGate>
            } />
            
            <Route path='/tasks/new' element={
              <ScheduleGate>
                <AddTask />
              </ScheduleGate>
            } />
            
            <Route path='/calendar' element={
              <ScheduleGate>
                <SubmissionCalendar />
              </ScheduleGate>
            } />

            <Route path='/folders' element={
              <ScheduleGate>
                <CourseFolderScreen />
              </ScheduleGate>
            } />

            {/* 5. Accessible Routes: These stay outside the gate */}
            <Route path="/scan" element={<SemesterScan />} />
            <Route path='/shop' element={<Shop />} />
            <Route path='/payment' element={<Payment />} />
            <Route path='/login' element={<LoginPage />} />
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
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<Signup />} />
            {/* Keeping these for safety, though PrivateRoute handles them */}
            <Route path='/folders' element={isAuthenticated ? <CourseFolderScreen /> : <Navigate to='/login' />} />
            <Route path='/calendar' element={<PrivateRoute><SubmissionCalendar /></PrivateRoute>} />
            <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </Router>
    );
  }
}