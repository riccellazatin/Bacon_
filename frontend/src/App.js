import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './screens/Landing/Landing';
import About from './screens/About/About';
import React from 'react';
import Survey from './screens/Survey/Survey';

// This is your "One Page" section
const MainLanding = () => (
  <>
    <div id="home" className="landing-body">
      <Landing />
    </div>
    <div id="about" className="about-body">
      <About />
    </div>
  </>
);

function App() {
  return (
    <Router>
      <section className="App">
        <Routes>
          {/* When at "/", show both Landing and About */}
          <Route path="/" element={<MainLanding />} />

          {/* When at "/availability", show ONLY the availability screen */}
          <Route path="/survey" element={<Survey />} />
        </Routes>
      </section>
    </Router>
  );
}

export default App;