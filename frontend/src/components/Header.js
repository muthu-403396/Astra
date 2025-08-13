import React from 'react';
import { FaCog } from 'react-icons/fa';
import './Header.css';
import cognizantImg from '../assets/cognizant.jpg';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img src={cognizantImg} alt="Cognizant" className="header-emblem" />
        <div className="project-selector">
          <label>Select Project</label>
          <select>
            {/* Options will be added later */}
          </select>
        </div>
      </div>
      <FaCog className="settings-icon" />
    </header>
  );
};

export default Header; 