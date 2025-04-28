@echo off
setlocal

echo === Demarrage du script Digger ===

REM Repertoire du projet
set "PROJECT_DIR=%USERPROFILE%\digger-scrape-bot"

REM Clonage si le dossier n'existe pas
if not exist "%PROJECT_DIR%" (
    echo Clonage du depot GitHub...
    git clone https://github.com/alexdecei/digger-scrape-bot.git "%PROJECT_DIR%"
    cd "%PROJECT_DIR%"

    echo Premiere installation...
    call npm install
    call npx playwright install

    goto start_app
)

cd "%PROJECT_DIR%"

REM Sauvegarde du hash
for /f %%i in ('git rev-parse HEAD') do set "OLD_HASH=%%i"

echo Mise a jour du depot...
git pull

REM Nouveau hash
for /f %%i in ('git rev-parse HEAD') do set "NEW_HASH=%%i"

REM Si changement, alors re-install + rebuild
if not "%OLD_HASH%"=="%NEW_HASH%" (
    echo Changements detectes. Installation des dependances...
    call npm install

)

:start_app
echo === Lancement de l'application ===
call npm run dev

endlocal
exit /b