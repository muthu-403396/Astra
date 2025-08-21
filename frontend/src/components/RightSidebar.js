import React, { useState } from 'react';
import './RightSidebar.css';

const initialExternalItems = [
  {
    id: 1,
    name: 'Google Agentspace',
    toggled: false,
    subItems: [
      { id: 'ga1', name: 'Vertex AI Agent', checked: false },
      { id: 'ga2', name: 'Dialogflow Agent', checked: false },
      { id: 'ga3', name: 'AutoML Agent', checked: false },
    ],
  },
  {
    id: 2,
    name: 'Azure AI Foundry',
    toggled: false,
    subItems: [
      { id: 'af1', name: 'Azure Bot Service Agent', checked: false },
      { id: 'af2', name: 'OpenAI Service Agent', checked: false },
      { id: 'af3', name: 'Cognitive Services Agent', checked: false },
    ],
  },
  {
    id: 3,
    name: 'AWS Bedrock',
    toggled: false,
    subItems: [
      { id: 'ab1', name: 'Titan Agent', checked: false },
      { id: 'ab2', name: 'Claude Agent', checked: false },
      { id: 'ab3', name: 'Jurassic Agent', checked: false },
    ],
  },
  {
    id: 4,
    name: 'Snowflake Cortex',
    toggled: false,
    subItems: [
      { id: 'sc1', name: 'Arctic Agent', checked: false },
      { id: 'sc2', name: 'Llama Agent', checked: false },
      { id: 'sc3', name: 'Mistral Agent', checked: false },
    ],
  },
  {
    id: 5,
    name: 'Agent Bricks',
    toggled: false,
    subItems: [
      { id: 'agb1', name: 'DBRX Agent', checked: false },
      { id: 'agb2', name: 'Dolly Agent', checked: false },
      { id: 'agb3', name: 'MLflow Agent', checked: false },
    ],
  },
];

const initialInternalItems = [
  {
    id: 1,
    name: 'AI Foundry',
    toggled: false,
    subItems: [],
  },
  {
    id: 2,
    name: 'Intelli Ops',
    toggled: false,
    subItems: [],
  },
];

const RightSidebar = ({ collapsed, onToggleCollapse }) => {
  const [category1Open, setCategory1Open] = useState(false);
  const [category2Open, setCategory2Open] = useState(false);
  const [externalItems, setExternalItems] = useState(initialExternalItems);
  const [internalItems, setInternalItems] = useState(initialInternalItems);

  const handleExternalToggle = (itemId) => {
    setExternalItems(externalItems.map(item =>
      item.id === itemId ? { ...item, toggled: !item.toggled } : item
    ));
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
        <>
          <h2>Multi Agent System</h2>
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
                      <label className="switch">
                        <input type="checkbox" checked={item.toggled} onChange={() => handleExternalToggle(item.id)} />
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
        </>
      )}
    </div>
  );
};

export default RightSidebar; 