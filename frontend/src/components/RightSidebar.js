import React, { useState } from 'react';
import './RightSidebar.css';
import ConnectionDialog from './ConnectionDialog';

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
  // Stored per-item connection values
  const [externalEndpoints, setExternalEndpoints] = useState({}); // { [itemId]: endpoint }
  const [externalTokens, setExternalTokens] = useState({}); // { [itemId]: token }
  const [verifyingItemId, setVerifyingItemId] = useState(null);
  // Dialog state
  const [pendingItemId, setPendingItemId] = useState(null);
  const [showConnDialog, setShowConnDialog] = useState(false);

  const getEndpoint = (id) => (externalEndpoints[id] || '').trim();
  const getToken = (id) => (externalTokens[id] || '').trim();

  const openConnDialogFor = (itemId) => {
    setPendingItemId(itemId);
    setShowConnDialog(true);
  };

  const closeConnDialog = () => {
    setPendingItemId(null);
    setShowConnDialog(false);
  };

  const confirmConnDialog = async ({ endpoint, token }) => {
    // Save values for this item
    const itemId = pendingItemId;
    setExternalEndpoints(prev => ({ ...prev, [itemId]: endpoint }));
    setExternalTokens(prev => ({ ...prev, [itemId]: token }));
    setShowConnDialog(false);

    // Proceed to enable now that we have values
    setPendingItemId(null);
    setVerifyingItemId(itemId);
    await new Promise(resolve => setTimeout(resolve, 500));
    setVerifyingItemId(null);
    setExternalItems(externalItems.map(i => i.id === itemId ? { ...i, toggled: true } : i));
    if (!category1Open) setCategory1Open(true);
  };

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

    // If missing per-item endpoint/token, open dialog
    const endpoint = getEndpoint(itemId);
    const token = getToken(itemId);
    if (!endpoint || !token) {
      openConnDialogFor(itemId);
      return;
    }

    setVerifyingItemId(itemId);
    await new Promise(resolve => setTimeout(resolve, 500));
    setVerifyingItemId(null);

    setExternalItems(externalItems.map(i => i.id === itemId ? { ...i, toggled: true } : i));
    if (!category1Open) {
      setCategory1Open(true);
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
                        <div className="toggle-actions">
                          {item.toggled && (
                            <button className="configure-btn" onClick={() => openConnDialogFor(item.id)}>Configure</button>
                          )}
                          {verifyingItemId === item.id ? (
                            <span>Verifying...</span>
                          ) : (
                            <label className="switch">
                              <input type="checkbox" checked={item.toggled} onChange={() => handleExternalToggle(item.id)} />
                              <span className="slider round"></span>
                            </label>
                          )}
                        </div>
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
      {showConnDialog && pendingItemId != null && (
        <ConnectionDialog
          title="Connect External MAS"
          initialEndpoint={externalEndpoints[pendingItemId] || ''}
          initialToken={externalTokens[pendingItemId] || ''}
          onConfirm={confirmConnDialog}
          onCancel={closeConnDialog}
        />
      )}
    </div>
  );
};

export default RightSidebar; 