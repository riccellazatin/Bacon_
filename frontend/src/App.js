import logo from './logo.svg';
import './App.css';
import Landing from './screens/Landing/Landing';
import About from './screens/About/About';
import React from 'react';

function App() {
  return (
    <section className="App">
      <div id="home" className="landing-body">
        <Landing />
      </div>

      <div id="about" className="about-body">
        <About />
      </div>
    </section>
  );
}

export default App;
