import React, { useState, useEffect } from 'react';
import './LoginDialog.css';

const ConnectionDialog = ({
  initialEndpoint = '',
  initialToken = '',
  title = 'Set Connection',
  onConfirm,
  onCancel,
}) => {
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  const [token, setToken] = useState(initialToken);

  useEffect(() => {
    setEndpoint(initialEndpoint || '');
    setToken(initialToken || '');
  }, [initialEndpoint, initialToken]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!endpoint.trim() || !token.trim()) return;
    onConfirm && onConfirm({ endpoint: endpoint.trim(), token: token.trim() });
  };

  const handleCreateTicket = () => {
    const ts = new Date();
    const id = `REQ-${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    setTimeout(() => {
      alert(`Connection request created.\nRequest ID: ${id}\nSummary: Request API Endpoint and Token.`);
      onCancel && onCancel();
    }, 300);
  };

  return (
    <div className="login-dialog-overlay">
      <div className="login-dialog">
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="conn-endpoint">API Endpoint</label>
            <input
              type="text"
              id="conn-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/v1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="conn-token">Token</label>
            <input
              type="password"
              id="conn-token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token"
              required
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="request-btn" onClick={handleCreateTicket}>Request Connection</button>
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit">Connect</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionDialog; 