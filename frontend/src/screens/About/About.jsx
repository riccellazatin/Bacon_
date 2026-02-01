import React from 'react'
import './About.css'
import Footer from '../../components/Footer/Footer'

function About() {
  return (
    <>
    <div className="about-section">
        <div className="about1">
            <img src="./images/study.jpg" alt="Guy Studying" />
        </div>

        <div className="about2">
            <h1 className="clutter-title">Remove your clutter</h1>

            <p className="clutter-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

            <div className="clutter-box">
                <h1 className="clutter-slogan">Less grease, More ease</h1>
            </div>
        </div>
    </div>

    <Footer />
    </>
  )
}

export default About