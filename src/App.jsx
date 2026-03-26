import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import Security from './components/Security';
import UseCases from './components/UseCases';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Check if user is already logged in for persistent sessions
    const activeUser = localStorage.getItem('activeDigiLockerUser');
    if (activeUser) {
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('activeDigiLockerUser');
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return <Login onBack={() => setCurrentPage('home')} onNavigateRegister={() => setCurrentPage('register')} onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'register') {
    return <Register onBack={() => setCurrentPage('home')} onNavigateLogin={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="app">
      <Navbar onLoginClick={() => setCurrentPage('login')} />
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Benefits />
      <Security />
      <UseCases />
      <Footer />
    </div>
  );
}

export default App;
