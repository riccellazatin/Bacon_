import React from 'react'
import './Landing.css'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

function Landing() {
  return (
    <>
    <Header />

      <div className="header-section">
        <div className="slogan-container">
          <h1 className="slogan">A PLATE FOR YOUR TASTY TASKS.</h1>

          <button className="register-button">Join Us</button>
        </div>
      </div>

      <div className="item-section">
        <div className="item-container">
          <h1 className="featured">Our Featured Items</h1>
          <p>Items go here</p>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Landing