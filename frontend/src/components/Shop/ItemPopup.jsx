import React from 'react'
import './ShopComponents.css'
import { Row, Col, Container, Card } from 'react-bootstrap'
import ItemRecommendation from './ItemRecommendation'

function ItemPopup(props) {
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      props.onClose()
    }
  }

  return (props.trigger && props.item) ? (
    <div className='popup' onClick={handleBackgroundClick}>
      <Container className='popup-inner'>
        <Row className='popup-row'>
          <Card className='popup-card'>
            <Col className='column1 image-column'>
              <img src={props.item.image} alt={props.item.name} />
            </Col>
            <Col className='column1 text-column'>
              <div className='text-content'>
                <div className='text-top'>
                  <h1>{props.item.name}</h1>
                  <p>{props.item.description}</p>
                </div>
                <div className='text-bottom'>
                  <p>{props.item.points}</p>
                  <button className="shop-button">Log In to Purchase</button>
                </div>
              </div>
            </Col>
          </Card>
        </Row>
        <Row className='recommendation-row'>
          <ItemRecommendation excludeItemId={props.item._id} onRecommendationClick={props.onRecommendationClick} />
        </Row>
      </Container>
      <button onClick={props.onClose} className='close-button'>X</button>
      {props.children}
    </div>
  ) : ""
}

export default ItemPopup
