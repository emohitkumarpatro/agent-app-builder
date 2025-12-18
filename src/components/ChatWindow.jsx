import React from 'react';
import './ChatWindow.css';

export default function ChatWindow({ code, messages, onSendMessage, onBackToPreview, onStartOver }) {
    const [input, setInput] = React.useState('');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const message = input.trim();
        setInput('');
        setIsProcessing(true);

        try {
            await onSendMessage(message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="chat-window-container">
            <div className="chat-header">
                <div>
                    <h2 className="chat-title">💬 Improve Your App</h2>
                    <p className="chat-subtitle">Ask for changes and refinements</p>
                </div>
                <div className="chat-actions">
                    <button onClick={onBackToPreview} className="header-btn">
                        👁️ View Preview
                    </button>
                    <button onClick={onStartOver} className="header-btn secondary">
                        ✨ Start Over
                    </button>
                </div>
            </div>

            <div className="chat-layout">
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="message-avatar">
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="E.g., 'Make the buttons bigger' or 'Add a dark mode toggle'..."
                        className="chat-input"
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={!input.trim() || isProcessing}
                    >
                        {isProcessing ? '⏳' : '🚀'} {isProcessing ? 'Processing...' : 'Send'}
                    </button>
                </form>

                <p className="chat-hint">
                    Press <kbd>⌘</kbd> + <kbd>Enter</kbd> to send
                </p>
            </div>
        </div>
    );
}
