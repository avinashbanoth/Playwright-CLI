# 🛒 Amazon India Playwright Automation

A robust, enterprise-ready automation suite for **Amazon India (amazon.in)** built with Playwright. This project was developed and optimized using the **Playwright CLI**, focusing on **persistent session management** to bypass repetitive login flows.

---

## 🛠️ Playwright CLI Integration

This project is fully compatible with the `playwright-cli`, allowing for live browser exploration and session debugging.

### Running with CLI
To open a live, headed browser window using the dedicated CLI profile:

**On Windows (PowerShell/CMD):**
```bash
npx playwright-cli -s=amazonlive open https://www.amazon.in --browser=chrome --headed --persistent --profile=.\playwright-profile\amazon-cli-visible
```

**On macOS/Linux:**
```bash
npx playwright-cli -s=amazonlive open https://www.amazon.in --browser=chrome --headed --persistent --profile=./playwright-profile/amazon-cli-visible
```

> ⚠️ **Important Note for New Users:** The `playwright-profile/` directory is **ignored by Git** for security. When you first clone the project, this folder will not exist. It will be created automatically the first time you run the command. If you want to see your logged-in session, you must first run `npm run amazon:auth`.

---

## 🤖 AI Shopping Assistant (Stable Mode)

You can now chat with an AI assistant that understands your grocery needs and can automatically trigger Amazon searches using **Llama 3.3 (Groq)** and **Playwright CLI**.

### Setup
1. Add your Groq API key to the `.env` file:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
2. Run the Web UI:
   ```bash
   npm run web
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### How it works (The Workflow)
- **Stable Tool Calling:** The assistant uses a custom `SEARCH_TRIGGER` JSON format to communicate with the backend. This bypasses common API issues and ensures 100% reliable search execution.
- **Dynamic Search:** When you mention a product, the Llama 3.3 model extracts the product name.
- **CLI Execution:** The Node.js server dynamically builds and executes a `playwright-cli` command to open a browser window directly at the Amazon search results for that product.
- **Persistent State:** The CLI uses the `amazon-cli-visible` profile, meaning it remembers your login and shopping cart across sessions.

---

## 🌟 Key Features

- **Persistent Authentication:** Uses `launchPersistentContext` to save cookies and session data, minimizing the need for frequent logins.
- **Manual OTP Handoff:** Intelligently detects Amazon's verification screens (OTP/CAPTCHA) and pauses to allow manual user intervention before continuing.
- **Robust Selector Strategy:** Implements a multi-layered selector approach (`[data-asin]`, `.s-result-item`, etc.) to stay resilient against Amazon's dynamic UI updates.
- **Optimized for India:** Pre-configured for `amazon.in` with specific handling for local sign-in flows and search result pages.
- **Developer Friendly:** Fully commented code, TypeScript support, and optimized Playwright configurations.

---

## 🏗️ Architecture & Workflow

The project follows a "Persistent Profile" architecture:

1.  **Backend Server (`server.js`):** An Express.js server that integrates LangChain and Groq. It parses AI responses and triggers local shell commands (Playwright CLI).
2.  **Auth Helper (`amazon-auth.js`):** Centralizes logic for browser initialization, login detection, and automated testing flows.
3.  **Session Storage (`playwright-profile/`):** 
    - `amazon/`: Dedicated profile for automated test runs.
    - `amazon-cli-visible/`: Separate profile for manual debugging and AI-triggered CLI runs.
4.  **Test Suite (`tests/`):** Functional specs that reuse the persistent session for verification.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v18 or higher recommended.
- **Chrome:** The project is configured to use the official Google Chrome channel.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
npx playwright install chrome
```

### 3. Configuration
Create a `.env` file in the root directory:
```env
# Amazon Credentials
GMAIL_ID=your-email@example.com
AMAZON_PASSWORD=your-password

# AI Credentials
GROQ_API_KEY=your_api_key_here

# Automation Settings
HEADLESS=false # Set to true for background runs once authenticated
```

---

## ⌨️ Command Reference

| Command | Usage Scenario | Purpose |
| :--- | :--- | :--- |
| `npm run web` | **Everyday Use** | Launches the AI Chatbot Web UI at http://localhost:3000. |
| `npm run amazon:auth` | **Setup Phase** | Initializes the persistent session. Run this first to log in and handle any OTPs. |
| `npm run amazon:test` | **Testing** | Executes the iPhone 16 search test using the saved session. |
| `npm run chatbot` | **CLI Chat** | Runs the AI assistant directly in your terminal. |

---

## 🛠️ Troubleshooting

### 🛑 "Lock File" or "ProcessSingleton" Error
**Issue:** Playwright cannot open the profile because another browser instance (or a crashed process) is using it.
**Solution:** Close all Chrome windows and kill any lingering Node/Chrome processes:
```powershell
# Windows PowerShell
Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 🔑 Handling OTP/Verification
When you run `npm run amazon:auth`, if Amazon asks for an OTP or 2FA:
1. The browser will stay open.
2. Enter the code manually in the browser window.
3. The script will detect the successful navigation and save your session automatically.

---

## 📁 Project Structure

```text
├── playwright-profile/    # Local storage for browser sessions (Git ignored)
├── tests/                 # Playwright test specifications
├── public/                # Web UI frontend assets
├── server.js              # AI Assistant Backend (Web)
├── chatbot.js             # AI Assistant CLI version
├── amazon-auth.js         # Core authentication and search logic
├── playwright.config.js   # Global Playwright configuration
└── README.md              # You are here!
```

---

## ⚖️ License
This project is licensed under the ISC License.
