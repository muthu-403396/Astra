import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import { getLlmResponse } from '../services/llmService';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const { username } = useParams();
  const location = useLocation();
  const persona = (location.state && location.state.persona) || localStorage.getItem('persona') || 'Business User';

  const personaQuestionsMap = {
    'Business User': [
      {
        text: 'What are the current sales trends?',
        plan: { type: 'sequential', steps: ['Data Analyst Assistant', 'BI Engineers Assistant', 'Business User Assistant'] }
      },
      {
        text: 'Generate a report on Q3 performance.',
        plan: { type: 'sequential', steps: ['BI Engineers Assistant', 'Business User Assistant'] }
      },
      {
        text: 'Summarize the latest market analysis.',
        plan: { type: 'parallel', steps: ['Data Analyst Assistant', 'Business User Assistant'] }
      },
      {
        text: 'What are our top-selling products?',
        plan: { type: 'sequential', steps: ['BI Engineers Assistant', 'Business User Assistant'] }
      }
    ],
    'Developer': [
      {
        text: 'How do I troubleshoot a failing build?',
        plan: { type: 'sequential', steps: ['Support Engineer Agent', 'KEDB Agent'] }
      },
      {
        text: 'Show the API contract for the orders service.',
        plan: { type: 'sequential', steps: ['KEDB Agent'] }
      },
      {
        text: 'What is the error budget for the checkout API?',
        plan: { type: 'sequential', steps: ['Data Analyst Assistant', 'Support Engineer Agent'] }
      },
      {
        text: 'List recent deployments and their status.',
        plan: { type: 'sequential', steps: ['Support Engineer Agent', 'Incident History Agent'] }
      }
    ],
  };

  const rotatingPlans = [
    { type: 'sequential', steps: ['Incident History Agent', 'Support Engineer Agent'] },
    { type: 'parallel', steps: ['Data Analyst Assistant', 'BI Engineers Assistant'] },
    { type: 'sequential', steps: ['KEDB Agent', 'Support Engineer Agent', 'Incident History Agent'] },
    { type: 'sequential', steps: ['BI Engineers Assistant', 'Business User Assistant'] },
    { type: 'parallel', steps: ['KEDB Agent', 'Data Analyst Assistant', 'BI Engineers Assistant'] },
  ];

  const defaultPersonaQuestions = personaQuestionsMap[persona] || [];

  const [sessions, setSessions] = useState([
    { id: 1, messages: [], questions: defaultPersonaQuestions }
  ]);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [nextSessionId, setNextSessionId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPlanIndex, setNextPlanIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [sidebarWidth, setSidebarWidth] = useState(250);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const formatPlanMessage = (plan) => {
    if (!plan) return '';
    const { type, steps } = plan;
    if (type === 'parallel') {
      return `I will run these agents in parallel: ${steps.join(', ')}.`;
    }
    const numbered = steps.map((s, i) => `${i + 1}. ${s}`).join(' → ');
    return `Here is the planned sequence of agents: ${numbered}.`;
  };

  const runThoughtSequence = (finalText, sessionId) => {
    setIsLoading(true);
    const thoughtTexts = [
      'Analyzing your request…',
      'Identifying relevant agents…',
      'Optimizing execution order…',
    ];

    let delay = 1000; // 1s to first thought
    thoughtTexts.forEach((text) => {
      setTimeout(() => {
        setSessions(prev => prev.map(s => {
          if (s.id !== sessionId) return s;
          return { ...s, messages: [...s.messages, { text, sender: 'thought' }] };
        }));
      }, delay);
      delay += 1000; // 1s between thoughts
    });

    setTimeout(() => {
      setSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s;
        return { ...s, messages: [...s.messages, { text: finalText, sender: 'bot' }] };
      }));
      setIsLoading(false);
    }, delay + 1000); // 1s after last thought
  };

  const handleSendMessage = async (message) => {
    const currentSessionId = activeSessionId;
    const newMessages = [...activeSession.messages, { text: message, sender: 'user' }];
    const updatedSession = { ...activeSession, messages: newMessages };
    setSessions(sessions.map(s => s.id === activeSessionId ? updatedSession : s));

    const plan = rotatingPlans[nextPlanIndex % rotatingPlans.length];
    const botText = formatPlanMessage(plan);
    setNextPlanIndex((nextPlanIndex + 1) % rotatingPlans.length);

    runThoughtSequence(botText, currentSessionId);
  };

  const handlePromptSelect = (prompt) => {
    const currentSessionId = activeSessionId;
    const userText = prompt.text || String(prompt);
    const appended = [
      ...activeSession.messages,
      { text: userText, sender: 'user' },
    ];
    const updatedSession = { ...activeSession, messages: appended };
    setSessions(sessions.map(s => s.id === activeSessionId ? updatedSession : s));

    const botText = formatPlanMessage(prompt.plan);
    runThoughtSequence(botText, currentSessionId);
  };

  const handleNewChat = () => {
    const existingBlank = sessions.find(s => s.messages.length === 0);
    if (existingBlank) {
      setSessions(sessions.map(s => s.id === existingBlank.id ? { ...s, questions: defaultPersonaQuestions } : s));
      setActiveSessionId(existingBlank.id);
      return;
    }
    const newSession = { id: nextSessionId, messages: [], questions: defaultPersonaQuestions };
    setSessions([...sessions, newSession]);
    setActiveSessionId(nextSessionId);
    setNextSessionId(nextSessionId + 1);
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
  };
  
  const handleAgentSelect = () => {
    // FAQ is based on persona; ignore agent selection for prompts
  };

  const handleResizeSidebar = (newWidth) => {
    const clamped = Math.max(160, Math.min(newWidth, 480));
    if (clamped <= 80) {
      setSidebarCollapsed(true);
    } else {
      if (sidebarCollapsed) setSidebarCollapsed(false);
      setSidebarWidth(clamped);
    }
  };

  const containerClass = `chatbot-page${sidebarCollapsed ? ' collapsed' : ''}${theme === 'dark' ? ' theme-dark' : ''}`;
  const containerStyle = { gridTemplateColumns: `${sidebarCollapsed ? 64 : sidebarWidth}px 1fr` };

  return (
    <div className={containerClass} style={containerStyle}>
      <Sidebar 
        username={username} 
        onAgentSelect={handleAgentSelect}
        onNewChat={handleNewChat}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        activeSessionId={activeSessionId}
        persona={persona}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onResize={handleResizeSidebar}
      />
      <div className="main-content">
        <Header />
        <Chatbot 
          messages={activeSession.messages}
          questions={activeSession.questions}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onPromptSelect={handlePromptSelect}
        />
      </div>
    </div>
  );
};

export default ChatbotPage; 