import React from 'react'
import './Landing.css'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

function Landing() {
  return (
    <>
      <div className="header-section">
        <div className="landing1">
          <Header />
          <div className="bacon-title">
            <h1 className="head-title">Bacon</h1>
            <p className="head-desc">A plate for your tasty tasks.</p>

            <a href="/login"><button href="/login" className="head-button">Log In</button></a>
          </div>
        </div>
        
        <div className="landing2">
          <h3 className="desc-tag">Let 'em cook</h3>

          <div className="description-section">
            <p className="desc-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Landing