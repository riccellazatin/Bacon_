import './ShopComponents.css'
import {Row, Col, Card, Container} from 'react-bootstrap'
import ItemRecommendation from './ItemRecommendation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from '../../redux/actions/authActions'
import { useState, useEffect } from 'react'
import api from '../../api/axios'

function ItemPopup(props) {
    const [purchaseLoading, setPurchaseLoading] = useState(false)
    const [purchaseMessage, setPurchaseMessage] = useState(null)
    const [purchaseError, setPurchaseError] = useState(null)

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
            const {data} = await api.get('/items/')
            setItems(data)
        }
        fetchItems()
     }, [])

    const handlePurchase = async () => {
        if (!props.item) return
        
        setPurchaseLoading(true)
        setPurchaseMessage(null)
        setPurchaseError(null)
        
        try {
            const response = await api.post(
                `/items/${props.item._id}/purchase/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                }
            )
            
            setPurchaseMessage(`✓ ${response.data.detail}`)
            if (props.onPurchaseSuccess) {
                props.onPurchaseSuccess()
            }
            
            // Close popup after successful purchase
            setTimeout(() => {
                props.onClose()
            }, 1500)
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Failed to purchase item. Please try again.'
            setPurchaseError(errorMsg)
        } finally {
            setPurchaseLoading(false)
        }
    }

    const isLoggedIn = !!auth.token;
    const hasEnoughPoints = isLoggedIn && props.userPoints >= props.item?.points;

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
                                    <p className='points-display'>{props.item.points} <span>points</span></p>
                                    
                                    {purchaseMessage && <p className='purchase-success'>{purchaseMessage}</p>}
                                    {purchaseError && <p className='purchase-error'>{purchaseError}</p>}
                                    
                                    {!isLoggedIn ? (
                                        <button className='shop-button-login'><a href="/login">Log In to Purchase</a></button>
                                    ) : (
                                        <>
                                            <button 
                                                className={`shop-button ${!hasEnoughPoints ? 'disabled' : ''}`}
                                                onClick={handlePurchase}
                                                disabled={!hasEnoughPoints || purchaseLoading}
                                            >
                                                {purchaseLoading ? 'Processing...' : 'Buy Now'}
                                            </button>
                                            {!hasEnoughPoints && (
                                                <p className='insufficient-points'>
                                                    You need {props.item.points - props.userPoints} more points
                                                </p>
                                            )}
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