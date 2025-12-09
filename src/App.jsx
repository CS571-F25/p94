
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import AboutMe from './components/AboutMe';
import NavBar from './components/NavBar';
import Projects from './components/Projects';
import Contact from './components/Contact';
import MapPage from './components/Map';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import { getCurrentUser } from './utils/auth';


function App() {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    function onAuthChange() {
      setUser(getCurrentUser());
    }
    window.addEventListener('authChanged', onAuthChange);
    window.addEventListener('storage', onAuthChange);
    return () => {
      window.removeEventListener('authChanged', onAuthChange);
      window.removeEventListener('storage', onAuthChange);
    };
  }, []);

  return (
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutMe />} />
        <Route path="/map" element={user ? <MapPage /> : <Navigate to="/" replace />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" replace />} />
        <Route path="/user-profile/:email" element={<UserProfile />} />
        {/* <Route path="/projects" element={<Projects />} /> */}
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
}

export default App
