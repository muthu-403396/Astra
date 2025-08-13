import React from 'react';
import LoginForm from '../components/LoginForm';
import './LoginPage.css';
import backgroundImage from '../assets/background.jpg';
import cognizantImg from '../assets/cognizant.jpg';

const LoginPage = () => {
  return (
    <div className="login-page" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}>
      <img src={cognizantImg} alt="Cognizant" className="login-emblem" />
      <div className="logo">
        <h1>Astra AI</h1>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage; 