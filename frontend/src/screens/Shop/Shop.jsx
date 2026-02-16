import react, {useState, useEffect} from 'react'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import {Row, Col} from 'react-bootstrap'
import ShopItems from '../../ShopItems'
import Items from '../../screens/Shop/Items'
import ItemPopup from './ItemPopup'
import './Shop.css'

function Shop() {
    const [selectedItem, setSelectedItem] = useState(null)
    const [showPopup, setShowPopup] = useState(false)

    const handleCardClick = (item) => {
        setSelectedItem(item)
        setShowPopup(true)
    }

    const closePopup = () => {
        setShowPopup(false)
        setSelectedItem(null)
    }

    return (
        <div className="shop-background">
            <div className='header-container'>
                <Header />
            </div>
            <h1 className='header'>Available Deals</h1>
            <div className="shop-body">
                <Row>
                    {ShopItems.map(item => (
                        <Col key={item._id} className='column'>
                            <Items item={item} onClick={() => handleCardClick(item)} />
                        </Col>
                    ))}
                </Row>
            </div>
            <ItemPopup trigger={showPopup} item={selectedItem} onClose={closePopup} onRecommendationClick={handleCardClick} />
            <Footer />
        </div>
    )
}

export default Shop;