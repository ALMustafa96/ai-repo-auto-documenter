# AI Repo Auto-Documenter

**English:** A CLI tool that analyzes any local code repository and automatically generates a professional, detailed `README.md` file — powered entirely by a local AI model (Ollama), completely free and working offline with no API costs.

**العربية:** أداة سطر أوامر (CLI) تقوم بتحليل أي مستودع كود محلي وتولّد تلقائيًا ملف `README.md` احترافي ومفصّل — تعمل بالكامل عبر نموذج ذكاء اصطناعي محلي (Ollama)، مجانية تمامًا وتعمل بدون إنترنت وبدون أي تكلفة على واجهات برمجية خارجية.

---

## ✨ Features

- 🔍 Scans your repository structure and important source files
- 🧠 Uses a local AI model (via Ollama) to understand and describe your project
- 🚫 Automatically ignores node_modules, .git, build artifacts, and binary files
- 💰 100% free — no API key, no billing, no internet required after setup
- ⚡ Simple CLI usage: one command generates a full README

## 🛠️ Tech Stack

- Node.js (ES Modules)
- Commander.js — CLI argument parsing
- Ollama — local LLM inference
- glob — file scanning

## 📦 Installation

git clone https://github.com/USERNAME/ai-repo-auto-documenter.git
cd ai-repo-auto-documenter
npm install
npm link

### Prerequisites

1. Install Ollama from https://ollama.com/download
2. Pull a local model: ollama pull llama3.2:3b
3. Make sure Ollama is running: brew services start ollama

## 🚀 Usage

ai-doc /path/to/your/project

This generates a README.md file directly inside the target directory.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| -o, --output <filename> | Output filename | README.md |

Example: ai-doc . -o GENERATED_README.md

## 📂 Project Structure

ai-repo-auto-documenter/
├── bin/cli.js           - CLI entry point
├── src/fileScanner.js   - Scans & filters repository files
├── src/promptBuilder.js - Builds the AI prompt
├── src/generator.js     - Calls the local Ollama model
├── package.json
└── README.md

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.