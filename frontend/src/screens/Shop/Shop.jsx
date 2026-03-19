import {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from '../../redux/actions/authActions'
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

  if (isLoggedIn){
    return (
        <div className="shop-background">
                <h1 className='header'>Available Deals</h1>
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
    } else {
    return (
        <div className="shop-background">
                <h1 className='header'>Available Deals</h1>
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