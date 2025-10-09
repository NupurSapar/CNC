// src/LoginPage.js
import React, { useState } from 'react';
import logoImage from './elliot.png';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple dummy login - any username/password works
    setTimeout(() => {
      onLogin(true);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '900px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '600px'
      }}>
        {/* Left Panel */}
        <div style={{
          background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          color: 'white',
          position: 'relative'
        }}>
          <img 
            src={logoImage} 
            alt="Elliot Systems" 
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              marginBottom: '30px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              background: 'white',
              padding: '10px'
            }}
          />
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'center'
          }}>Elliot Systems</h1>
          <p style={{
            fontSize: '18px',
            fontWeight: '300',
            textAlign: 'center',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Advanced Manufacturing<br />
            Intelligence Platform
          </p>
        </div>

        {/* Right Panel */}
        <div style={{
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>Welcome Back</div>
          <div style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '40px'
          }}>
            Sign in to access your dashboard
          </div>

          <form style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }} onSubmit={handleSubmit}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '8px'
              }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 50px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    background: '#fafbfc',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF6600';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.background = '#fafbfc';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '8px'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '16px 50px 16px 50px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    background: '#fafbfc',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF6600';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.background = '#fafbfc';
                  }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '8px'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              {isLoading && (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#495057',
              marginBottom: '8px'
            }}>DUMMY LOGIN</div>
            <div style={{
              fontSize: '13px',
              color: '#6c757d'
            }}>
              Enter any username and password
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '14px',
            color: '#666'
          }}>
            © 2025 Elliot Systems. All rights reserved.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
