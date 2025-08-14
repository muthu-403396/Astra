import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h2>
          <span className="logo-intelli">Astra</span>
          <span className="logo-ops">AI</span>
        </h2>
      </div>
      <div className="header-right">
        <div className="project-selector">
          <label>Project</label>
          <select>
            <option>Development</option>
            <option>Enhancement</option>
            <option>Support</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header; 