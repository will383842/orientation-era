@echo off
title Orientation ERA - Installation
color 0A

echo.
echo  ========================================
echo    INSTALLATION - ORIENTATION ERA
echo  ========================================
echo.

cd /d "%~dp0"

:: Verifier si Node.js est installe
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERREUR] Node.js n'est pas installe !
    echo.
    echo  1. Va sur https://nodejs.org/
    echo  2. Telecharge la version LTS
    echo  3. Installe-le
    echo  4. Relance ce script
    echo.
    pause
    exit /b 1
)

echo  [OK] Node.js detecte
echo.

:: Installer les dependances
echo  Installation des dependances npm...
echo  (Cela peut prendre quelques minutes)
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo  [ERREUR] L'installation a echoue
    pause
    exit /b 1
)

echo.
echo  ========================================
echo    INSTALLATION TERMINEE !
echo  ========================================
echo.
echo  IMPORTANT : Configure tes cles API
echo.
echo  1. Ouvre le fichier .env avec un editeur
echo  2. Remplace les "xxxxx" par tes vraies cles
echo.
echo  Cles necessaires :
echo  - ANTHROPIC_API_KEY (obligatoire)
echo  - OPENAI_API_KEY (recommande)
echo  - PERPLEXITY_API_KEY (recommande)
echo.
echo  ----------------------------------------
echo  Pour LANCER : double-clique sur LANCER.bat
echo  ----------------------------------------
echo.
pause
