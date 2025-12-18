import React from 'react';
import PromptInput from './components/PromptInput';
import PlanDisplay from './components/PlanDisplay';
import CodeDisplay from './components/CodeDisplay';
import PreviewWindow from './components/PreviewWindow';
import ChatWindow from './components/ChatWindow';
import aiService from './services/aiService';
import './App.css';

// Workflow states
const STATES = {
  PROMPT: 'prompt',
  GENERATING_PLAN: 'generating_plan',
  PLAN_REVIEW: 'plan_review',
  GENERATING_CODE: 'generating_code',
  CODE_REVIEW: 'code_review',
  PREVIEW: 'preview',
  CHAT: 'chat' // New state for iterative improvements
};

function App() {
  const [state, setState] = React.useState(STATES.PROMPT);
  const [userPrompt, setUserPrompt] = React.useState('');
  const [plan, setPlan] = React.useState('');
  const [code, setCode] = React.useState({}); // Changed to store multiple files
  const [error, setError] = React.useState(null);
  const [chatMessages, setChatMessages] = React.useState([]);

  // Handle prompt submission
  const handlePromptSubmit = async (prompt) => {
    setUserPrompt(prompt);
    setError(null);
    setState(STATES.GENERATING_PLAN);

    try {
      const generatedPlan = await aiService.generateImplementationPlan(prompt);
      setPlan(generatedPlan);
      setState(STATES.PLAN_REVIEW);
    } catch (err) {
      setError(err.message);
      setState(STATES.PROMPT);
    }
  };

  // Handle plan approval
  const handlePlanApproval = async () => {
    setError(null);
    setState(STATES.GENERATING_CODE);

    try {
      const generatedCode = await aiService.generateCode(userPrompt, plan);
      setCode(generatedCode);
      setState(STATES.CODE_REVIEW);
    } catch (err) {
      setError(err.message);
      setState(STATES.PLAN_REVIEW);
    }
  };

  // Handle plan regeneration
  const handlePlanRegenerate = async () => {
    setError(null);
    setState(STATES.GENERATING_PLAN);

    try {
      const generatedPlan = await aiService.generateImplementationPlan(userPrompt);
      setPlan(generatedPlan);
      setState(STATES.PLAN_REVIEW);
    } catch (err) {
      setError(err.message);
      setState(STATES.PLAN_REVIEW);
    }
  };

  // Handle code approval - move to preview
  const handleCodeApproval = () => {
    setState(STATES.PREVIEW);
  };

  // Handle code regeneration
  const handleCodeRegenerate = async () => {
    setError(null);
    setState(STATES.GENERATING_CODE);

    try {
      const generatedCode = await aiService.generateCode(userPrompt, plan);
      setCode(generatedCode);
      setState(STATES.CODE_REVIEW);
    } catch (err) {
      setError(err.message);
      setState(STATES.CODE_REVIEW);
    }
  };

  // Handle opening chat for improvements
  const handleOpenChat = () => {
    setChatMessages([{
      role: 'assistant',
      content: 'Hi! I can help you improve your app. What changes would you like to make?'
    }]);
    setState(STATES.CHAT);
  };

  // Handle chat message for improvements
  const handleChatMessage = async (message) => {
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setError(null);

    try {
      const updatedCode = await aiService.improveCode(userPrompt, code, message);
      setCode(updatedCode);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'ve updated your app based on your request. Check out the changes in the preview!'
      }]);
    } catch (err) {
      setError(err.message);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`
      }]);
    }
  };

  // Handle back to preview from chat
  const handleBackToPreview = () => {
    setState(STATES.PREVIEW);
  };

  // Handle start over
  const handleStartOver = () => {
    setState(STATES.PROMPT);
    setUserPrompt('');
    setPlan('');
    setCode({});
    setError(null);
    setChatMessages([]);
  };

  return (
    <div className="app">
      <div className="app-background"></div>

      <div className="app-content">
        {error && (
          <div className="error-notification">
            <span className="error-icon">⚠️</span>
            {error}
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {state === STATES.PROMPT && (
          <PromptInput
            onSubmit={handlePromptSubmit}
            isLoading={false}
          />
        )}

        {state === STATES.GENERATING_PLAN && (
          <PromptInput
            onSubmit={handlePromptSubmit}
            isLoading={true}
          />
        )}

        {state === STATES.PLAN_REVIEW && (
          <PlanDisplay
            plan={plan}
            onContinue={handlePlanApproval}
            onRegenerate={handlePlanRegenerate}
            isGenerating={false}
          />
        )}

        {state === STATES.GENERATING_CODE && (
          <PlanDisplay
            plan={plan}
            onContinue={handlePlanApproval}
            onRegenerate={handlePlanRegenerate}
            isGenerating={true}
          />
        )}

        {state === STATES.CODE_REVIEW && (
          <CodeDisplay
            code={code}
            onContinue={handleCodeApproval}
            onRegenerate={handleCodeRegenerate}
            isLoading={false}
          />
        )}

        {state === STATES.PREVIEW && (
          <PreviewWindow
            code={code}
            onStartOver={handleStartOver}
            onOpenChat={handleOpenChat}
          />
        )}

        {state === STATES.CHAT && (
          <ChatWindow
            code={code}
            messages={chatMessages}
            onSendMessage={handleChatMessage}
            onBackToPreview={handleBackToPreview}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}

export default App;
