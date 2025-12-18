import OpenAI from 'openai';

class AIService {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            throw new Error('Please configure your OpenAI API key in src/config/apiKey.js');
        }

        this.client = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
        this.initialized = true;
    }

    async generateImplementationPlan(userPrompt) {
        this.initialize();

        const prompt = `You are an expert React developer. A user wants to create the following application:

"${userPrompt}"

Please create a detailed implementation plan for this React application. The plan should include:

1. **Overview**: Brief description of what the app does
2. **Features**: List of key features to implement
3. **Technology Stack**: React with functional components and hooks
4. **Component Structure**: What React components will be created
5. **State Management**: What state the app needs and where it lives
6. **Implementation Steps**: High-level steps to build this React app

Format your response in markdown with clear headings and bullet points. Be specific but concise.`;

        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert React developer who creates detailed implementation plans for React applications.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating implementation plan:', error);
            throw new Error(`Failed to generate plan: ${error.message}`);
        }
    }

    async generateCode(userPrompt, implementationPlan) {
        this.initialize();

        const prompt = `You are an expert React developer. Based on the following user request and implementation plan, generate complete, production-ready React code.

**User Request:**
"${userPrompt}"

**Implementation Plan:**
${implementationPlan}

Please generate a complete React application. Your response MUST follow this exact format with multiple React components:

\`\`\`jsx:App.jsx
[Complete App.jsx component - main app component with state and logic]
\`\`\`

\`\`\`css:App.css
[Complete CSS for the app - modern, beautiful styling with animations and responsive design]
\`\`\`

\`\`\`jsx:Component1.jsx
[First React component if needed - functional component with props]
\`\`\`

\`\`\`css:Component1.css
[CSS for first component if needed]
\`\`\`

CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY:
1. DO NOT include ANY import statements - React and all hooks are already available globally
2. DO NOT write: import React from 'react'
3. DO NOT write: import { useState } from 'react'  
4. DO NOT write: const { useState } = React
5. Just use useState, useEffect, etc. directly - they are already available
6. App.jsx MUST be defined as: function App() { ... } then export default App;
7. All other components MUST be: function ComponentName() { ... } then export default ComponentName;
8. ALL event handlers MUST update state - examples:
   - onClick={() => setCount(count + 1)} for increment
   - onClick={() => setCount(count - 1)} for decrement  
   - onClick={() => setItems([...items, newItem])} for adding to arrays
9. CSS should be modern with colors, animations, proper spacing
10. Make it visually stunning and fully functional

CORRECT EXAMPLE - Counter App:
\`\`\`jsx:App.jsx
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}

export default App;
\`\`\`

\`\`\`css:App.css
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 { font-size: 3rem; color: white; margin-bottom: 2rem; }

button {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  margin: 0.5rem;
  border: none;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover { transform: scale(1.1); }
\`\`\`

REMEMBER: NO IMPORTS! useState, useEffect, etc. are already in global scope.
Generate ONLY code blocks in format \`\`\`jsx:Filename.jsx or \`\`\`css:Filename.css`;

        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert React developer who creates beautiful, functional React applications using modern best practices.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            });

            const text = completion.choices[0].message.content;

            // Parse the code blocks
            return this.parseReactCodeBlocks(text);
        } catch (error) {
            console.error('Error generating code:', error);
            throw new Error(`Failed to generate code: ${error.message}`);
        }
    }

    parseReactCodeBlocks(text) {
        // Match code blocks with filenames like ```jsx:App.jsx or ```css:App.css
        const codeBlockRegex = /```(?:jsx|css|javascript):([^\n]+)\n([\s\S]*?)```/g;
        const files = {};

        let match;
        while ((match = codeBlockRegex.exec(text)) !== null) {
            const filename = match[1].trim();
            const content = match[2].trim();
            files[filename] = content;
        }

        // If no files found with the new format, try old format
        if (Object.keys(files).length === 0) {
            const htmlMatch = text.match(/```html\n([\s\S]*?)```/);
            const cssMatch = text.match(/```css\n([\s\S]*?)```/);
            const jsMatch = text.match(/```(?:javascript|jsx)\n([\s\S]*?)```/);

            if (htmlMatch || cssMatch || jsMatch) {
                return {
                    'App.jsx': jsMatch ? jsMatch[1].trim() : '',
                    'App.css': cssMatch ? cssMatch[1].trim() : '',
                };
            }
        }

        return files;
    }

    async improveCode(originalPrompt, currentCode, improvementRequest) {
        this.initialize();

        const filesList = Object.keys(currentCode).map(name => `- ${name}`).join('\n');

        const prompt = `You are improving an existing React application. Here's the context:

**Original Request:** "${originalPrompt}"

**Current Files:**
${filesList}

**Current Code:**
${Object.entries(currentCode).map(([name, content]) => `\n// ${name}\n${content}`).join('\n\n')}

**Improvement Request:** "${improvementRequest}"

Please generate the UPDATED code incorporating the requested changes. Follow the same format as before with proper filenames.

CRITICAL: NO IMPORTS! useState, useEffect etc. are already available globally.
Generate code blocks in format \`\`\`jsx:Filename.jsx or \`\`\`css:Filename.css`;

        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert React developer who improves existing applications based on user feedback.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            });

            const text = completion.choices[0].message.content;
            return this.parseReactCodeBlocks(text);
        } catch (error) {
            console.error('Error improving code:', error);
            throw new Error(`Failed to improve code: ${error.message}`);
        }
    }
}

export default new AIService();
