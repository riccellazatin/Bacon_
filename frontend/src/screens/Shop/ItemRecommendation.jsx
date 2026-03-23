import {Row, Col} from 'react-bootstrap'

import Items from '../../screens/Shop/Items'
import './ShopComponents.css'
import api from '../../api/axios'
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
            const {data} = await api.get('/items/')
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