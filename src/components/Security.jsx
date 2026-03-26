import React from 'react';
import { FaShieldAlt, FaKey, FaFingerprint } from 'react-icons/fa';
import './Security.css';

const Security = () => {
  return (
    <section className="security pb-0" id="security">
      <div className="container security-container">
        <div className="security-image glass-panel animate-fadeInUp">
          <div className="security-shield-wrapper">
            <div className="shield-ring ring-1"></div>
            <div className="shield-ring ring-2"></div>
            <div className="shield-ring ring-3"></div>
            <FaShieldAlt className="main-shield" />
          </div>
        </div>

        <div className="security-content animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="hero-badge">
            <FaShieldAlt className="badge-icon" />
            <span>Bank-Grade Encryption</span>
          </div>
          <h2 className="section-title">Your Data is <br /> <span className="text-gradient">Fort Knox Secure</span></h2>
          <p className="security-desc">
            DigiLocker is built following standard software development life cycle processes with rigorous security checks. We employ robust architecture to ensure your privacy is uncompromised.
          </p>

          <div className="security-features">
            <div className="sec-feature">
              <div className="sec-icon"><FaKey /></div>
              <div className="sec-text">
                <h4>256-bit AES Encryption</h4>
                <p>Data in transit and rest flows through an encrypted channel.</p>
              </div>
            </div>
            <div className="sec-feature">
              <div className="sec-icon"><FaFingerprint /></div>
              <div className="sec-text">
                <h4>Biometric Authentication</h4>
                <p>Access relies on Aadhaar-based OTP and biometric verification.</p>
              </div>
            </div>
          </div>
          
          <button className="btn btn-outline mt-2">Read Security Policy</button>
        </div>
      </div>
    </section>
  );
};

export default Security;
