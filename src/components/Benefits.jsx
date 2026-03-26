import React from 'react';
import { FaLeaf, FaFileAlt, FaGlobe, FaClock } from 'react-icons/fa';
import './Benefits.css';

const Benefits = () => {
  return (
    <section className="benefits" id="benefits">
      <div className="container">
        <div className="benefits-header text-center animate-fadeInUp">
          <h2 className="section-title">Key <span className="text-gradient">Benefits</span></h2>
          <p className="section-subtitle">
            Transforming how you manage documents in the digital age.
          </p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-item animate-fadeInUp" style={{ animationDelay: '0s' }}>
            <div className="benefit-icon">
              <FaLeaf />
            </div>
            <div className="benefit-content">
              <h3>Eco-Friendly & Paperless</h3>
              <p>Contribute to a greener planet by eliminating the need for printing and carrying physical paper documents.</p>
            </div>
          </div>
          
          <div className="benefit-item animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="benefit-icon">
              <FaFileAlt />
            </div>
            <div className="benefit-content">
              <h3>Self-Attested E-Documents</h3>
              <p>Provide digitally signed and self-attested documents directly to agencies without any physical signatures.</p>
            </div>
          </div>

          <div className="benefit-item animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="benefit-icon">
              <FaGlobe />
            </div>
            <div className="benefit-content">
              <h3>Universal Acceptance</h3>
              <p>Documents issued directly via DigiLocker are treated at par with original physical documents across the country.</p>
            </div>
          </div>

          <div className="benefit-item animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="benefit-icon">
              <FaClock />
            </div>
            <div className="benefit-content">
              <h3>Real-Time Delivery</h3>
              <p>Receive sensitive documents like vehicle registration and driving licenses instantly upon issuance.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
