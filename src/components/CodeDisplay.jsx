import React from 'react';
import './CodeDisplay.css';

export default function CodeDisplay({ code, onContinue, onRegenerate, isLoading }) {
    const files = Object.keys(code);
    const [activeTab, setActiveTab] = React.useState('structure');
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (activeTab === 'structure') return;
        const textToCopy = code[activeTab] || '';
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Generate file structure from the code object
    const generateFileStructure = () => {
        const jsxFiles = files.filter(f => f.endsWith('.jsx'));
        const cssFiles = files.filter(f => f.endsWith('.css'));

        let structure = 'my-react-app/\n├── src/\n';

        jsxFiles.forEach((file, index) => {
            const isLast = index === jsxFiles.length - 1 && cssFiles.length === 0;
            structure += `│   ${isLast ? '└' : '├'}── ${file}\n`;
        });

        cssFiles.forEach((file, index) => {
            const isLast = index === cssFiles.length - 1;
            structure += `│   ${isLast ? '└' : '├'}── ${file}\n`;
        });

        structure += '├── package.json\n└── index.html';

        return structure;
    };

    const renderContent = () => {
        if (activeTab === 'structure') {
            return (
                <div className="file-structure">
                    <pre>{generateFileStructure()}</pre>
                    <div className="structure-note">
                        <strong>💡 React Project Structure:</strong> This is a complete React application with functional components and hooks.
                    </div>
                </div>
            );
        }
        return (
            <pre>
                <code className="language-jsx">
                    {code[activeTab] || 'No code generated for this file.'}
                </code>
            </pre>
        );
    };

    // Create tabs for structure + all files
    const tabs = [
        { id: 'structure', label: 'File Structure', icon: '📁' },
        ...files.map(filename => ({
            id: filename,
            label: filename,
            icon: filename.endsWith('.jsx') ? '⚛️' : '🎨'
        }))
    ];

    return (
        <div className="code-display-container">
            <div className="code-header">
                <h2 className="code-title">💻 Generated React Code</h2>
                <p className="code-subtitle">Review the React components and structure before previewing</p>
            </div>

            <div className="code-panel">
                <div className="code-tabs">
                    <div className="tabs-scroll">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {activeTab !== 'structure' && (
                        <button
                            className="copy-btn"
                            onClick={handleCopy}
                            title="Copy to clipboard"
                        >
                            {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    )}
                </div>

                <div className="code-content">
                    {renderContent()}
                </div>
            </div>

            <div className="code-actions">
                <button
                    onClick={onRegenerate}
                    className="action-btn secondary-btn"
                    disabled={isLoading}
                >
                    🔄 Regenerate Code
                </button>
                <button
                    onClick={onContinue}
                    className="action-btn primary-btn"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Loading Preview...
                        </>
                    ) : (
                        <>
                            🚀 Continue to Preview
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
