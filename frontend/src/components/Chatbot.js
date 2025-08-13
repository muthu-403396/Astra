import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import './Chatbot.css';
import PlanGraphOverlay from './PlanGraphOverlay';

const defaultPrompts = [
  'My job has failed with duplicate issue..',
  'Escalation Id- What happened to escalation id..',
  'What is the current of the ticket ...',
  'Can you suggest the steps to resolve the ticket ...'
];

const Chatbot = ({ messages, questions, onSendMessage, isLoading, onPromptSelect }) => {
  const [input, setInput] = useState('');
  const [prompts, setPrompts] = useState(defaultPrompts.map(q => ({ text: q })));
  const [messagesContainer, setMessagesContainer] = useState(null);
  const [graphMsgId, setGraphMsgId] = useState(null);

  useEffect(() => {
    if (questions && questions.length > 0) {
      const normalized = questions.map(q =>
        typeof q === 'string' ? { text: q } : q
      );
      setPrompts(normalized);
    } else {
      setPrompts(defaultPrompts.map(q => ({ text: q })));
    }
  }, [questions]);

  useEffect(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages, isLoading, messagesContainer]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const renderChip = (st) => (
    <span className={`exec-chip ${st.status}`}>
      {st.name}
      {st.status === 'running' && (
        <span className="timer"> {Math.max(0, (st.durationSeconds || 0) - (st.remainingSeconds || 0))}s</span>
      )}
    </span>
  );

  const renderExecution = (msg) => {
    const execution = msg.execution;
    const plan = msg.plan;
    if (!execution || !execution.steps) return null;
    const isParallel = execution.type === 'parallel';
    return (
      <div className="execution sequential">
        {execution.steps.map((st, idx) => (
          <span key={idx} className="exec-item">
            {renderChip(st)}
            {!isParallel && idx < execution.steps.length - 1 && <span className="exec-arrow">→</span>}
          </span>
        ))}
        {plan && <button className="graph-btn" onClick={() => setGraphMsgId(msg.id)}>Graph</button>}
      </div>
    );
  };

  const selectedMsg = graphMsgId ? messages.find(m => m.id === graphMsgId) : null;

  return (
    <div className="chatbot-container">
      {messages.length === 0 ? (
        <div className="welcome-screen">
          <div className="logo">
            <h2>
              <span className="logo-intelli">Astra</span>
              <span className="logo-ops">AI</span>
            </h2>
          </div>
          <div className="example-prompts">
            {prompts.map((prompt, index) => (
              <div key={index} className="prompt-card" onClick={() => onPromptSelect && onPromptSelect(prompt)}>
                <div className="prompt-text">{prompt.text}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chatbot-messages" ref={setMessagesContainer}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div>{msg.text}</div>
              {msg.sender === 'bot' && msg.execution && (
                <div className="execution-wrap">
                  {renderExecution(msg)}
                </div>
              )}
            </div>
          ))}
          {isLoading && <div className="message bot typing-indicator"><span>.</span><span>.</span><span>.</span></div>}
        </div>
      )}
      <div className="chatbot-input">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
        />
        <FaPaperclip className="input-icon" />
        <button onClick={handleSend}><FaPaperPlane /></button>
      </div>
      <div className="chatbot-footer">
        Astra AI-Agent v1.1 ©2025
      </div>
      {selectedMsg && selectedMsg.plan && (
        <PlanGraphOverlay 
          plan={selectedMsg.plan} 
          execution={selectedMsg.execution}
          onClose={() => setGraphMsgId(null)} 
        />
      )}
    </div>
  );
};

export default Chatbot; 