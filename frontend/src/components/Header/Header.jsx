import React from 'react'
import './Header.css'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/actions/authActions'

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar className="navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="logo-nav">B</Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link as={Link} to="/about" className="nav-link">About</Nav.Link>
          <Nav.Link as={Link} to="/shop" className="nav-link">Shop</Nav.Link>
          <Nav.Link as={Link} to="/dashboard" className="nav-link">To-Do</Nav.Link>
          <Nav.Link as={Link} to="/calendar" className="nav-link">Calendar</Nav.Link>
        </Nav>

        <Nav>
          {!auth.token ? (
            <>
              <Nav.Link as={Link} to="/login" className="log-link">Log In</Nav.Link>
            </>
          ) : (
            <Nav.Link onClick={handleLogout} className="log-link">Logout</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  )
}

export default Header