import React from 'react'
import './Header.css'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'


function Header() {
  return (
    <Navbar className="navbar">
      <Container>
          <Navbar.Brand as={Link} to="/" className="logo-nav">Bacon</Navbar.Brand>

          <Nav.Link href="#about" className="nav-link">About</Nav.Link>
          <Nav.Link as={Link} to="/shop" className="nav-link">Shop</Nav.Link>
          <Nav.Link as={Link} to="/register" className="nav-link">Register</Nav.Link>
      </Container>
    </Navbar>
  )
}

export default Header