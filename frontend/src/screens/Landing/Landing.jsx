import React from 'react'
import './Landing.css'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import {Row, Col} from 'react-bootstrap'
import ShopItems from '../../ShopItems'
import Items from '../../screens/Shop/Items'

function Landing({onClick, item, excludeItemId, onRecommendationClick}) {
    const handleCardClick = (item) => {
        if (onRecommendationClick) {
            onRecommendationClick(item)
        }
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
          <h1 className="featured">Our Featured Items</h1>
          <button className="shop"><a href="/shop">View All Items</a></button>
        </div>
      </div>

      <div className="shop-preview">
        <Row>
          {ShopItems
          .slice(0, 3)
          .map(item => (
            <Col key={item._id} className='column'>
              <Items item={item} onClick={() => handleCardClick(item)} />
            </Col>
          ))}
        </Row>
      </div>

      <Footer />
    </>
  )
}

export default Landing