@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Установка автозапуска школьного сервера...
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SCRIPT=%~dp0start_server_hidden.vbs"
set "LINK=%STARTUP%\SchoolServer.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%LINK%'); $Shortcut.TargetPath = '%SCRIPT%'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Save()"

echo.
echo Готово. Теперь сервер будет запускаться сам при входе в Windows.
echo Для проверки можно перезагрузить компьютер или запустить start_server_hidden.vbs.
echo.
pause
