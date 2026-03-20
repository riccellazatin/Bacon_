import './ShopComponents.css'
import {Row, Col, Card, Container} from 'react-bootstrap'
import ItemRecommendation from './ItemRecommendation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from '../../redux/actions/authActions'
import { useState, useEffect } from 'react'
import axios from 'axios'

function ItemPopup(props) {
    const [item, setItems] = useState([])

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            props.onClose()
        }
    }
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);

     useEffect(() => {
        if (auth.token && !auth.userInfo && !auth.loading && !auth.error) {
        dispatch(fetchCurrentUser());
        }   
     }, [auth.token, auth.userInfo, auth.loading, auth.error, dispatch]);

     useEffect(() => {
        async function fetchItems() {
            const {data} = await axios.get('http://127.0.0.1:8000/api/items/')
            setItems(data)
        }
        fetchItems()
     }, [])

    const isLoggedIn = !!auth.token;

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
                                    {!isLoggedIn ? (
                                    <button className='shop-button-login'><a href="/login">Log In to Purchase</a></button>
                                    ) : (
                                    <>
                                    <button className='shop-button'><a href="/login">Add to Cart</a></button>
                                    <button className='shop-button'><a href="/login">Buy Now</a></button>
                                    </>
                                    )}
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