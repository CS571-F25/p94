
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import './App.css';
import Home from './components/Home';
import AboutMe from './components/AboutMe';
import NavBar from './components/NavBar';
import Projects from './components/Projects';
import Contact from './components/Contact';
import MapPage from './components/Map';
import { getCurrentUser } from './utils/auth';


function App() {
  const user = getCurrentUser();
  return (
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutMe />} />
        <Route path="/map" element={user ? <MapPage /> : <Navigate to="/" replace />} />
        {/* <Route path="/projects" element={<Projects />} /> */}
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
}

export default App
