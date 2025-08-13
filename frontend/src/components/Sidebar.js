import React, { useState, useRef } from 'react';
import Modal from 'react-modal';
import { 
  FaCog, 
  FaUserCircle, 
  FaHeadset, 
  FaFileAlt, 
  FaUser, 
  FaBriefcase, 
  FaChartLine, 
  FaGlobe,
  FaHistory,
  FaInfoCircle,
  FaSun,
  FaMoon,
  FaQuestionCircle,
  FaChevronLeft,
  FaChevronRight,
  FaPen,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import './Sidebar.css';

const agentList = [
  { 
    name: 'Business User Agent', 
    icon: <FaHeadset />, 
    questions: [
      'What are the current sales trends?',
      'Generate a report on Q3 performance.',
      'Summarize the latest market analysis.',
      'What are our top-selling products?',
    ]
  },
  { 
    name: 'Incident History Agent', 
    icon: <FaFileAlt />,
    questions: [
      'Show me the history of incident XYZ.',
      'What was the resolution for ticket #12345?',
      'Who was assigned to the last critical incident?',
      'List all incidents from the past week.',
    ]
  },
  { 
    name: 'KEDB Agent', 
    icon: <FaUser />,
    questions: [
      'Find articles related to "database connection issues".',
      'What is the standard procedure for a password reset?',
      'Show me the KEDB entry for "firewall configuration".',
      'Who is the SME for network infrastructure?',
    ]
  },
  { 
    name: 'BI Engineers Agent', 
    icon: <FaBriefcase />,
    questions: [
      'What is the current status of the data warehouse ETL job?',
      'Show me the schema for the "sales" table.',
      'Who has access to the BI reporting dashboard?',
      'What are the dependencies for the "marketing" data model?',
    ]
  },
  { 
    name: 'Data Analyst Agent', 
    icon: <FaChartLine />,
    questions: [
      'Run a cohort analysis on user engagement.',
      'What is the correlation between ad spend and conversions?',
      'Show me a time series forecast for user growth.',
      'What are the key drivers of customer churn?',
    ]
  },
  { 
    name: 'Support Engineer Agent', 
    icon: <FaGlobe />,
    questions: [
      'What is the SLA for a P1 incident?',
      'What are the steps to troubleshoot a "login issue"?',
      'Show me the on-call schedule for this week.',
      'What is the escalation path for a security incident?',
    ]
  },
];

Modal.setAppElement('#root');

const Sidebar = ({ username, onAgentSelect, onNewChat, sessions, onSelectSession, activeSessionId, persona, collapsed, onToggleCollapse, theme, onToggleTheme, onResize }) => {
  const [supportOpen, setSupportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const dragRef = useRef(null);

  const filteredSessions = sessions.filter(session => {
    if (!historyQuery) return true;
    const title = getSessionTitle(session);
    return title.toLowerCase().includes(historyQuery.toLowerCase());
  });

  const getSessionTitle = (session) => {
    const firstUserMsg = session.messages.find(m => m.sender === 'user');
    if (firstUserMsg && firstUserMsg.text) {
      return firstUserMsg.text.length > 40 ? `${firstUserMsg.text.slice(0, 40)}…` : firstUserMsg.text;
    }
    return `Chat #${session.id}`;
  };

  const onMouseDown = (e) => {
    if (!onResize) return;
    const startX = e.clientX;
    const startWidth = dragRef.current ? dragRef.current.getBoundingClientRect().width : 250;

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      onResize(startWidth + delta);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleHistoryClick = () => {
    if (collapsed && typeof onToggleCollapse === 'function') {
      onToggleCollapse();
      setHistoryOpen(true);
      return;
    }
    setHistoryOpen(!historyOpen);
  };

  const personaClass = persona && persona.toLowerCase().includes('developer') ? 'developer' : 'business';

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`} ref={dragRef}>
      <div className="resize-handle" onMouseDown={onMouseDown} title="Drag to resize" />
      <div className="top-row">
        <button className="collapse-btn" onClick={onToggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        {!collapsed && (
          <div className="theme-toggle" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="sidebar-header">
          <h2>
            <span className="logo-intelli">Astra</span>
            <span className="logo-ops">AI</span>
          </h2>
        </div>
      )}
      <div className="new-chat">
        <button onClick={onNewChat} className="chip-button" title="New chat">
          <FaPen /> {!collapsed && <span className="chip-text">New</span>}
        </button>
        <button className="chip-button" onClick={handleHistoryClick} title="History">
          <FaHistory /> {!collapsed && <span className="chip-text">History</span>}
        </button>
      </div>
      {!collapsed && (
        <div className="agent-info-banner" title="Agents are auto-selected by the system based on your question.">
          <FaInfoCircle />
          <span>Agents are auto-selected by the system based on your question.</span>
        </div>
      )}

      {!collapsed && (
        <div className="agent-or-history">
          {historyOpen ? (
            <div className="inline-history">
              <input
                className="history-search"
                type="text"
                placeholder="Search chats..."
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
              />
              <div className="chat-history">
                {filteredSessions.map(session => (
                  <div 
                    key={session.id} 
                    className={`history-item ${session.id === activeSessionId ? 'active' : ''}`}
                    onClick={() => onSelectSession(session.id)}
                    title={getSessionTitle(session)}
                  >
                    {getSessionTitle(session)}
                  </div>
                ))}
                {filteredSessions.length === 0 && (
                  <div className="history-empty">No chats match your search.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="agent-list">
              {agentList.map((agent, index) => (
                <div key={index} className="agent-item disabled" aria-disabled="true" title="Agents are auto-selected by the system based on your question.">
                  {agent.icon} <span className="agent-name">{agent.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="settings">
            <FaCog /> Settings
          </div>
        )}
        <div className="user-profile" title={username}>
          <FaUserCircle size={30} />
          {!collapsed && (
            <div>
              <strong>{username}</strong>
              <span className={`persona-badge ${personaClass}`}>{persona}</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="support-link" onClick={() => setSupportOpen(true)} title="Need help?">
            <FaQuestionCircle /> <span>Need help?</span>
          </div>
        )}
      </div>

      <Modal
        isOpen={supportOpen}
        onRequestClose={() => setSupportOpen(false)}
        className="history-modal"
        overlayClassName="history-overlay"
      >
        <h2>Support</h2>
        <p>If you need assistance, please contact our support team.</p>
        <p>
          Email: <a href="mailto:support@example.com">support@example.com</a><br/>
          Docs: <a href="https://example.com/docs" target="_blank" rel="noreferrer">Open documentation</a>
        </p>
        <button onClick={() => setSupportOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default Sidebar; 