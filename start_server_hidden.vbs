Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
Folder = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = Folder
WshShell.Run "cmd /c """ & Folder & "\start_server_background.bat""", 0, False
