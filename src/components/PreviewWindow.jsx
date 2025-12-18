import React from 'react';
import JSZip from 'jszip';
import './PreviewWindow.css';

export default function PreviewWindow({ code, onStartOver, onOpenChat }) {
    const [showIframe, setShowIframe] = React.useState(true);

    // Generate React preview HTML
    const generateReactPreview = () => {
        const files = code || {};

        if (Object.keys(files).length === 0) {
            return `<!DOCTYPE html>
<html><body><div style="padding:50px;text-align:center;font-family:sans-serif;">
<h2>No code generated yet</h2>
</div></body></html>`;
        }

        // Find App component
        const appFile = files['App.jsx'] || '';

        // Get all other JSX files (components)
        const componentFiles = Object.entries(files)
            .filter(([name]) => name.endsWith('.jsx') && name !== 'App.jsx');

        // Combine all CSS
        const cssFiles = Object.entries(files).filter(([name]) => name.endsWith('.css'));
        const allCSS = cssFiles.map(([, content]) => content).join('\n\n');

        // Process App component - remove imports and export default
        let processedApp = appFile
            .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '') // Remove all imports
            .replace(/import\s+{[^}]+}\s+from\s+['"].*?['"];?\s*/g, '') // Remove named imports
            .replace(/export\s+default\s+function\s+App/g, 'function App')
            .replace(/export\s+default\s+App;?/g, '')
            .replace(/const\s+{\s*useState[^}]*}\s*=\s*React;?\s*/g, '') // Remove const { useState } = React
            .trim();

        // Process other components - remove imports and export default
        const processedComponents = componentFiles.map(([name, content]) => {
            const componentName = name.replace('.jsx', '');
            return content
                .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '') // Remove all imports
                .replace(/import\s+{[^}]+}\s+from\s+['"].*?['"];?\s*/g, '') // Remove named imports  
                .replace(new RegExp(`export\\s+default\\s+function\\s+${componentName}`, 'g'), `function ${componentName}`)
                .replace(new RegExp(`export\\s+default\\s+${componentName};?`, 'g'), '')
                .replace(/const\s+{\s*useState[^}]*}\s*=\s*React;?\s*/g, '') // Remove const { useState } = React
                .trim();
        }).join('\n\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      width: 100%;
      min-height: 100vh;
    }
    ${allCSS}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    // React hooks
    const { useState, useEffect, useRef, useCallback, useMemo, useReducer } = React;
    
    // Components
    ${processedComponents}
    
    // Main App component
    ${processedApp}
    
    // Render
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    } catch (error) {
      console.error('React rendering error:', error);
      document.getElementById('root').innerHTML = 
        '<div style="padding:50px;font-family:sans-serif;color:#f44336;">'+
        '<h2>⚠️ Preview Error</h2>'+
        '<p>'+error.message+'</p>'+
        '<p style="margin-top:20px;color:#666;">Check browser console for details.</p>'+
        '</div>';
    }
  </script>
</body>
</html>`;
    };

    const handleDownload = async () => {
        if (!code || Object.keys(code).length === 0) return;

        const zip = new JSZip();

        // Create project structure
        const srcFolder = zip.folder('my-react-app/src');
        const publicFolder = zip.folder('my-react-app/public');

        // Add all generated files to src folder
        Object.entries(code).forEach(([filename, content]) => {
            srcFolder.file(filename, content);
        });

        // Add src/index.js
        const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
        srcFolder.file('index.js', indexJs);

        // Add src/index.css if not already present
        if (!code['index.css']) {
            const indexCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;
            srcFolder.file('index.css', indexCss);
        }

        // Add public/index.html
        const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="React app created with AI App Generator" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
        publicFolder.file('index.html', indexHtml);

        // Add package.json
        const packageJson = {
            name: 'my-react-app',
            version: '1.0.0',
            private: true,
            dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                'react-scripts': '5.0.1'
            },
            scripts: {
                start: 'react-scripts start',
                build: 'react-scripts build',
                test: 'react-scripts test',
                eject: 'react-scripts eject'
            },
            eslintConfig: {
                extends: ['react-app']
            },
            browserslist: {
                production: ['>0.2%', 'not dead', 'not op_mini all'],
                development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version']
            }
        };
        zip.file('my-react-app/package.json', JSON.stringify(packageJson, null, 2));

        // Add README
        const readme = `# React App

This project was generated using AI App Generator.

## Setup

1. Extract this ZIP file
2. Navigate to the \`my-react-app\` directory:
   \`\`\`bash
   cd my-react-app
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Generated Files

${Object.keys(code).map(name => `- src/${name}`).join('\n')}

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm test\` - Launches the test runner
`;
        zip.file('my-react-app/README.md', readme);

        // Add .gitignore
        const gitignore = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*`;
        zip.file('my-react-app/.gitignore', gitignore);

        // Generate and download the zip file
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-react-app.zip';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="preview-window-container">
            <div className="preview-header">
                <h2 className="preview-title">🎉 Live React Preview</h2>
                <p className="preview-subtitle">Your generated React application is running!</p>
            </div>

            <div className="preview-controls">
                <button onClick={() => setShowIframe(!showIframe)} className="control-btn">
                    {showIframe ? '📱' : '🖥️'} {showIframe ? 'Hide' : 'Show'} Preview
                </button>
                <button onClick={onOpenChat} className="control-btn primary">
                    💬 Improve App
                </button>
                <button onClick={handleDownload} className="control-btn">
                    📦 Download ZIP
                </button>
                <button onClick={onStartOver} className="control-btn secondary">
                    ✨ Start Over
                </button>
            </div>

            {showIframe && (
                <div className="preview-frame-container">
                    <iframe
                        srcDoc={generateReactPreview()}
                        className="preview-iframe"
                        title="React App Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                </div>
            )}
        </div>
    );
}
