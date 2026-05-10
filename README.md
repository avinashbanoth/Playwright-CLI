# 🛒 Amazon India Playwright Automation

A robust, enterprise-ready automation suite for **Amazon India (amazon.in)** built with Playwright and a modern React AI assistant.

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

> ⚠️ **Note:** The `playwright-profile/` directory is local to your machine and ignored by Git. Run `npm run amazon:auth` first to initialize your session.

---

## 🤖 AI Shopping Assistant (Professional React UI)

The project features a high-end, modern React frontend with glassmorphism and Framer Motion animations. It uses **Llama 3.3 (Groq)** to understand your intent and trigger the **Playwright CLI**.

### 🚀 How to Run

This project uses a **Dual-Server** architecture. You need to keep two terminals open:

1.  **Terminal 1 (Backend Logic):**
    ```bash
    npm run web
    ```
    *Starts the Express server on port 3000 to handle AI and Playwright.*

2.  **Terminal 2 (Frontend UI):**
    ```bash
    npm run dev
    ```
    *Starts the Vite dev server for the React UI.*

3.  **Open your Browser:**
    👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🌟 Key Features

- **High-End UI:** Professional React interface with smooth animations and dark mode aesthetic.
- **Stable Tool Calling:** Uses a custom `SEARCH_TRIGGER` format for 100% reliable search execution.
- **Persistent Authentication:** Saves cookies and session data locally.
- **Manual OTP Handoff:** Intelligently pauses for manual verification when needed.
- **Robust Selectors:** Resilient against Amazon's dynamic UI updates.

---

## 🏗️ Architecture

1.  **Frontend (React + Vite):** Modern UI in `src/`.
2.  **Backend (Express + LangChain):** AI logic in `server.js`.
3.  **Auth Helper (`amazon-auth.js`):** Browser initialization and login detection.
4.  **Session Storage (`playwright-profile/`):** Persistent Chrome data.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
npm install -g playwright-cli
npx playwright install chrome
```

### 2. Configuration (.env)
```env
GMAIL_ID=your-email@example.com
AMAZON_PASSWORD=your-password
GROQ_API_KEY=your_key_here
HEADLESS=false
```

---

## ⌨️ Command Reference

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the React Frontend (http://localhost:5173). |
| `npm run web` | Starts the Backend (Required for Chat). |
| `npm run amazon:auth` | First-time login to save session. |
| `npm run amazon:test` | Run automated search tests. |

---

## ⚖️ License
This project is licensed under the ISC License.
