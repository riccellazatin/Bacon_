import { Card } from 'react-bootstrap';
import './LandCard.css'

function LandCard({item, onClick}) {
  return (
    <>
    <Card className='land-card' onClick={onClick}>
        <Card.Img variant="top" src={item.image}/>
        <Card.Title>{item.name}</Card.Title>
        <Card.Text>{item.points}</Card.Text>
    </Card>
    </>
  );
}

export default LandCard;