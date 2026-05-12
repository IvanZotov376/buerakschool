@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [%date% %time%] Запуск школьного сервера > server.log

echo Проверка Python... >> server.log
py -3 --version >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON_CMD=py -3"
) else (
    python --version >nul 2>&1
    if %errorlevel%==0 (
        set "PYTHON_CMD=python"
    ) else (
        echo [%date% %time%] ОШИБКА: Python не найден >> server.log
        exit /b 1
    )
)

start "" "http://127.0.0.1:5000/"
%PYTHON_CMD% server.py >> server.log 2>&1
