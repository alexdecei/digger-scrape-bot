Al-tefkatre
altefkatre_
Dans un appel

Yoka — 07/04/2025 23:31
je vais pisser
Yoka
 a commencé un appel qui a duré 2 heures. — 09/04/2025 15:21
Yoka — 09/04/2025 15:51
t la
?
Al-tefkatre — 09/04/2025 16:00
okatax
Yoka — 09/04/2025 16:00
300061
300 061
196392
498161
779041
Al-tefkatre — 09/04/2025 16:04
octogone
Yoka — 09/04/2025 16:04
309789
582847
terminé,
Yoka — 09/04/2025 16:28
97232
ca,da,sa,le,k
02 avril 2025
mq, mb
Al-tefkatre — 09/04/2025 16:47
@echo off
setlocal

echo === Demarrage du script Digger ===

REM Chemin du projet
Afficher plus
DiggerX.bat
2 Ko
C:\Users\decei
Yoka — 09/04/2025 16:53
jevide ma corbeille
Al-tefkatre — 09/04/2025 16:58
npx playwright install
Al-tefkatre — 09/04/2025 17:12
@echo off
setlocal

echo === Demarrage du script Digger ===

REM Repertoire du projet
Afficher plus
DiggerX.bat
1 Ko
Yoka — 09/04/2025 17:18
aucun resultats
je dois decoller
Al-tefkatre — 09/04/2025 17:18
ok
Yoka — 09/04/2025 17:18
je ressaye ce soir avec les nouveau ba
bat
Yoka — 22/04/2025 16:20
mon mot de passe a changé !
cest **yy
ala fin au lieu de **y
Tu as manqué un appel de 
Yoka
 qui a duré 3 minutes. — Hier à 21:29
Yoka — Hier à 21:30
tu mentends ?
je ne t'entend pas
Al-tefkatre
 a commencé un appel qui a duré une heure. — Hier à 21:35
Yoka — Hier à 21:37
c
Yoka — Hier à 21:52
97211
%d
mq
26 mars 2025
Al-tefkatre — Hier à 21:56
Image
Yoka — Hier à 21:57
3449012    97211    ROLAND
=== Demarrage du script Digger ===
Mise a jour du depot...
remote: Enumerating objects: 13, done.
remote: Counting objects: 100% (13/13), done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 8 (delta 6), reused 7 (delta 5), pack-reused 0 (from 0)
Afficher plus
message.txt
36 Ko
Al-tefkatre — Hier à 22:08
Yoka — Hier à 22:13
https://www.youtube.com/watch?v=Hpoo6R1JyKQ&ab_channel=Leto
YouTube
Leto
Leto - Macaroni feat. Ninho (Clip officiel)
Image
Al-tefkatre — Hier à 22:16
Yoka — 13:24
JE SUIS LA
Al-tefkatre — 13:25
5min
Yoka — 13:25
je pourrais pas mettre de son liam dort encore
Al-tefkatre
 a commencé un appel. — 13:26
Yoka — 13:26
jtentend pas
jai coupé le son
Al-tefkatre — 13:26
okok
bon je fini 2 3 truc et j'arrive
Yoka — 13:51
oooooog
Al-tefkatre — 14:06
yo
relance le bat pour voir
﻿
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
<<<<<<< HEAD
exit /b
=======
exit /b
>>>>>>> dev
