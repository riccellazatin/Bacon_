import {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from '../../redux/actions/authActions'
import { fetchPoints, updatePoints } from '../../redux/actions/pointsActions'
import {Row, Col} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import Items from '../../screens/Shop/Items'
import ItemPopup from './ItemPopup'
import './Shop.css'
import './ShopComponents.css'
import axios from 'axios'

export default function Shop() {
    const navigate = useNavigate()
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
    const hasExclusiveAccess = auth.userInfo?.has_exclusive_access;

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

  const regularItems = items.filter(item => !item.is_exclusive)
  const exclusiveItems = items.filter(item => item.is_exclusive)

  if (isLoggedIn){
    return (
        <div className="shop-background">
            <h1 className='header'>Available Deals</h1>
                <div  className="points-header">
                    <div className="user-points-display">
                        <span className="points-label">Total Points:</span>
                        <span className="points-value">{points?.total_points ?? auth.userInfo?.total_points ?? 0}</span>
                </div>
                    </div>
            <div className='shop-container'>
                <Row>
                    {regularItems.map(item => (
                        <Col key={item._id} className='column'>
                            <Items item={item} onClick={() => handleCardClick(item)} />
                        </Col>
                    ))}
                </Row>

                {/* Exclusive Section */}
                <h2 className='header' style={{marginTop: '1rem', color: '#121212'}}>Exclusive Vouchers</h2>
                <Row>
                    {exclusiveItems.map(item => (
                        <Col key={item._id} className='column' style={{ opacity: hasExclusiveAccess ? 1 : 0.8 }}>
                            <div style={{ position: 'relative' }}>
                                <Items item={item} onClick={hasExclusiveAccess ? () => handleCardClick(item) : () => navigate('/payment')} />
                                {!hasExclusiveAccess && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                     cursor: 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                                    }} onClick={() => navigate('/payment')} title="Unlock Exclusive Items">
                                        <div style={{ fontSize: '2rem' }}>🔒</div>
                                    </div>
                                )}
                            </div>
                        </Col>
                    ))}
                </Row>
                
                {!hasExclusiveAccess && (
                    <div className="exclusive" style={{display: 'grid', justifySelf: 'center'}}>
                       <p style={{ marginBottom: '15px' }}>Unlock premium rewards and exclusive deals now!</p>
                       <button 
                           className='btn'
                           style={{ 
                                fontFamily: 'Quicksand',
                               backgroundColor: '#fd5732', 
                               color: 'white', 
                               fontWeight: 'bold', 
                               border: 'none', 
                               padding: '12px 30px',
                               borderRadius: '25px',
                               fontSize: '1.1rem',
                               boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                           }}
                           onClick={() => navigate('/payment')}
                       >
                           Get More Exclusive Vouchers
                       </button>
                    </div>
                )}
                
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
                    {regularItems.map(item => (
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