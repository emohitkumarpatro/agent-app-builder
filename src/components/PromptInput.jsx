import React from 'react';
import './PromptInput.css';

export default function PromptInput({ onSubmit, isLoading, initialValue = '' }) {
    const [prompt, setPrompt] = React.useState(initialValue);

    React.useEffect(() => {
        setPrompt(initialValue);
    }, [initialValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
        }
    };

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="prompt-input-container">
            <h1 className="app-title">
                <span className="gradient-text">AI App Generator</span>
            </h1>
            <p className="app-subtitle">Describe your app idea and watch it come to life</p>

            <form onSubmit={handleSubmit} className={`prompt-form ${isLoading ? 'loading' : ''}`}>
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-content">
                            <div className="professional-spinner"></div>
                            <h3>Generating implementation plan...</h3>
                            <p>Analyzing requirements and architecting your solution</p>
                        </div>
                    </div>
                )}

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe the app you want to create... 

Examples:
• A todo list with add, edit, and delete functionality
• An interactive calculator with scientific functions
• A weather dashboard with current conditions and forecast
• A markdown editor with live preview"
                    className="prompt-textarea"
                    disabled={isLoading}
                    rows={10}
                />

                <div className="prompt-footer">
                    <div className="char-count">
                        {prompt.length} characters
                    </div>
                    <button
                        type="submit"
                        className="generate-btn"
                        disabled={!prompt.trim() || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <span className="sparkle">✨</span>
                                Generate Plan
                            </>
                        )}
                    </button>
                </div>

                <p className="keyboard-hint">
                    Press <kbd>⌘</kbd> + <kbd>Enter</kbd> to generate
                </p>
            </form>
        </div>
    );
}
