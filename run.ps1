# GISSUF AI Avatar — Version 0.1
# PowerShell Launcher Script
# Company: GISSUF Technology

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                    GISSUF AI AVATAR - VERSION 0.1" -ForegroundColor Cyan
Write-Host "                        GISSUF TECHNOLOGY" -ForegroundColor Cyan
Write-Host "                      Character: Rukky (AI Student)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python was not found in your PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.9+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting GISSUF AI Avatar local server at http://localhost:8000..." -ForegroundColor Cyan
Start-Process "http://localhost:8000"

Write-Host ""
Write-Host "Server running. Press Ctrl+C in this terminal to stop." -ForegroundColor Gray
python server.py 8000
