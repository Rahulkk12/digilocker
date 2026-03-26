import React, { useState } from 'react';
import { FaShieldAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import './Login.css';

const Login = ({ onBack, onNavigateRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Email or Mobile Number is required";
    if (!formData.password) tempErrors.password = "Password is required";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('digiLockerUsers') || '[]');
        const user = users.find(u => 
          (u.email === formData.email || u.mobile === formData.email) && 
          u.password === formData.password
        );

        if (user) {
          // Authentication successful
          localStorage.setItem('activeDigiLockerUser', JSON.stringify(user));
          setIsLoading(false);
          setIsSuccess(true);
          
          setTimeout(() => {
            onLoginSuccess(); 
          }, 1500);
        } else {
          // Authentication failed
          setErrors({ 
            email: "Invalid credentials", 
            password: "Check your email/mobile and password" 
          });
          setIsLoading(false);
        }
      }, 1000);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="login-container animate-fadeInUp">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> Back to Home
        </button>

        <div className="login-card glass-panel">
          <div className="login-header">
            <div className="login-logo text-center">
              <FaShieldAlt className="logo-icon" />
              <h2 className="logo-text">DigiLocker</h2>
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your secure digital wallet</p>
          </div>

          {isSuccess ? (
            <div className="login-success animate-fadeInUp">
              <FaCheckCircle className="success-icon" />
              <h3>Authentication Successful!</h3>
              <p>Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email or Mobile Number</label>
                <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
                  <FaEnvelope className="input-icon" />
                  <input
                    type="text"
                    id="email"
                    name="email"
                    placeholder="example@email.com or 9876543210"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <button 
                    type="button" 
                    className="toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#forgot" className="forgot-password">Forgot Password?</a>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary login-submit-btn" 
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="spinner" /> : "Sign In"}
              </button>
            </form>
          )}

          <div className="login-footer">
            <p>Don't have an account? <span onClick={onNavigateRegister} className="signup-link" style={{cursor: 'pointer'}}>Sign Up</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
