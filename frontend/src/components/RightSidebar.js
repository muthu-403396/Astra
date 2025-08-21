import React, { useState } from 'react';
import './RightSidebar.css';
import { simulateOAuth } from '../services/authService';
import LoginDialog from './LoginDialog';

const RightSidebar = ({
  collapsed,
  onToggleCollapse,
  externalItems,
  internalItems,
  setExternalItems,
  setInternalItems,
}) => {
  const [category1Open, setCategory1Open] = useState(false);
  const [category2Open, setCategory2Open] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [authenticatingItem, setAuthenticatingItem] = useState(null);
  const [verifyingItemId, setVerifyingItemId] = useState(null);

  const handleExternalToggle = async (itemId) => {
    const item = externalItems.find(i => i.id === itemId);
    if (!item) return;

    // If toggling off, just turn it off and reset sub-items
    if (item.toggled) {
      setExternalItems(externalItems.map(i =>
        i.id === itemId
          ? {
              ...i,
              toggled: false,
              subItems: i.subItems.map(sub => ({ ...sub, checked: false })),
            }
          : i
      ));
      return;
    }

    setVerifyingItemId(itemId);
    const isAuthenticated = await simulateOAuth();
    setVerifyingItemId(null);

    if (isAuthenticated) {
      setExternalItems(externalItems.map(i => i.id === itemId ? { ...i, toggled: true } : i));
      if (!category1Open) {
        setCategory1Open(true);
      }
    } else {
      setAuthenticatingItem(item);
      setShowLoginDialog(true);
    }
  };

  const handleExternalCheckboxChange = (itemId, subItemId) => {
    setExternalItems(externalItems.map(item =>
      item.id === itemId
        ? {
            ...item,
            subItems: item.subItems.map(subItem =>
              subItem.id === subItemId ? { ...subItem, checked: !subItem.checked } : subItem
            ),
          }
        : item
    ));
  };

  const handleDialogLogin = (username, password) => {
    // Simple check for username and password
    if (username === 'admin' && password === 'admin') {
      console.log(`Logging in with ${username}/${password}`);
      setShowLoginDialog(false);
      setExternalItems(externalItems.map(i => i.id === authenticatingItem.id ? { ...i, toggled: true } : i));
      if (!category1Open) {
        setCategory1Open(true);
      }
      setAuthenticatingItem(null);
    } else {
      alert('Invalid username or password');
    }
  };

  const handleDialogCancel = () => {
    setShowLoginDialog(false);
    setAuthenticatingItem(null);
  };

  const handleInternalToggle = (itemId) => {
    setInternalItems(internalItems.map(item =>
      item.id === itemId ? { ...item, toggled: !item.toggled } : item
    ));
    if (!category2Open) {
      setCategory2Open(true);
    }
  };

  const handleInternalCheckboxChange = (itemId, subItemId) => {
    setInternalItems(internalItems.map(item =>
      item.id === itemId
        ? {
            ...item,
            subItems: item.subItems.map(subItem =>
              subItem.id === subItemId ? { ...subItem, checked: !subItem.checked } : subItem
            ),
          }
        : item
    ));
  };

  return (
    <div className={`right-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button onClick={onToggleCollapse} className="toggle-btn">
        {collapsed ? '<' : '>'}
      </button>
      {!collapsed && (
        <div className="sidebar-content-wrapper">
          <h2>Multi Agent System</h2>
          <div className="categories-wrapper">
            <div className="category">
              <h3 onClick={() => setCategory1Open(!category1Open)}>
                <span>External</span>
                <span>{category1Open ? '-' : '+'}</span>
              </h3>
              {category1Open && (
                <div className="category-content">
                  {externalItems.map(item => (
                    <div key={item.id} className="toggle-item">
                      <div className="toggle-header">
                        <span>{item.name}</span>
                        {verifyingItemId === item.id ? (
                          <span>Verifying...</span>
                        ) : (
                          <label className="switch">
                            <input type="checkbox" checked={item.toggled} onChange={() => handleExternalToggle(item.id)} />
                            <span className="slider round"></span>
                          </label>
                        )}
                      </div>
                      {item.toggled && (
                        <div className="sub-items">
                          {item.subItems.map(subItem => (
                            <div key={subItem.id} className="checkbox-item">
                              <input
                                type="checkbox"
                                checked={subItem.checked}
                                onChange={() => handleExternalCheckboxChange(item.id, subItem.id)}
                              />
                              <label>{subItem.name}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="category">
              <h3 onClick={() => setCategory2Open(!category2Open)}>
                <span>Internal</span>
                <span>{category2Open ? '-' : '+'}</span>
              </h3>
              {category2Open && (
                <div className="category-content">
                  {internalItems.map(item => (
                    <div key={item.id} className="toggle-item">
                      <div className="toggle-header">
                        <span>{item.name}</span>
                        <label className="switch">
                          <input type="checkbox" checked={item.toggled} onChange={() => handleInternalToggle(item.id)} />
                          <span className="slider round"></span>
                        </label>
                      </div>
                      {item.toggled && (
                        <div className="sub-items">
                          {item.subItems.map(subItem => (
                            <div key={subItem.id} className="checkbox-item">
                              <input
                                type="checkbox"
                                checked={subItem.checked}
                                onChange={() => handleInternalCheckboxChange(item.id, subItem.id)}
                              />
                              <label>{subItem.name}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showLoginDialog && (
        <LoginDialog
          onLogin={handleDialogLogin}
          onCancel={handleDialogCancel}
        />
      )}
    </div>
  );
};

export default RightSidebar; 