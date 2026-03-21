import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/actions/authActions'
import './Sidebar.css'

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hasSchedule } = useSelector((state) => state.schedule);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleBack = () => {
    closeSidebar();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className='hamburger-menu' onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <strong className="logo">BACON</strong>
        <button className='sidebar-links back-button' onClick={handleBack}>← Back</button>
        <button className='sidebar-links' onClick={closeSidebar} disabled={!hasSchedule}><Link to="/dashboard" className={!hasSchedule ? 'disabled-link' : ''}>To-Do</Link></button>
        <button className='sidebar-links' onClick={closeSidebar} disabled={!hasSchedule}><Link to="/calendar" className={!hasSchedule ? 'disabled-link' : ''}>Calendar</Link></button>
        <button className='sidebar-links' onClick={closeSidebar} disabled={!hasSchedule}><Link to="/schedule-overview" className={!hasSchedule ? 'disabled-link' : ''}>Schedule</Link></button>
        <button className='sidebar-links' onClick={closeSidebar} disabled={!hasSchedule}><Link to="/folders" className={!hasSchedule ? 'disabled-link': ''}>Course Folders</Link></button>
        <button className='sidebar-links' onClick={closeSidebar}><Link to="/shop">Shop</Link></button>
        <button className='sidebar-links' onClick={closeSidebar}><Link to="/scan">Semester Scan</Link></button>
        <button className='sidebar-links' onClick={closeSidebar}><Link to="/preferences">Preferences</Link></button>
        <button className='logout-button' onClick={handleLogout}>Logout</button>
      </div>
    </>
  )
}

export default Sidebar
