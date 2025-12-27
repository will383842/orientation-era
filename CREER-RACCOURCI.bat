@echo off
title Creation du raccourci
color 0B

echo.
echo  Creation d'un raccourci sur le Bureau...
echo.

:: Creer le raccourci via PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Orientation ERA.lnk'); $Shortcut.TargetPath = '%~dp0LANCER.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.IconLocation = 'shell32.dll,144'; $Shortcut.Description = 'Lancer Orientation ERA'; $Shortcut.Save()"

if %errorlevel% equ 0 (
    echo  [OK] Raccourci cree sur le Bureau !
    echo.
    echo  Tu peux maintenant lancer l'application
    echo  en double-cliquant sur "Orientation ERA"
) else (
    echo  [ERREUR] Impossible de creer le raccourci
)

echo.
pause
