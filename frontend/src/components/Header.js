import React from 'react';
import './Header.css';

const Header = ({ persona, username }) => {
  const personaClass = persona && persona.toLowerCase().includes('developer') ? 'developer' : 'business';
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
            <option>Supply Chain</option>
            <option>Finance</option>
            <option>CDO</option>
          </select>
        </div>
        <div className="header-divider"></div>
        <div className="persona-right">
          <div className="persona-labels">
            {username && <span className="username">{username}</span>}
            {persona && <span className={`persona-badge ${personaClass}`}>{persona}</span>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 