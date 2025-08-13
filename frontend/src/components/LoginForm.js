import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaPen } from 'react-icons/fa';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState('Business User');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === '403396' && password === '1234') {
      localStorage.setItem('persona', persona);
      navigate(`/chatbot/${username}`, { state: { persona } });
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-form">
      <h2>Login to your Account</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <FaUser className="icon" />
          <input type="text" placeholder="abel" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="input-group">
          <FaLock className="icon" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="input-group persona-selector">
          <FaPen className="icon" />
          <label>Select Persona</label>
          <select value={persona} onChange={(e) => setPersona(e.target.value)}>
            <option>Business User</option>
            <option>Developer</option>
          </select>
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default LoginForm; 