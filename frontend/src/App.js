import './App.css';
import Landing from './screens/Landing/Landing';
import About from './screens/About/About';
import Shop from './screens/Shop/Shop';
import Login from './screens/Login/Login';
import Signup from './screens/Signup/Signup';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <main className="py-3">
          <Routes>
            <Route path='/' element={<Landing />} exact />
            <Route path='/about' element={<About />} />
            <Route path='/shop' element={<Shop />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Signup />} />
          </Routes>
      </main>
    </Router>
  );
}

export default App;
