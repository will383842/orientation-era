@echo off
title Orientation ERA - Demarrage
color 0D

echo.
echo  ========================================
echo    ORIENTATION BAC PRO ERA
echo    Metiers d'Avenir
echo  ========================================
echo.
echo  Demarrage de l'application...
echo.

cd /d "%~dp0"

:: Verifier si node_modules existe
if not exist "node_modules" (
    echo  Installation des dependances...
    echo  (Cela peut prendre quelques minutes la premiere fois)
    echo.
    npm install
    echo.
)

:: Lancer le navigateur apres 2 secondes
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Lancer le serveur
echo  Serveur demarre !
echo.
echo  L'application va s'ouvrir dans ton navigateur...
echo  (Si ca ne s'ouvre pas, va sur http://localhost:3000)
echo.
echo  ----------------------------------------
echo  Pour ARRETER : ferme cette fenetre
echo  ----------------------------------------
echo.

npm start
