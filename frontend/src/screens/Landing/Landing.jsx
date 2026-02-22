import React from 'react'
import './Landing.css'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

function Landing({onClick, item, excludeItemId, onRecommendationClick}) {
  return (
    <>
    <Header />

      <div className="header-section">
        <div className="slogan-container">
          <h1 className="slogan">A PLATE FOR YOUR TASTY TASKS.</h1>

          <button className="register-button"><a href="/register">Join Us</a></button>
        </div>
      </div>

      <div className="item-section">
        <div className="item-container">
          <h1 className="featured">You make the task. We'll make sure it gets done.</h1>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Landing