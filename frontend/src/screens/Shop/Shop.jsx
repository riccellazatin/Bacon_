import {useState} from 'react'

import {Row, Col} from 'react-bootstrap'
import ShopItems from '../../ShopItems'
import Items from '../../screens/Shop/Items'
import ItemPopup from './ItemPopup'
import './Shop.css'
import './ShopComponents.css'

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
                <h1 className='header'>Available Deals</h1>
            <div className='shop-container'>
                <Row>
                    {ShopItems.map(item => (
                        <Col key={item._id} className='column'>
                            <Items item={item} onClick={() => handleCardClick(item)} />
                        </Col>
                    ))}
                </Row>
            </div>
            <ItemPopup trigger={showPopup} item={selectedItem} onClose={closePopup} onRecommendationClick={handleCardClick} />
        </div>
    )
}

export default Shop;