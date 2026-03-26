import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { FaShieldAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: 'Features', to: 'features' },
    { name: 'How It Works', to: 'how-it-works' },
    { name: 'Benefits', to: 'benefits' },
    { name: 'Security', to: 'security' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled glass-panel' : ''}`}>
      <div className="container nav-container">
        <div className="nav-logo">
          <FaShieldAlt className="logo-icon" />
          <span className="logo-text">DigiLocker</span>
        </div>

        {/* Desktop Menu */}
        <div className="nav-menu">
          {navLinks.map((link, index) => (
            <Link 
              key={index}
              activeClass="active"
              to={link.to}
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              className="nav-link"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="nav-actions desktop-actions">
          <a href="#login" className="nav-login" onClick={(e) => { e.preventDefault(); onLoginClick(); }}>Login</a>
          <button className="btn btn-primary nav-btn" onClick={onLoginClick}>Get Started</button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open glass-panel' : ''}`}>
        {navLinks.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            smooth={true}
            offset={-70}
            duration={500}
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="mobile-nav-actions">
          <button className="btn btn-primary w-full" onClick={onLoginClick}>Login / Get Started</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
