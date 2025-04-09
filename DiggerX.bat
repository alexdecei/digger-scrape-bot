@echo off
setlocal

echo === Demarrage du script Digger ===

REM Chemin du projet
set PROJECT_DIR=%USERPROFILE%\digger-scrape-bot

REM Si le dossier n'existe pas, cloner le repo
if not exist "%PROJECT_DIR%" (
    echo Clonage du depot GitHub...
    git clone https://github.com/alexdecei/digger-scrape-bot.git "%PROJECT_DIR%"
    
)

cd "%PROJECT_DIR%"

REM Sauvegarder le hash actuel
for /f %%i in ('git rev-parse HEAD') do set "OLD_HASH=%%i"

echo Mise a jour du depot...
git pull

REM Recuperer le nouveau hash
for /f %%i in ('git rev-parse HEAD') do set "NEW_HASH=%%i"

REM Verifier si le hash a change
if "%OLD_HASH%"=="%NEW_HASH%" (
    echo Aucun changement dans le code. Lancement direct.
) else (
    echo Changements detectes. Installation et build...

    echo Installation des dependances...
    npm install

    echo Installation de Playwright...
    npx playwright install

)

echo Compilation du projet...
call npm run build || goto build_failed

:build_failed
echo Le build a échoué. Vérifiez les erreurs ci-dessus.
pause
exit /b

echo Lancement de l'application...
echo === Lancement de l'application ===

cmd /k npm start

endlocal
pause