import React from 'react';
import { FaShieldAlt, FaTwitter, FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <FaShieldAlt className="logo-icon" />
              <span className="logo-text">DigiLocker</span>
            </div>
            <p className="footer-desc">
              Your secure digital document wallet. Empowering citizens through true digital verification and paperless processes.
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaLinkedinIn /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
            </div>
          </div>
          
          <div className="footer-links-wrapper">
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Use Cases</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Issuer Directory</a></li>
                <li><a href="#">Requester Directory</a></li>
                <li><a href="#">API Documentation</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Data Protection</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DigiLocker Inspired Demo. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Status</a>
            <a href="#">Press</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
