import React from 'react'
import './Header.css'
import { Navbar, Container, Nav } from 'react-bootstrap'

function Header() {
  return (
    <Navbar className="navbar">
      <Container>
          {/* Logo stays on the left */}
          <Navbar.Brand href="/Landing" className="logo-nav">Bacon</Navbar.Brand>

          {/* This Nav wrapper bundles the links together */}
          <Nav className="ms-auto nav-links-container">
            <Nav.Link href="#about" className="nav-link">About</Nav.Link>
            <Nav.Link href="#to-do" className="nav-link">To Do</Nav.Link>
            <Nav.Link href="survey" className="nav-link">Survey</Nav.Link>
          </Nav>
      </Container>
    </Navbar>
  )
}

export default Header