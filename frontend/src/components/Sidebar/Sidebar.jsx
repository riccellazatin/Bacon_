import { Navbar, Container} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/actions/authActions'
import './Sidebar.css'

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  return (
    <div className='sidebar'>
      <strong className="logo">Bacon</strong>
        <button className='sidebar-links'><Link to="/shop">Shop</Link></button>
        <button className='sidebar-links'><Link to="/dashboard">To-Do</Link></button>
        <button className='sidebar-links'><Link to="/calendar">Calendar</Link></button>
        <button className='logout-button' onClick={handleLogout} >Logout</button>
    </div>
  )
}

export default Sidebar
