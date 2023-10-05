import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './views/login.jsx';
import Signup from './views/signup.jsx';
import VideoPage from './views/videos.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/VideoPage" element={<VideoPage />} />
          </Routes>
      </Router>
  );
}


export default App;
