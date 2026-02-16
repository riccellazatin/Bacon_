import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import Landing from './screens/Landing/Landing';
import Shop from './screens/Shop/Shop';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Landing />} exact/>
      <Route path="/shop" element={<Shop />} />
    </Routes>
    </Router>
  );
}

export default App;
