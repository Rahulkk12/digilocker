import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      title: "Sign Up",
      desc: "Register using your mobile number and link your Aadhaar card for instant verification."
    },
    {
      num: "02",
      title: "Upload / Fetch",
      desc: "Fetch verified documents directly from issuing authorities or upload personal files."
    },
    {
      num: "03",
      title: "Store Securely",
      desc: "Your documents are stored in an encrypted cloud vault, fully safe from physical loss."
    },
    {
      num: "04",
      title: "Access & Share",
      desc: "Easily view and securely share documents with requesters through an online link or QR code."
    }
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="hiw-header text-center animate-fadeInUp">
          <h2 className="section-title">How It <span className="text-gradient">Works</span></h2>
          <p className="section-subtitle">
            A simple, intuitive, and seamless process designed to help you organize your digital life in minutes.
          </p>
        </div>

        <div className="hiw-steps-container">
          <div className="hiw-line"></div>
          <div className="hiw-grid">
            {steps.map((step, index) => (
              <div className="hiw-step" key={index}>
                <div className="hiw-num-container">
                  <div className="hiw-num">{step.num}</div>
                </div>
                <div className="hiw-content glass-panel">
                  <h3 className="hiw-title">{step.title}</h3>
                  <p className="hiw-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
