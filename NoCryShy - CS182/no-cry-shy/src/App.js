import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import Profile from './components/Profile';
import Navigation from './components/Navigation';
import Track from './components/Track';
import Resources from './components/Resources';
import Error from './components/Error';
import Calendar from './components/Calendar/Calendar';

 
class App extends Component {
  render() {
    return (      
      <div className = "App">
        <BrowserRouter>
          <div>
            <Navigation />
            <Routes>
                <Route path="/" element={<Profile />}/>
                <Route path="/track" element={<Track />}/>
                <Route path="/resources" element={<Resources />}/>
                <Route path = "*" element={<Error />}/>
                <Route path = "/calendar" element={<Calendar />}/>
            </Routes>
          </div> 
        </BrowserRouter>
      </div>
    );
  }
}
 
export default App;