import React from 'react';
import { FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content animate-fadeInUp">
          <div className="hero-badge">
            <FaShieldAlt className="badge-icon" />
            <span>Government Approved Security</span>
          </div>
          
          <h1 className="hero-title">
            Your Secure Digital <br />
            <span className="text-gradient">Document Wallet</span>
          </h1>
          
          <p className="hero-description">
            Store, access, and share your important documents anytime, anywhere. 
            Experience bank-grade security for your personal identification, certificates, and more.
          </p>
          
          <div className="hero-actions">
            <button className="btn btn-primary hero-btn">
              Get Started Now <FaArrowRight className="btn-icon" />
            </button>
            <button className="btn btn-outline hero-btn">
              View How It Works
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">150M+</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">6B+</span>
              <span className="stat-label">Documents</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">256-bit</span>
              <span className="stat-label">Encryption</span>
            </div>
          </div>
        </div>
        
        <div className="hero-image-wrapper animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="glass-panel hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="mockup-url">vault.digilocker.com</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line mt"></div>
                <div className="skeleton skeleton-line mt"></div>
              </div>
              <div className="mockup-content">
                <div className="skeleton skeleton-title"></div>
                <div className="mockup-grid">
                  <div className="skeleton skeleton-card">
                    <FaShieldAlt className="skeleton-icon" />
                    <div className="skeleton skeleton-text"></div>
                  </div>
                  <div className="skeleton skeleton-card"></div>
                  <div className="skeleton skeleton-card"></div>
                  <div className="skeleton skeleton-card"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
