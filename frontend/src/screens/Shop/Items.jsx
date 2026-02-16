import React from 'react'
import {Card} from 'react-bootstrap'
import './ShopComponents.css'

function Items({item, onClick}) {
    return (
        <Card className='card-container' onClick={onClick}>
            <Card.Img variant="top" src={item.image}/>
            <Card.Title>{item.name}</Card.Title>
            <Card.Text>{item.points}</Card.Text>
        </Card>
    )
}

export default Items;