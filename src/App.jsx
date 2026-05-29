import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VideoProvider } from './context/VideoContext';
import Portfolio from './pages/Portfolio';
import Navbar from './components/Navbar';
import ScrollNavigation from './components/ScrollNavigation';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <VideoProvider>
      <Router>
        <div className="app-container">
          {/* Global Background - Visible on all pages */}
          <div className="global-bg"></div>
          <div className="global-reel"></div>
          <div className="global-lines">
            <div className="global-scan-line"></div>
            <div className="global-scan-line"></div>
            <div className="global-scan-line"></div>
          </div>
          
          {/* Custom cursor can be restored later.
          <div id="cursor"></div>
          <div id="cursor-ring"></div>
          */}
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Portfolio />} />
            </Routes>
          </main>
          <ScrollNavigation />
        </div>
      </Router>
    </VideoProvider>
  );
}

export default App;
