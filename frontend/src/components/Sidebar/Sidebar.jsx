import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/actions/authActions'
import './Sidebar.css'

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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
        <button className='sidebar-links' onClick={closeSidebar}><Link to="/shop">Shop</Link></button>
        <button className='sidebar-links' onClick={closeSidebar}><Link to="/dashboard">To-Do</Link></button>
        <button className='sidebar-links' onClick={closeSidebar}><Link to="/calendar">Calendar</Link></button>
        <button className='logout-button' onClick={handleLogout}>Logout</button>
      </div>
    </>
  )
}

export default Sidebar
