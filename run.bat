@echo off
title GISSUF AI Avatar - Version 0.1
color 0B

echo ======================================================================
echo                     GISSUF AI AVATAR - VERSION 0.1
echo                         GISSUF TECHNOLOGY
echo                       Character: Rukky (AI Student)
echo ======================================================================
echo.
echo Checking environment...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found on your system!
    echo Please install Python 3.9+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo [OK] Python detected.
echo Starting GISSUF AI Avatar local server...
echo.
echo Opening application in your default web browser...
start http://localhost:8000

echo.
echo ======================================================================
echo Server is running at: http://localhost:8000
echo Optimized for: Windows 10 (4GB RAM, Intel Core i5)
echo To stop the application, close this window or press Ctrl+C.
echo ======================================================================
echo.

python server.py 8000

pause
