# Documentation Technique de l'application de recherche CGAWEB

## ✨ Objectif Fonctionnel
Automatiser la recherche d'abonnés sur l'extranet CGAWEB-DROM de Canal+ en simulant la navigation humaine via Playwright :
- Connexion via un code OKTA
- Remplissage de formulaires de recherche
- Extraction conditionnelle des données
- Visualisation des résultats en frontend React

---

## 🧲 Stack Technique
- **Frontend** : React + Tailwind CSS (UI) + Zustand-like custom hooks
- **Backend** : Next.js API Routes (Node.js runtime)
- **Automatisation** : Playwright (navigateur Chromium headful)
- **Com** : API REST via `fetch`, et polling léger (1s/15s)

---

## ⚖️ Architecture Technique & Logique

### 1. 🔓 Connexion du Bot

#### FRONTEND
- `ClientApp.tsx` affiche `BotConfigPanel`
- `BotConfigPanel.tsx` gère les boutons déclencheurs
- `useBotState.tsx` expose `connectBot()` qui :
  - Appelle `apiService.setBotState(true, oktaCode)`
- `apiService.ts` exécute un `fetch` POST sur `/api/botState` avec l'action `start`

#### BACKEND
- `api/botState/route.ts` POST :
  - Appelle `startBot(oktaCode)`
- `playwright.ts` > `startBot()` :
  - Lance `chromium`
  - Crée la `mainPage` + login OKTA + accès menu principal
  - Ouvre la `searchPage` en popup (tableau)


---

### 2. ⚖️ Gestion de l'état

#### FRONTEND
- `BotConfigPanel.tsx` utilise `botState.isConnected` pour afficher/désactiver les boutons
- `useBotState.tsx` :
  - Un `useEffect()` effectue un `getBotState()` toutes les secondes (polling)
- `apiService.ts` :
  - `getBotState()` fait un GET `/api/botState`

#### BACKEND
- `api/botState/route.ts` GET :
  - Renvoie `getRealBotStatus()`
- `playwright.ts` > `getRealBotStatus()` renvoie `isConnected`, `isSearching`
- `playwright.ts` > `attachLifecycleHooks()` :
  - Déclenche `cleanBotState()` si le browser/context/page se ferme

---

### 3. 🔍 Recherche

#### FRONTEND
- `BotConfigPanel.tsx` : bouton "Lancer la recherche" > `startSearch()`
- `useSearch.tsx` > `startSearch()` :
  - Appelle `apiService.search()` avec les paramètres utilisateurs
- `apiService.ts` > `search()` :
  - POST `/api/search` avec `mode, postalCodes, names, codes, date`

#### BACKEND
- `api/search/route.ts` : POST
  - Appelle `performSearch()`
- `playwright.ts` > `performSearch()` :
  - Boucle sur chaque `prenom` × `codePostal`
  - Appelle `runSingleSearch()` > `scanResultTable()` > `checkDetails()`
  - Si `checkDetails()` retourne `true`, l'abonné est ajouté à `resultCache`

---

### 4. 📉 Résultats

#### FRONTEND
- `ClientApp.tsx` : `ResultPanel` affichant la liste des résultats
- `useResult.tsx` > `useEffect()` : polling toutes les 15s
- `apiService.ts` > `getResults()` : GET `/api/results`

#### BACKEND
- `api/results/route.ts` : GET (ou `/botState` si fusion)
  - Renvoie `resultCache`

---

## ⚖️ Notes Techniques

- Le `searchPage` est une popup créée dynamiquement
- `mainPage` permet les actions de login et l'ouverture du menu
- La vérification des codes se fait dans `scanResultTable` sur une colonne spécifique
- La logique est à état unique (mono-user, mono-bot, mono-page)
- En cas de fermeture ou crash du navigateur, `cleanBotState()` est déclenché

---

## 🚀 Améliorations futures possibles
- Passage à des WebSocket (remplacement du polling)
- Stockage persisté des résultats (SQLite ?)
- Extraction plus robuste en cas d'anomalies HTML (via XPath ?)
- Gestion des logs Playwright + erreur dans un fichier
- Détection proactive des crashs (avec retries / watchdog)

---

## ✅ Conclusion
Cette application propose une chaîne de contrôle front-back bien cloisonnée, pilotant un bot Playwright de manière fiable dans un environnement strictement local. Elle repose sur une boucle de polling pour assurer la synchronisation d'état et un système de routes Next.js très simple à maintenir.



---

PROMPT

---

App locale React/Next.js pour automatiser la recherche d’abonnés sur un site via Playwright. Connexion, remplissage de formulaires, navigation simulée, extraction de résultats. Stack : React + Tailwind (frontend), Next.js API (backend), Playwright.

CONNEXION
FRONT
ClientApp.tsx : botConfigPannel
botConfigPannel.tsx: bouton start bot > connectBot()
useBotState.tsx: connectBot() > setBotState(true,oktacode)
apiService.ts:setBotState() > fetch(`${BASE_URL}/botState [POST]

BACK
botState/route.ts : POST > startBot(oktaCode)
playwright.ts : startBot() > loginWithOkta()
>> créé la mainPage (connexion, page détail)
>> puis créé la searchPage (pour parcourir le tableau)



GESTION DE L'ETAT
FRONT
botConfigPannel.tsx : si connected = true : le bouton start devient stop et le bouton rechercher devient visible
useBotState.tsx: useEffect()>getBotState() [polling toutes les secondes pour connaitre l'état]
apiService.ts : getBotState() > fetch(`${BASE_URL}/botState [GET]

BACK
botState/route.ts : GET > getRealBotStatus()
playwright.ts : getRealBotStatus()
>> renvoie isConnected et isSearching vers le front
playwright.ts : attachLifecycleHooks() -> cleanBotState()
>> ecoute l'état du browser/contexte/pages et update leur état logique avec un cleanse


RECHERCHE
FRONT
ClientApp.tsx : botConfigPannel
botConfigPannel.tsx: bouton lancer la recherche > startSearch()
useSearch.tsx: startSearch() > search(mode,postalCodes,names,codes date)
apiService.ts:search() > fetch(`${BASE_URL}/search` [POST]

BACK
search/route.ts : POST > startBot(oktaCode)
playwright.ts : 
> performSearch() lance les boucles de recherche (sur chaque nom, sur chaque code postal)
> runSingleSearch() lance une itération de recherche sur un nom et un code postal en tapant les critères de recherche
> scanResultTable() parcours la table des résultat, si checkDetails=true, ajoute l'élément dans la liste des resultats
> checkDetails() si un resultat a du potentiel, entre dedans pour confirmer son interet, renvoie true si c'est bon



RESULTATS
FRONT
ClientApp.tsx : resultPanel
resultPanel.tsx: panneau des resultats
useResult.tsx: useEffect() > getResults() [polling toutes les 15secondes pour récupérer les résultats]
apiService.ts: getResults() > fetch(`${BASE_URL}/results`);

BACK
botState/route.ts : GET > getResults()
playwright.ts : getResults()
>> renvoie simplement le tableau des résultats mis à jour pendant le cycle du bot



