import React from 'react';
import { FaCloud, FaCheckCircle, FaMobileAlt, FaShareSquare } from 'react-icons/fa';
import './Features.css';

const Features = () => {
  const features = [
    {
      id: 1,
      icon: <FaCloud />,
      title: "Secure Cloud Storage",
      desc: "Get 1GB of dedicated, encrypted cloud storage space to upload and manage your personal documents securely."
    },
    {
      id: 2,
      icon: <FaCheckCircle />,
      title: "Government Verified Documents",
      desc: "Fetch digitally signed and legally recognized documents verified by the Government of India."
    },
    {
      id: 3,
      icon: <FaMobileAlt />,
      title: "Easy Access Anytime",
      desc: "Your digital wallet is available 24/7 on your mobile or desktop. Never carry physical documents again."
    },
    {
      id: 4,
      icon: <FaShareSquare />,
      title: "Instant Sharing",
      desc: "Share your e-documents instantly with requesting authorities online. Fast, paperless, and trace-free."
    }
  ];

  return (
    <section className="features " id="features">
      <div className="container">
        <div className="features-header text-center animate-fadeInUp">
          <h2 className="section-title">Why Choose <span className="text-gradient">DigiLocker?</span></h2>
          <p className="section-subtitle">
            Experience complete convenience, security, and legality. Bringing authenticity to your digital life with cutting-edge features.
          </p>
        </div>

        <div className="features-list">
          {features.map((feature, index) => (
            <div 
              className="feature-card glass-panel" 
              key={feature.id}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
