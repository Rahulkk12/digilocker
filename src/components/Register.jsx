import React, { useState } from 'react';
import { FaShieldAlt, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSpinner, FaCheckCircle, FaPhoneAlt } from 'react-icons/fa';
import './Register.css';

const Register = ({ onBack, onNavigateLogin }) => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    mobile: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!formData.fullName) tempErrors.fullName = "Full Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Enter a valid Email";
    if (!formData.mobile) tempErrors.mobile = "Mobile Number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) tempErrors.mobile = "Enter a valid 10-digit number";
    
    if (!formData.password) tempErrors.password = "Password is required";
    else if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      
      setTimeout(() => {
        // Save to localStorage mimicking backend user creation
        const users = JSON.parse(localStorage.getItem('digiLockerUsers') || '[]');
        const newUser = {
          id: Date.now().toString(),
          name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password, // Frontend mock
          createdAt: new Date().toISOString()
        };
        
        // Prevent duplicate emails
        if (users.find(u => u.email === formData.email || u.mobile === formData.mobile)) {
          setErrors({ email: "An account with this email/mobile already exists." });
          setIsLoading(false);
          return;
        }

        users.push(newUser);
        localStorage.setItem('digiLockerUsers', JSON.stringify(users));
        
        setIsLoading(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          onNavigateLogin(); // Redirect to login successfully
        }, 2000);
      }, 1500);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2" style={{ background: 'rgba(59, 130, 246, 0.2)' }}></div>
      </div>

      <div className="register-container animate-fadeInUp">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> Back to Home
        </button>

        <div className="login-card glass-panel" style={{ padding: '2rem 2.5rem' }}>
          <div className="login-header" style={{ marginBottom: '1.5rem' }}>
            <div className="login-logo text-center">
              <FaShieldAlt className="logo-icon" style={{ fontSize: '1.5rem' }} />
              <h2 className="logo-text" style={{ fontSize: '1.25rem' }}>DigiLocker</h2>
            </div>
            <h1 className="login-title" style={{ fontSize: '1.5rem' }}>Create an Account</h1>
            <p className="login-subtitle">Join the secure digital document network</p>
          </div>

          {isSuccess ? (
            <div className="login-success animate-fadeInUp">
              <FaCheckCircle className="success-icon" />
              <h3>Registration Successful!</h3>
              <p>Redirecting you to the login page...</p>
            </div>
          ) : (
            <form className="login-form register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Full Name</label>
                <div className={`input-wrapper ${errors.fullName ? 'has-error' : ''}`}>
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label>Email Address</label>
                  <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group half-width">
                  <label>Mobile Number</label>
                  <div className={`input-wrapper ${errors.mobile ? 'has-error' : ''}`}>
                    <FaPhoneAlt className="input-icon" />
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  {errors.mobile && <span className="error-message">{errors.mobile}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label>Password</label>
                  <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 6 chars"
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

                <div className="form-group half-width">
                  <label>Confirm Password</label>
                  <div className={`input-wrapper ${errors.confirmPassword ? 'has-error' : ''}`}>
                    <FaLock className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Repeat Min. 6 chars"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                    />
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary login-submit-btn" 
                disabled={isLoading}
                style={{ marginTop: '1rem' }}
              >
                {isLoading ? <FaSpinner className="spinner" /> : "Sign Up Securely"}
              </button>
            </form>
          )}

          <div className="login-footer">
            <p>Already have an account? <span onClick={onNavigateLogin} className="signup-link" style={{cursor: 'pointer'}}>Login here</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
