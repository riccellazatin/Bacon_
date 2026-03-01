import { Navbar, Container} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/actions/authActions'
import './Sidebar.css'

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  return (
    <div className='sidebar'>
          <strong className="logo">B</strong>
            <ul>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/dashboard">To-Do</Link></li>
                <li><Link to="/calendar">Calendar</Link></li>
            </ul>
                <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Sidebar
