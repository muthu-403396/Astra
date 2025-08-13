import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import './Chatbot.css';

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

  return (
    <div className="chatbot-container">
      {messages.length === 0 ? (
        <div className="welcome-screen">
          <div className="logo">
            <h2>
              <span className="logo-intelli">Intelli</span>
              <span className="logo-ops">Ops</span> 🤖
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
              {msg.text}
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
        IntelliOps AI-Agent v1.1 ©2025
      </div>
    </div>
  );
};

export default Chatbot; 