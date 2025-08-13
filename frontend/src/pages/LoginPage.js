import React from 'react';
import LoginForm from '../components/LoginForm';
import './LoginPage.css';
import backgroundImage from '../assets/background.jpg';

const LoginPage = () => {
  return (
    <div className="login-page" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}>
      <div className="logo">
        <h1>IntelliOps 🤖</h1>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage; 