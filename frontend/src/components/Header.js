import React from 'react';
import { FaCog } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="project-selector">
        <label>Select Project</label>
        <select>
          {/* Options will be added later */}
        </select>
      </div>
      <FaCog className="settings-icon" />
    </header>
  );
};

export default Header; 