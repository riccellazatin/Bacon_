import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <>
    <div className="footer">
        <h1 className="footer-title">Thanks for your curiosity!</h1>
        <div className="footer-content">
            <div className="logo">
                <img src="./images/logo.png" className="logo-content"/>
            </div>

            <div className="join">
                <h3 className="join-title">Try Some Bacon</h3>
                <p className="join-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <button className="join-button">Join Us</button>
            </div>

            <div className="contact">
                <h3 className="contact-title">Contact Us</h3>
                <p className="contact-content">Got some questions? Comments? Recommendations? Email us! <b>baconteam@gmail.com</b></p>
                <p className="contact-content-var2">Shoot us a text!</p>
                <p className="contact-content-var2"><b>+0991 234 5678</b></p>
            </div>
        </div>
    </div>
    </>
  )
}

export default Footer