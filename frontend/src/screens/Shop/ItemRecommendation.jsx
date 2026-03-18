import {Row, Col} from 'react-bootstrap'

import Items from '../../screens/Shop/Items'
import './ShopComponents.css'
import axios from 'axios'
import { useState, useEffect } from 'react'

function ItemRecommendation({excludeItemId, onRecommendationClick}) {
    const [items, setItems] = useState([])


    const handleCardClick = (item) => {
        if (onRecommendationClick) {
            onRecommendationClick(item)
        }
    }

        useEffect(() => {
        async function fetchItems() {
            const {data} = await axios.get('http://127.0.0.1:8000/api/items/')
            setItems(data)
        }
        fetchItems()
    }, [])
     
    return (
        <div>
            <Row>
                {items?.filter(item => item._id !== excludeItemId).slice(0, 4).map(item => (
                    <Col key={item._id} className='column2'>
                        <Items item={item} onClick={() => handleCardClick(item)} />
                    </Col>
                ))}
            </Row>
        </div>
    )
}

export default ItemRecommendation