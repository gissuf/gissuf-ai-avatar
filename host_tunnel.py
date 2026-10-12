"""
GISSUF AI Avatar — Instant Public HTTPS Host
Launches server.py and creates a secure public HTTPS Cloudflare Tunnel.
Anyone on any smartphone, tablet, or PC can access Rukky via this public link.
"""

import subprocess
import threading
import socketserver
import time
import os
import re
from server import GissufHTTPRequestHandler

def start_http_server(port=8000):
    server_address = ("", port)
    httpd = socketserver.TCPServer(server_address, GissufHTTPRequestHandler)
    print(f"[GISSUF] Local server bound to port {port}")
    httpd.serve_forever()

def main():
    port = 8000
    # 1. Start local server in background thread
    server_thread = threading.Thread(target=start_http_server, args=(port,), daemon=True)
    server_thread.start()
    time.sleep(1)

    # 2. Run cloudflared tunnel
    cloudflared_path = r"C:\Users\Gtech\.gemini\antigravity\scratch\cloudflared.exe"
    if not os.path.exists(cloudflared_path):
        print(f"[ERROR] cloudflared.exe not found at {cloudflared_path}")
        return

    cmd = [cloudflared_path, "tunnel", "--url", f"http://localhost:{port}"]
    print("[GISSUF] Connecting to Cloudflare global network...")
    
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    public_url = None
    url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

    # Read output to extract public URL
    for line in process.stderr:
        match = url_pattern.search(line)
        if match:
            public_url = match.group(0)
            print("=" * 70)
            print("[GISSUF] GISSUF AI AVATAR IS NOW LIVE ON THE INTERNET!")
            print(f"PUBLIC HTTPS URL: {public_url}")
            print("Share this link with ANYONE. It works on phones, tablets, and PCs!")
            print("Microphone and speech recognition are fully enabled via HTTPS.")
            print("=" * 70)
            with open("public_url.txt", "w", encoding="utf-8") as f:
                f.write(public_url)
            break

    # Keep alive
    try:
        process.wait()
    except KeyboardInterrupt:
        process.terminate()

if __name__ == "__main__":
    main()
