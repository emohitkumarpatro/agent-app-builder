import React from 'react';
import ReactMarkdown from 'react-markdown';
import './PlanDisplay.css';

export default function PlanDisplay({ plan, onContinue, onRegenerate, isGenerating }) {
    return (
        <div className="plan-display-container">
            <div className="plan-header">
                <h2 className="plan-title">📋 Implementation Plan</h2>
                <p className="plan-subtitle">Review the plan before we generate the code</p>
            </div>

            <div className="plan-content">
                <div className="markdown-content">
                    <ReactMarkdown>{plan}</ReactMarkdown>
                </div>
            </div>

            <div className="plan-actions">
                <button
                    onClick={onRegenerate}
                    className="action-btn secondary-btn"
                    disabled={isGenerating}
                >
                    🔄 Regenerate Plan
                </button>
                <button
                    onClick={onContinue}
                    className="action-btn primary-btn"
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <span className="spinner"></span>
                            Generating Code...
                        </>
                    ) : (
                        <>
                            ✅ Approve & Generate Code
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
