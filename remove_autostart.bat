@echo off
chcp 65001 >nul
set "LINK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\SchoolServer.lnk"
if exist "%LINK%" del "%LINK%"
echo Автозапуск удалён.
pause
