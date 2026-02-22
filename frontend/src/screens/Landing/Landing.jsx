import React from 'react'
import './Landing.css'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import LandCard from '../../components/LandCard/LandCard'
import {Row, Col} from 'react-bootstrap'
import ShopItems from '../../ShopItems'
import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate();

  const handleCardClick = (item) => {
    navigate(`/shop`)
  }

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
          <p class="item-description">Improve task management speed and watch your productivity grow.</p>

          <center>
          <div className="feature-preview">
            <Row className="feature-row">
              {ShopItems
              .slice(0, 3)
              .map(item => (
                <Col key={item._id} className='column' md={4}>
                  <LandCard item={item} onClick={() => handleCardClick(item)} />
                </Col>
              ))}
            </Row>
          </div>
          </center>
          
          <div className="row-desc-container">
            <p className="row-description">Finish tasks and earn points for rewards!</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Landing