import React, { useState, useEffect } from "react";
import Routes from "./Routes";
import Navbar from "components/ui/Navbar";
import { ThemeProvider } from "components/ThemeProvider";
import { BrowserRouter } from "react-router-dom";
import Icon from "components/AppIcon";

function App() {
  // Default navbar to visible, but check local storage for user preference
  const [isNavbarVisible, setIsNavbarVisible] = useState(() => {
    const savedState = localStorage.getItem('navbarVisible');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Save navbar visibility preference
  useEffect(() => {
    localStorage.setItem('navbarVisible', JSON.stringify(isNavbarVisible));
  }, [isNavbarVisible]);

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          {/* Global Navbar - the only navbar in the app */}
          {isNavbarVisible && <Navbar toggleNavbar={toggleNavbar} />}
          
          <div className={`${isNavbarVisible ? 'pt-16' : 'pt-0'} transition-all duration-300`}>
            {/* Show navbar button - only visible when navbar is hidden */}
            {!isNavbarVisible && (
              <button 
                onClick={toggleNavbar}
                className="fixed top-4 right-4 z-50 p-2 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-all"
                aria-label="Show navigation"
                title="Show navigation"
              >
                <Icon name="Menu" size={20} className="text-white" />
              </button>
            )}
            
            <Routes />
          </div>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
