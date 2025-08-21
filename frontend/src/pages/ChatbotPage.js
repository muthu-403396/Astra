import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import RightSidebar from '../components/RightSidebar';
import './ChatbotPage.css';
import cognizantImg from '../assets/cognizant.jpg';

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

const sidebarAgents = [
  'Business User Agent',
  'Support Engineer Agent',
  'Data Engineer Agent',
  'Data Analyst Agent',
  'BI Engineers Agent',
  'Incident History Agent',
  'KEDB Agent',
];

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

  const defaultPersonaQuestions = personaQuestionsMap[persona] || [];

  const [sessions, setSessions] = useState([
    { id: 1, messages: [], questions: defaultPersonaQuestions }
  ]);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [nextSessionId, setNextSessionId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true);
  const [externalItems, setExternalItems] = useState(initialExternalItems);
  const [internalItems, setInternalItems] = useState(initialInternalItems);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const generateRandomPlan = () => {
    const availableAgents = [...sidebarAgents];

    externalItems.forEach(item => {
      if (item.toggled) {
        item.subItems.forEach(subItem => {
          if (subItem.checked) {
            availableAgents.push(subItem.name);
          }
        });
      }
    });

    internalItems.forEach(item => {
      if (item.toggled) {
        availableAgents.push(item.name);
      }
    });

    if (availableAgents.length === 0) {
      return { type: 'sequential', steps: ['Default Agent'] };
    }

    const shuffled = availableAgents.sort(() => 0.5 - Math.random());
    const numStages = Math.floor(Math.random() * 3) + 2; // 2 to 4 stages
    const stages = [];
    let agentIndex = 0;

    for (let i = 0; i < numStages && agentIndex < shuffled.length; i++) {
      const stageSize = Math.floor(Math.random() * 2) + 1; // 1 or 2 agents per stage
      const stageAgents = shuffled.slice(agentIndex, agentIndex + stageSize);
      agentIndex += stageSize;

      if (stageAgents.length > 0) {
        const stageType = stageAgents.length > 1 && Math.random() > 0.5 ? 'parallel' : 'sequential';
        stages.push({ type: stageType, steps: stageAgents });
      }
    }

    return { type: 'sequential', steps: stages };
  };

  const formatPlanMessage = (plan) => {
    if (!plan || !plan.steps || plan.steps.length === 0) return 'No agents are available to form a plan.';
    
    const formatSteps = (steps, isNested = false) => {
      if (typeof steps[0] === 'object') { // It's a nested plan of stages
        return steps.map((stage, i) => `${isNested ? '' : `${i + 1}. `}${formatSteps(stage.steps, true)}`).join(' → ');
      }
      // It's a simple list of agents
      const type = plan.steps.some(s => typeof s === 'object' && s.type === 'parallel') ? 'parallel' : 'sequential';
      if (type === 'parallel') {
        return `Run in parallel: ${steps.join(', ')}`;
      }
      return steps.join(' → ');
    };

    return `Here is the planned sequence of agents: ${formatSteps(plan.steps)}.`;
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
    const flattenSteps = (steps) => {
      return steps.reduce((acc, step) => {
        if (typeof step === 'object' && step.steps) {
          return acc.concat(flattenSteps(step.steps));
        }
        return acc.concat(step);
      }, []);
    };
    const allAgentNames = flattenSteps(plan.steps);

    const runStepByName = (agentName, onComplete) => {
      updateMessageExecution(sessionId, messageId, (m) => {
        const steps = m.execution.steps.map(st => st.name === agentName ? { ...st, status: 'running' } : st);
        return { ...m, execution: { ...m.execution, steps } };
      });

      let seconds;
      updateMessageExecution(sessionId, messageId, (m) => {
        const step = m.execution.steps.find(st => st.name === agentName);
        seconds = step ? step.durationSeconds : 0;
        return m;
      });

      const interval = setInterval(() => {
        seconds -= 1;
        updateMessageExecution(sessionId, messageId, (m) => {
          const steps = m.execution.steps.map(st => st.name === agentName ? { ...st, remainingSeconds: Math.max(0, seconds) } : st);
          return { ...m, execution: { ...m.execution, steps } };
        });
        if (seconds <= 0) {
          clearInterval(interval);
          updateMessageExecution(sessionId, messageId, (m) => {
            const steps = m.execution.steps.map(st => st.name === agentName ? { ...st, status: 'success' } : st);
            return { ...m, execution: { ...m.execution, steps } };
          });
          if (typeof onComplete === 'function') onComplete();
        }
      }, 1000);
    };

    let stageIndex = 0;
    const runStage = () => {
      if (stageIndex >= plan.steps.length) {
        runStepByName('End', null); // End of all stages
        return;
      }

      const stage = plan.steps[stageIndex];
      if (stage.type === 'parallel') {
        let completed = 0;
        const onParallelComplete = () => {
          completed += 1;
          if (completed === stage.steps.length) {
            stageIndex += 1;
            runStage();
          }
        };
        stage.steps.forEach(agentName => runStepByName(agentName, onParallelComplete));
      } else { // sequential stage
        let agentInStageIndex = 0;
        const runNextInSeq = () => {
          if (agentInStageIndex >= stage.steps.length) {
            stageIndex += 1;
            runStage();
            return;
          }
          const agentName = stage.steps[agentInStageIndex];
          runStepByName(agentName, () => {
            agentInStageIndex += 1;
            runNextInSeq();
          });
        };
        runNextInSeq();
      }
    };

    runStepByName('Start', runStage);
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
      const allAgentSteps = plan.steps.flatMap(s => (typeof s === 'object' ? s.steps : s));
      const fullSteps = [
        { name: 'Start', status: 'pending', remainingSeconds: 3, durationSeconds: 3 },
        ...allAgentSteps.map(name => ({ name, status: 'pending', remainingSeconds: 10, durationSeconds: 10 })),
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

    setTimeout(() => {
      const plan = generateRandomPlan();
      const botText = formatPlanMessage(plan);
      runThoughtSequence(botText, currentSessionId, plan);
    }, 0);
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

    // Prompts can have a predefined plan, but for now, let's generate a dynamic one
    setTimeout(() => {
      const plan = generateRandomPlan();
      const botText = formatPlanMessage(plan);
      runThoughtSequence(botText, currentSessionId, plan);
    }, 0);
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
  const containerStyle = { gridTemplateColumns: `${sidebarCollapsed ? 64 : sidebarWidth}px 1fr ${rightSidebarCollapsed ? '64px' : '300px'}` };

  return (
    <>
      <img src={cognizantImg} alt="Cognizant" className="page-emblem" />
      <div className="top-bar">
        <Header />
      </div>
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
          <Chatbot 
            messages={activeSession.messages}
            questions={activeSession.questions}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onPromptSelect={handlePromptSelect}
          />
        </div>
        <RightSidebar
          collapsed={rightSidebarCollapsed}
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          externalItems={externalItems}
          internalItems={internalItems}
          setExternalItems={setExternalItems}
          setInternalItems={setInternalItems}
        />
      </div>
    </>
  );
};

export default ChatbotPage; 
