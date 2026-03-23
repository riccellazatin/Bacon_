import './Landing.css'
import LandCard from '../../components/LandCard/LandCard'
import {Row, Col} from 'react-bootstrap'
import api from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Landing() {
  const [items, setItems] = useState([])

  const navigate = useNavigate();

  const handleCardClick = (item) => {
    navigate(`/shop`)
  }

     useEffect(() => {
        async function fetchItems() {
            const {data} = await api.get('/items/')
            setItems(data)
        }
        fetchItems()
     }, [])  

  return (
    <>
      <div className="header-section">
        <div className="header-left">
          <h1 className="title">BRING HOME THE BACON</h1>
          <p className="subtitle">Have you joined our community of students yet? Cook up some productivity with us!</p>

          <button className="register-button"><a href="/register">Register</a></button>
        </div>

        <div className="header-right">
          <img src="./images/bacon_landing.png" className="bacon-logo"/>
        </div>
      </div>

      <div className="item-section">
        <div className="item-container">
          <h1 className="featured">You make the task. We'll make sure it gets done.</h1>
          <p className="item-description">Improve task management speed and watch your productivity grow.</p>

          <center>
          <div className="feature-preview">
            <Row className="feature-row">
              {items
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
    </>
  )
}

export default Landing