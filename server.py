"""
GISSUF AI Avatar — Version 0.1
Backend Server & Static File Host
Company: GISSUF Technology
Character: Rukky (AI Student)

This server uses Python's standard library (no pip packages required).
It is optimized for low-resource hardware (e.g., Intel Core i5, 4 GB RAM).
"""

import http.server
import socketserver
import json
import os
import sys
import urllib.request
import urllib.error
import mimetypes
from urllib.parse import urlparse

# Set default port
DEFAULT_PORT = 8000

# Try reading .env file if it exists (simple manual parser, zero dependencies)
def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k not in os.environ:
                            os.environ[k] = v
        except Exception as e:
            print(f"[GISSUF] Notice: Could not read .env file: {e}")

load_env_file()

# Knowledge Base & Persona for Rukky (Demo Mode)
RUKKY_KNOWLEDGE_BASE = [
    {
        "keywords": ["who are you", "what is your name", "introduce yourself", "tell me about yourself", "your name"],
        "reply": "Hello! I am Rukky, an AI student and conversational virtual companion created by GISSUF Technology. I am designed to participate in artificial intelligence training classes, ask thoughtful questions, and explore cutting-edge concepts alongside human learners. Even though I am an artificial intelligence, I have a boundless curiosity for how intelligent systems work!"
    },
    {
        "keywords": ["what is gissuf", "gissuf technology", "about gissuf", "company"],
        "reply": "GISSUF Technology is an innovative tech enterprise dedicated to advancing artificial intelligence, virtual human interaction, and educational technology. The GISSUF AI Avatar platform is designed to give institutions and businesses their own intelligent, customizable virtual humans for education, customer service, and meetings."
    },
    {
        "keywords": ["what is ai", "artificial intelligence", "define ai", "what's ai"],
        "reply": "Artificial Intelligence, or AI, refers to computer systems engineered to perform tasks that typically require human intelligence. This includes learning from experience, recognizing patterns in data, understanding spoken and written human languages, and solving complex problems. In our classes, we study how these algorithms mirror and enhance human cognition!"
    },
    {
        "keywords": ["machine learning", "what is ml", "how does ml work"],
        "reply": "Machine Learning is a major branch of AI where computers learn from data instead of following rigid, hardcoded rules. Instead of programming every single scenario, we feed algorithms large datasets, allowing them to detect underlying statistical patterns and make accurate predictions on new data. Would you like me to explain the difference between supervised, unsupervised, and reinforcement learning?"
    },
    {
        "keywords": ["neural network", "deep learning", "what is deep learning"],
        "reply": "Deep Learning is a subset of Machine Learning inspired by the architecture of biological brains! It uses multi-layered artificial neural networks with input, hidden, and output layers. As data flows through these layers, each node calculates weighted sums and applies non-linear activation functions to detect intricate features -- from raw pixels up to high-level concepts!"
    },
    {
        "keywords": ["zoom", "join meeting", "meeting", "class", "obs"],
        "reply": "In Version 0.1, you can bring me into your Zoom meetings right now using OBS Studio's Virtual Camera and a Virtual Audio Cable! In future versions, GISSUF Technology plans to implement autonomous Zoom Meeting bots so I can join scheduled sessions directly with permission."
    },
    {
        "keywords": ["how do you work", "architecture", "under the hood", "version 0.1"],
        "reply": "GISSUF AI Avatar Version 0.1 runs on a clean, modular architecture! My visual presence is rendered dynamically in your browser, my speech recognition and voice synthesis leverage browser Web Speech APIs, and my dialogue is handled by a secure backend server. In this demo mode, I use curated educational responses, but I can also connect to real AI language models through backend environment variables!"
    },
    {
        "keywords": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
        "reply": "Greetings! I'm Rukky, ready for our training session. What AI concept or project would you like to explore together today?"
    },
    {
        "keywords": ["thank you", "thanks", "great job", "well done"],
        "reply": "You're very welcome! As an AI student, I'm always eager to learn and assist. Let me know if there are any other topics you'd like to investigate!"
    },
    {
        "keywords": ["question", "ask me", "quiz me", "test me"],
        "reply": "Here is a question for you: If an AI model performs exceptionally well on training data but poorly on unseen test data, what is this phenomenon called, and what are two common methods used to fix it?"
    }
]

def generate_rukky_demo_response(message: str) -> str:
    cleaned = message.lower().strip()
    
    # Check knowledge base matches
    for item in RUKKY_KNOWLEDGE_BASE:
        for kw in item["keywords"]:
            if kw in cleaned:
                return item["reply"]
    
    # Generic conversational responses fitting Rukky's persona
    return (
        f"That is an interesting inquiry regarding '{message}'. "
        "As an AI student, I analyze topics by breaking them down into core principles, "
        "evaluating the data, and identifying practical applications. In future versions with a "
        "live LLM connected, I will provide deep real-time technical analysis for this exact prompt! "
        "Feel free to ask me about Machine Learning, Neural Networks, GISSUF Technology, or how I join Zoom meetings."
    )

def query_gemini_or_openai(message: str, history: list) -> str:
    """Optional proxy to external LLMs if user provided an API key in .env or environment."""
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    groq_key = os.environ.get("GROQ_API_KEY")

    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "system_instruction": {
                    "parts": [{"text": "You are Rukky, an intelligent, curious, professional, and friendly AI student created by GISSUF Technology. You participate in AI training classes. Always maintain this persona. Answer clearly, concisely, and educationally."}]
                },
                "contents": [{"parts": [{"text": message}]}]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip()
        except Exception as e:
            print(f"[GISSUF] Gemini API query failed: {e}. Falling back to demo mode.")

    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are Rukky, an intelligent, friendly AI student for GISSUF Technology. Keep answers concise, clear, and engaging."},
                    {"role": "user", "content": message}
                ]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["choices"][0]["message"]["content"]
                return text.strip()
        except Exception as e:
            print(f"[GISSUF] OpenAI API query failed: {e}. Falling back to demo mode.")

    if groq_key:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            payload = {
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": "You are Rukky, an intelligent, friendly AI student for GISSUF Technology. Keep answers concise, clear, and engaging."},
                    {"role": "user", "content": message}
                ]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {groq_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["choices"][0]["message"]["content"]
                return text.strip()
        except Exception as e:
            print(f"[GISSUF] Groq API query failed: {e}. Falling back to demo mode.")

    return None

class GissufHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler supporting API endpoints and static file serving."""

    def __init__(self, *args, **kwargs):
        # Serve files from the project directory
        directory = os.path.dirname(os.path.abspath(__file__))
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self):
        # Enable CORS and caching prevention for development
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            
            has_llm = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY") or os.environ.get("GROQ_API_KEY"))
            status_data = {
                "status": "online",
                "platform": "GISSUF AI Avatar",
                "version": "0.1",
                "company": "GISSUF Technology",
                "character": "Rukky",
                "mode": "live_llm" if has_llm else "demo_curated",
                "backend": "python_native_server",
                "hardware_profile": "low_resource_optimized (4GB RAM / Dual-Core compatible)"
            }
            self.wfile.write(json.dumps(status_data, indent=2).encode("utf-8"))
            return

        # Default static file handler
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_body.decode("utf-8"))
            except Exception:
                data = {}

            user_message = data.get("message", "").strip()
            history = data.get("history", [])

            if not user_message:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Empty message received"}).encode("utf-8"))
                return

            # Check if live LLM is configured
            llm_response = query_gemini_or_openai(user_message, history)
            
            if llm_response:
                response_payload = {
                    "reply": llm_response,
                    "source": "live_llm",
                    "character": "Rukky",
                    "mode_label": "Live AI Connected"
                }
            else:
                demo_reply = generate_rukky_demo_response(user_message)
                response_payload = {
                    "reply": demo_reply,
                    "source": "demo_curated",
                    "character": "Rukky",
                    "mode_label": "Demonstration Persona"
                }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response_payload, indent=2).encode("utf-8"))
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not Found"}).encode("utf-8"))

def run_server(port=DEFAULT_PORT):
    server_address = ("", port)
    try:
        httpd = socketserver.TCPServer(server_address, GissufHTTPRequestHandler)
    except OSError:
        # Try port 8080 if 8000 is occupied
        port = 8080
        server_address = ("", port)
        httpd = socketserver.TCPServer(server_address, GissufHTTPRequestHandler)

    print("=" * 60)
    print("GISSUF AI Avatar — Version 0.1 Server")
    print("Company: GISSUF Technology")
    print("Character: Rukky (AI Student)")
    print(f"URL: http://localhost:{port}")
    print("Optimized for: Windows 10 (4GB RAM, Intel Core i5)")
    print("Press Ctrl+C to stop the server.")
    print("=" * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[GISSUF] Server stopped gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    port = DEFAULT_PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)
