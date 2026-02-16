import React from 'react'
import './Header.css'
import { Navbar, Container, Nav } from 'react-bootstrap'

function Header() {
  return (
    <Navbar className="navbar">
      <Container>
          <Navbar.Brand href="/" className="logo-nav">Bacon</Navbar.Brand>

          <Nav.Link href="/about" className="nav-link">About</Nav.Link>
          <Nav.Link href="/shop" className="nav-link">Shop</Nav.Link>
          <Nav.Link href="/login" className="nav-link">Log In</Nav.Link>
      </Container>
    </Navbar>
  )
}

export default Header