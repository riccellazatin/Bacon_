import {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from '../../redux/actions/authActions'
import { fetchPoints, updatePoints } from '../../redux/actions/pointsActions'
import {Row, Col} from 'react-bootstrap'

import Items from '../../screens/Shop/Items'
import ItemPopup from './ItemPopup'
import './Shop.css'
import './ShopComponents.css'
import axios from 'axios'

export default function Shop() {
    const [items, setItems] = useState([])

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
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);
    const points = useSelector((state) => state.points);

     useEffect(() => {
        if (auth.token && !auth.userInfo && !auth.loading && !auth.error) {
        dispatch(fetchCurrentUser());
        }   
     }, [auth.token, auth.userInfo, auth.loading, auth.error, dispatch]);
     
     // Fetch user points on mount and whenever auth changes
     useEffect(() => {
        if (auth.token) {
            dispatch(fetchPoints());
        }
     }, [auth.token, dispatch])
     
     useEffect(() => {
        async function fetchItems() {
            const {data} = await axios.get('http://127.0.0.1:8000/api/items/')
            setItems(data)
        }
        fetchItems()
     }, [])

  const isLoggedIn = !!auth.token;

  if (isLoggedIn){
    return (
        <div className="shop-background">
                <div className="points-header">
                    <h1 className='header'>Available Deals</h1>
                    <div className="user-points-display">
                        <span className="points-label">Total Points:</span>
                        <span className="points-value">{points?.total_points ?? auth.userInfo?.total_points ?? 0}</span>

                    </div>
                </div>
            <div className='shop-container'>
                <Row>
                    {items.map(item => (
                        <Col key={item._id} className='column'>
                            <Items item={item} onClick={() => handleCardClick(item)} />
                        </Col>
                    ))}
                </Row>
            </div>
            <ItemPopup 
                trigger={showPopup} 
                item={selectedItem} 
                onClose={closePopup} 
                onRecommendationClick={handleCardClick}
                userPoints={points?.total_points || 0}
                onPurchaseSuccess={() => {
                    // Refresh user points after purchase
                    dispatch(fetchPoints());
                }}
            />
        </div>
    );
    } else {
    return (
        <div className="shop-background">
                <h1 className='header'>Available Vouchers</h1>
            <div className='shop-container'>
                <Row>
                    {items.map(item => (
                        <Col key={item._id} className='column'>
                            <Items item={item} onClick={() => handleCardClick(item)} />
                        </Col>
                    ))}
                </Row>
            </div>
            <ItemPopup trigger={showPopup} item={selectedItem} onClose={closePopup} onRecommendationClick={handleCardClick} />
        </div>
    );       
    }
}