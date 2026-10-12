# GISSUF AI Avatar — Beginner-Friendly Windows 10 Setup Guide
**Company:** GISSUF Technology  
**Project:** GISSUF AI Avatar — Version 0.1  
**Character:** Rukky (AI Student)  

Welcome to **GISSUF AI Avatar**! This guide is written especially for beginners to help you set up and run your AI avatar on Windows 10 without needing advanced technical knowledge.

---

## 1. System Requirements & Compatibility

GISSUF AI Avatar Version 0.1 has been specifically engineered to run smoothly on budget and entry-level computers:

* **Operating System:** Windows 10 (or Windows 11)
* **Processor:** Intel Core i5 (e.g., i5-3337U) or AMD equivalent
* **Memory (RAM):** 4 GB RAM or higher
* **Storage:** Less than 50 MB disk space
* **Graphics:** Standard Intel Integrated Graphics (No dedicated GPU required!)
* **Recommended Browser:** Google Chrome or Microsoft Edge (both include built-in Web Speech recognition and high-quality voice synthesis engines)

---

## 2. Quick Start: Launching in 10 Seconds

### Method 1: The One-Click Launcher (Easiest)
1. Open the project folder `gissuf-ai-avatar`.
2. Locate the file named **`run.bat`**.
3. **Double-click `run.bat`**.
4. A black terminal window will open, verify Python, start the server, and automatically open your default browser to:
   ```text
   http://localhost:8000
   ```
5. You will see Rukky appear on your screen, ready to converse!

---

### Method 2: Using PowerShell or Command Prompt
If you prefer running commands manually:
1. Hold the `Shift` key and right-click inside the `gissuf-ai-avatar` folder.
2. Select **"Open PowerShell window here"** (or **"Open in Terminal"**).
3. Type the following command and press `Enter`:
   ```powershell
   python server.py 8000
   ```
4. Open your web browser (Chrome or Edge) and navigate to:
   ```text
   http://localhost:8000
   ```

---

## 3. How to Use the Application

### A. Speaking with Rukky via Microphone
1. In the bottom chat area, click the circular **Microphone button**.
2. **First-time permission:** Your browser will show a prompt in the top-left asking:  
   *"localhost:8000 wants to use your microphone"*. Click **"Allow"**.
3. When the microphone button turns red with a pulsing ring, speak clearly into your headset or microphone.
4. You will see your spoken words transcribed live in the blue transcription bar.
5. When you finish speaking, Rukky will enter **THINKING** mode and formulate an educational response, which she will speak aloud with animated facial movements!

### B. Typing Questions
1. If you are in a quiet room or do not have a microphone plugged in, click into the chat box.
2. Type your question (e.g., *"What is machine learning?"*) and press `Enter` or click the purple **Send button**.

### C. Quick Prompts
Click any of the prompt pills above the chat box to test questions instantly:
* **"Who are you?"** — Introduces Rukky's persona and background.
* **"GISSUF Technology"** — Explains GISSUF Technology's mission.
* **"What is Machine Learning?"** — Explains core machine learning principles.
* **"Neural Networks"** — Details how artificial neurons and deep layers operate.
* **"Zoom Integration"** — Explains how Rukky joins virtual classrooms.
* **"AI Quiz Question"** — Prompts Rukky to test your AI knowledge!

### D. Audio & Voice Settings
Click the **Settings** button in the top-right navigation bar to:
* **Change Voices:** Choose from any installed natural English voice (e.g., Microsoft Zira, Microsoft David, Google US English).
* **Adjust Speech Rate & Pitch:** Fine-tune Rukky's speaking tempo and vocal pitch.
* **Switch Themes:** Toggle between **Electric Cyan**, **Cyber Violet**, and **Emerald Matrix**.

---

## 4. Optional: Connecting a Live AI Model (Gemini / OpenAI / Groq)

By default, Rukky runs in **Curated Demonstration Mode** with an intelligent educational knowledge base. This requires **no API keys, no internet cloud accounts, and zero subscription costs**.

If you wish to connect Rukky to a live external AI model:
1. Locate the file `.env.example` in the project folder.
2. Make a copy of it and rename the copy to **`.env`**.
3. Open `.env` in Notepad and add your free or paid API key:
   ```ini
   # For Google Gemini (Recommended - free tier available):
   GEMINI_API_KEY=your_actual_gemini_key_here

   # Or for OpenAI:
   # OPENAI_API_KEY=sk-your_openai_key_here

   # Or for Groq:
   # GROQ_API_KEY=gsk_your_groq_key_here
   ```
4. Save the file and restart the server (`run.bat`).
5. GISSUF AI Avatar will automatically detect the key, proxy requests through the secure Python backend (keeping your key completely private and invisible to browser inspection), and switch the HUD badge to **"Live AI"**.

---

## 5. Troubleshooting Common Issues

### Issue 1: "Python is not recognized as an internal or external command"
* **Cause:** Python is not added to your Windows system PATH.
* **Fix:** Download Python 3.10+ from [python.org](https://www.python.org/). When the installer opens, **make sure to check the box: "Add Python to PATH"** before clicking Install.

### Issue 2: Microphone button doesn't respond or shows an error
* **Cause:** Microphone access was blocked by the browser.
* **Fix:**
  1. Click the small lock icon (or tune icon) on the left side of the browser URL bar (`http://localhost:8000`).
  2. Ensure **Microphone** is set to **"Allow"**.
  3. Refresh the page (`F5`).

### Issue 3: Voice is not speaking or sounds robotic
* **Cause:** The default browser voice is set to a low-quality legacy synthesizer.
* **Fix:** Open **Settings** in the top-right header, locate **Rukky's Voice**, and choose a higher-quality voice (such as **"Microsoft Zira - English (United States)"** or **"Google US English"**).

### Issue 4: "Port 8000 is already in use"
* **Fix:** The included `server.py` will automatically fall back to port `8080` if 8000 is busy. You can also specify any custom port by running:
  ```powershell
  python server.py 9000
  ```

---

## 6. How to Stop the Application
When you are done:
* Close the browser tab.
* In the black terminal window, press `Ctrl + C` or simply click the **X** button in the window title bar to shut down the server.
