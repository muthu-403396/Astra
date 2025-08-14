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
        plan: { type: 'sequential', steps: ['Data Analyst Agent', 'BI Engineers Agent', 'Business User Agent'] }
      },
      {
        text: 'Generate a report on Q3 performance.',
        plan: { type: 'sequential', steps: ['BI Engineers Agent', 'Business User Agent'] }
      },
      {
        text: 'Summarize the latest market analysis.',
        plan: { type: 'parallel', steps: ['Data Analyst Agent', 'Business User Agent'] }
      },
      {
        text: 'What are our top-selling products?',
        plan: { type: 'sequential', steps: ['BI Engineers Agent', 'Business User Agent'] }
      }
    ],
    'Support Engineer': [
      {
        text: 'Investigate a P1 login outage.',
        plan: { type: 'sequential', steps: ['Incident History Agent', 'Support Engineer Agent', 'KEDB Agent'] }
      },
      {
        text: 'Troubleshoot intermittent API failures.',
        plan: { type: 'parallel', steps: ['Incident History Agent', 'KEDB Agent', 'Support Engineer Agent'] }
      },
      {
        text: 'Find similar past incidents and resolutions.',
        plan: { type: 'sequential', steps: ['Incident History Agent', 'KEDB Agent', 'Support Engineer Agent'] }
      },
      {
        text: 'Prepare escalation summary for management.',
        plan: { type: 'sequential', steps: ['Incident History Agent', 'Business User Agent'] }
      }
    ],
    'Data Engineer': [
      {
        text: 'Diagnose slow ETL pipeline last night.',
        plan: { type: 'sequential', steps: ['BI Engineers Agent', 'Data Analyst Agent'] }
      },
      {
        text: 'Validate schema changes for sales model.',
        plan: { type: 'parallel', steps: ['BI Engineers Agent', 'Support Engineer Agent'] }
      },
      {
        text: 'List upstream/downstream dependencies of the orders table.',
        plan: { type: 'sequential', steps: ['BI Engineers Agent'] }
      },
      {
        text: 'Create a data quality checklist for ingestion.',
        plan: { type: 'sequential', steps: ['BI Engineers Agent', 'Data Analyst Agent'] }
      }
    ],
    'Data Scientist': [
      {
        text: 'Build a churn prediction experiment plan.',
        plan: { type: 'parallel', steps: ['Data Analyst Agent', 'BI Engineers Agent'] }
      },
      {
        text: 'Feature importance for recent churn model.',
        plan: { type: 'sequential', steps: ['Data Analyst Agent'] }
      },
      {
        text: 'Gather cohorts and KPIs for A/B test design.',
        plan: { type: 'parallel', steps: ['Data Analyst Agent', 'Business User Agent'] }
      },
      {
        text: 'Explain anomalies in prediction drift.',
        plan: { type: 'sequential', steps: ['Data Analyst Agent', 'Support Engineer Agent'] }
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
        plan: { type: 'sequential', steps: ['Data Analyst Agent', 'Support Engineer Agent'] }
      },
      {
        text: 'List recent deployments and their status.',
        plan: { type: 'sequential', steps: ['Support Engineer Agent', 'Incident History Agent'] }
      }
    ],
  };

  const rotatingPlans = [
    { type: 'sequential', steps: ['Incident History Agent', 'Support Engineer Agent'] },
    { type: 'parallel', steps: ['Data Analyst Agent', 'BI Engineers Agent'] },
    { type: 'sequential', steps: ['KEDB Agent', 'Support Engineer Agent', 'Incident History Agent'] },
    { type: 'sequential', steps: ['BI Engineers Agent', 'Business User Agent'] },
    { type: 'parallel', steps: ['KEDB Agent', 'Data Analyst Agent', 'BI Engineers Agent'] },
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

  const updateMessageExecution = (sessionId, messageId, updater) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const messages = s.messages.map(m => {
        if (m.id !== messageId) return m;
        return updater(m);
      });
      return { ...s, messages };
    }));
  };

  const startExecutionSimulation = (sessionId, messageId, plan) => {
    const runStep = (index) => {
      updateMessageExecution(sessionId, messageId, (m) => {
        const steps = m.execution.steps.map((st, i) => i === index ? { ...st, status: 'running' } : st);
        return { ...m, execution: { ...m.execution, steps } };
      });
      let seconds = null;
      updateMessageExecution(sessionId, messageId, (m) => {
        const st = m.execution.steps[index];
        seconds = st.durationSeconds;
        return m;
      });
      const interval = setInterval(() => {
        seconds -= 1;
        updateMessageExecution(sessionId, messageId, (m) => {
          const steps = m.execution.steps.map((st, i) => i === index ? { ...st, remainingSeconds: Math.max(0, seconds) } : st);
          return { ...m, execution: { ...m.execution, steps } };
        });
        if (seconds <= 0) {
          clearInterval(interval);
          updateMessageExecution(sessionId, messageId, (m) => {
            const steps = m.execution.steps.map((st, i) => i === index ? { ...st, status: 'success' } : st);
            return { ...m, execution: { ...m.execution, steps } };
          });
          if (typeof runStep.onComplete === 'function') runStep.onComplete();
        }
      }, 1000);
    };

    if (plan.type === 'sequential') {
      let current = 0;
      const total = plan.steps.length + 2; // Start + steps + End
      const advance = () => {
        if (current >= total) return;
        runStep.onComplete = () => {
          current += 1;
          if (current < total) advance();
        };
        runStep(current);
      };
      advance();
    } else {
      const planCount = plan.steps.length;
      const endIndex = planCount + 1;
      const startIndex = 0;

      const onPlanStepComplete = (() => {
        let completed = 0;
        return () => {
          completed += 1;
          if (completed === planCount) {
            runStep.onComplete = null;
            runStep(endIndex);
          }
        };
      })();

      runStep.onComplete = () => {
        runStep.onComplete = onPlanStepComplete;
        for (let i = 1; i <= planCount; i += 1) {
          runStep(i);
        }
      };

      runStep(startIndex);
    }
  };

  const runThoughtSequence = (finalText, sessionId, plan) => {
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
      const messageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const fullSteps = [
        { name: 'Start', status: 'pending', remainingSeconds: 3, durationSeconds: 3 },
        ...plan.steps.map(name => ({ name, status: 'pending', remainingSeconds: 10, durationSeconds: 10 })),
        { name: 'End', status: 'pending', remainingSeconds: 1, durationSeconds: 1 },
      ];
      setSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s;
        return { ...s, messages: [...s.messages, { id: messageId, text: finalText, sender: 'bot', plan, execution: { type: plan.type, steps: fullSteps } }] };
      }));
      startExecutionSimulation(sessionId, messageId, plan);
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

    runThoughtSequence(botText, currentSessionId, plan);
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
    runThoughtSequence(botText, currentSessionId, prompt.plan);
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