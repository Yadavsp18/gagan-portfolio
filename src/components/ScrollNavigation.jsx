import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './ScrollNavigation.css';

const ScrollNavigation = () => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsAtTop(scrollTop < 100);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="scroll-navigation">
      <button 
        className="scroll-button" 
        onClick={isAtTop ? scrollToBottom : scrollToTop}
        title={isAtTop ? "Scroll to bottom" : "Scroll to top"}
      >
        {isAtTop ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>
    </div>
  );
};

export default ScrollNavigation;
