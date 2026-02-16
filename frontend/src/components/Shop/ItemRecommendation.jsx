import { Card } from 'react-bootstrap'
import './ShopComponents.css'
import {Row, Col} from 'react-bootstrap'
import ShopItems from '../../ShopItems'
import Items from '../../components/Shop/Items'

function ItemRecommendation({excludeItemId, onRecommendationClick}) {

  const handleCardClick = (item) => {
    if (onRecommendationClick) {
      onRecommendationClick(item)
    }
  }

  return (
    <div>
        <Row>
          {ShopItems ?.filter(item => item._id !== excludeItemId).slice(0, 4).map(item => (
            <Col key={item._id} className='column2'>
              <Items item={item} onClick={() => handleCardClick(item)} />
            </Col>
          ))}
        </Row>
    </div>
  )
}

export default ItemRecommendation
