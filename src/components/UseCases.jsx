import React from 'react';
import { FaGraduationCap, FaSuitcase, FaCar, FaHospital } from 'react-icons/fa';
import './UseCases.css';

const UseCases = () => {
  const cases = [
    {
      icon: <FaGraduationCap />,
      title: "Students",
      desc: "Store marksheets, degrees, and certificates safely for hassle-free admissions."
    },
    {
      icon: <FaSuitcase />,
      title: "Job Applications",
      desc: "Share verified credentials instantly with employers to speed up background checks."
    },
    {
      icon: <FaCar />,
      title: "Transport & Travel",
      desc: "Show digitally verified Driving License & RC during traffic checks."
    },
    {
      icon: <FaHospital />,
      title: "Healthcare",
      desc: "Maintain health records and share them with medical professionals securely."
    }
  ];

  return (
    <section className="use-cases" id="use-cases">
      <div className="container">
        <div className="uc-header text-center animate-fadeInUp">
          <h2 className="section-title">Built For <span className="text-gradient">Everyone</span></h2>
          <p className="section-subtitle">
            Whether you are a student, a professional, or a pensioner, DigiLocker simplifies your life by putting all your crucial documents in your pocket.
          </p>
        </div>

        <div className="uc-grid">
          {cases.map((uc, index) => (
            <div className="uc-card glass-panel" key={index} style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="uc-icon">{uc.icon}</div>
              <h3>{uc.title}</h3>
              <p>{uc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
