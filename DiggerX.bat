@echo off
setlocal

echo ## Lancement de DIGGER BOT

:: Déplacement dans le dossier de l'utilisateur
cd /d %USERPROFILE%

:: Vérifie si le dossier existe
if not exist digger-scrape-bot (
    echo ## Clonage du dépôt...
    git clone https://github.com/alexdecei/digger-scrape-bot.git
)

:: Déplacement dans le dossier du projet
cd digger-scrape-bot

echo ## Mise à jour du dépôt...
git pull

echo ## Installation des dépendances...
call npm install

echo ## Installation de Playwright...
call npx playwright install

echo ## Compilation du projet pour la prod...
call npm run build

echo ## Lancement du serveur en mode production...
call npm start

pause
