import React from 'react';
import { FaCloudUploadAlt, FaIdCard, FaLock, FaShareAlt } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-header text-center animate-fadeInUp">
          <h2 className="section-title">What is <span className="text-gradient">DigiLocker?</span></h2>
          <p className="section-subtitle">
            A flagship initiative by the government aimed at 'Digital Empowerment' of citizens by providing access to authentic digital documents.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card glass-panel" style={{ '--delay': '0s' }}>
            <div className="about-icon-wrapper">
              <FaCloudUploadAlt className="about-icon" />
            </div>
            <h3 className="about-card-title">Cloud Storage</h3>
            <p className="about-card-text">
              Securely upload and store your essential documents like marksheets, certificates, and medical records in a highly secure cloud platform.
            </p>
          </div>

          <div className="about-card glass-panel" style={{ '--delay': '0.1s' }}>
            <div className="about-icon-wrapper">
              <FaIdCard className="about-icon" />
            </div>
            <h3 className="about-card-title">Authentic Records</h3>
            <p className="about-card-text">
              Directly fetch authentic government-issued documents like Aadhaar, Driving License, and PAN card straight from the issuing authorities.
            </p>
          </div>

          <div className="about-card glass-panel" style={{ '--delay': '0.2s' }}>
            <div className="about-icon-wrapper">
              <FaShareAlt className="about-icon" />
            </div>
            <h3 className="about-card-title">Easy Sharing</h3>
            <p className="about-card-text">
              Share digital copies of your verified documents seamlessly with requesting agencies remotely, saving time and physical effort.
            </p>
          </div>

          <div className="about-card glass-panel" style={{ '--delay': '0.3s' }}>
            <div className="about-icon-wrapper">
              <FaLock className="about-icon" />
            </div>
            <h3 className="about-card-title">Data Privacy</h3>
            <p className="about-card-text">
              End-to-end 256-bit encryption ensures that your data and privacy are fully protected. Only you control who has access to your documents.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
