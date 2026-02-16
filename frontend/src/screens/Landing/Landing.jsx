import React from 'react'
import './Landing.css'
import Header from '../../components/Header/Header'
import About from '../About/About'

function Landing() {
  return (
    <>
      <div className="header-section">
        <div className="landing1">
          <Header />
          <div className="bacon-title" style={{textAlign: "center"}}>
            <h1 className="head-title">Bacon</h1>
            <p className="head-desc">A plate for your tasty tasks.</p>

            <button className="head-button">Log In</button>
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


      <div id="about" className="about-body">
        <About />
      </div>

    </>
  )
}

export default Landing