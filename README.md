# Agentic App Builder

An intelligent platform that converts natural language project descriptions into fully functional, production-ready React applications.

## 🚀 Problem Statement
The goal is to build an **Agentic App Builder** that bridges the gap between a high-level idea (problem statement) and a deployable prototype. This requires complex orchestration logic to manage context across different stages of development, ensuring that the generated code is not only functional but also adaptable through iterative feedback.

## 🏗️ The Orchestration Logic
Our implementation uses a multi-stage agentic workflow to ensure high-quality output and maintain context:

1.  **Context Analysis & Planning**: The system first analyzes the user's problem statement to determine the necessary features, state management, and component architecture. This creates a "Blueprint" before any code is written.
2.  **Pattern Selection**: Based on the plan, the agent selects appropriate React patterns (Functional components, Hooks, Context API) and styling strategies.
3.  **Code Prototyping**: Generating multiple files (JSX, CSS) that work together seamlessly.
4.  **Sandbox Rendering**: A custom-built live preview engine using Babel Standalone that transpiles and executes the generated code in real-time.
5.  **Continuous Improvement Loop**: An integrated chat interface allows users to provide feedback, triggering the "Improvement Agent" to refine the existing codebase while maintaining the original project context.

## 📊 System Architecture

![System Architecture Diagram](/Users/npai/Desktop/ML_PROJECTS/agent-app-builder/docs/assets/architecture_diagram_v3.png)

### Core Components:
- **`App.jsx`**: The central orchestrator (State Machine) managing the workflow stages.
- **`aiService.js`**: Interfaces with GPT-4o, handling prompt engineering and code parsing.
- **`PreviewWindow.jsx`**: A sandboxed environment for live transpilation and previewing.
- **`ChatWindow.jsx`**: The feedback loop enabling iterative changes and constant app improvement.

## 🛠️ Getting Started

### Prerequisites
- Node.js & npm
- OpenAI API Key

### Setup
1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd agent-app-builder
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env` file in the root directory and add your OpenAI API key:
    ```env
    VITE_OPENAI_API_KEY=your_actual_key_here
    ```
4.  **Run the application**:
    ```bash
    npm run dev
    ```

## 🔄 Iterative Improvement & Success
To ensure successful iterations, the agent maintains the **entire project context** (original prompt, current code, and history of changes) in its memory. When a user requests a change via the chat window, the agent analyzes the existing code structure and performs targeted updates rather than starting from scratch, ensuring stability and incremental growth of the application.

## 🏆 MVP Features
- ✅ Natural Language to React generation.
- ✅ Multi-file code generation (App.jsx, Components, CSS).
- ✅ Real-time browser-based preview.
- ✅ Downloadable ZIP for local development.
- ✅ Agentic chat feedback loop for refinements.
