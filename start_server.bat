@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting server...
python -u server.py
pause
