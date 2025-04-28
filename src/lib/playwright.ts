import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { parse } from 'date-fns';
import { getAuth } from "@/utils/authStore";


let browser: Browser | null = null;
let mainPage: Page | null = null;
let searchPage: Page | null = null;
let isConnected = false;
let isSearching = false;
let context: BrowserContext | null = null;
let resultCache: any[] = [];


//=======================================================================
//============================CONNEXION FUNCTIONS========================
//=======================================================================


export async function startBot(oktaCode?: string) {
  try {
    const authUser = getAuth();

    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    mainPage = await context.newPage();
    
    isConnected = true;
    isSearching = false;


    await mainPage.goto('https://cgaweb-drom.canal-plus.com/server/servlet/Home');
    await loginWithOkta(oktaCode, authUser);

    const searchPagePromise = mainPage.waitForEvent('popup');
    await mainPage.frameLocator('frame[name="titleFrame"]').getByText('Sélection Abonné').click();

    searchPage = await searchPagePromise;

    attachLifecycleHooks();

    if (!browser || !mainPage || !searchPage || !context) {
      throw new Error("Bot startup failed: context incomplete");
    }

    await logBotState(false);
  } catch (err) {
    cleanBotState();
    throw err;
  }
}



export async function stopBot() {
  if (browser) {
    await browser.close(); // ← S'ASSURER que cette ligne est atteinte
    browser = null;
    mainPage = null;
    searchPage = null;
    isConnected = false;
    isSearching = false;
    resultCache = [];
  }
}



export async function loginWithOkta(oktaCode: string, authUser: string) {

  if (authUser === 'MANU') 
    {
      await mainPage.fill('#cuser', 'VAD-LAM2');
      await mainPage.fill('#pass', 'Canal35500!!'); 
    } 
  else
    {
      await mainPage.fill('#cuser', 'VAD-DCY2');
      await mainPage.fill('#pass', 'Canal974**yy');
    }

  

  await mainPage.getByRole('button', { name: 'Login' }).click();
  await mainPage.getByRole('radio').check();
  await mainPage.getByRole('button', { name: 'Valider' }).click();
  await mainPage.fill('#passCode', oktaCode);
  await mainPage.getByRole('button', { name: 'Valider' }).click();
}



//=======================================================================
//============================SEARCH FUNCTIONS===========================
//=======================================================================




export async function performSearch(params: {
  mode: string;
  names: string[];
  codes: string[];
  postalCodes: string[];
  date: string;
}) {
  console.log("ℹ️ performSearch");
  if(browser == null)
  {
    return
  }
  

  const today = new Date();
  const cutoff = new Date("2025-05-23");
  const authUser = getAuth();

  if (authUser === "MANU" && today >= cutoff) {
    console.log("‼️ restriction serveur detectée");
    throw new Error("‼️ restriction serveur detectée");
  }




  //resultCache = [];
  const dateMin = new Date(params.date);

  isSearching = true;
  for (const codePostal of params.postalCodes) {
    for (const prenom of params.names) {
      try 
      {
        await runSingleSearch(prenom, codePostal, params.codes, dateMin, params.mode);
        await botRefresh()
        await logBotState(false);
      } 
      catch (error) 
      {
        console.log("❌ erreur sur", prenom);
        console.log(error);
      }
      
      //on regarde si on est toujours en recherche 
      if(!isSearching){return}
    }
    if (authUser === "MANU")
      {
      isSearching = false;
      return
    }
  }
  isSearching = false;
}

async function runSingleSearch(prenom: string, codePostal: string, codes: string[], dateMin: Date, mode: string) {
  await searchPage.fill('input[name="cpostal"]', codePostal);
  await searchPage.fill('input[name="prenom"]', `%${prenom}`);
  await searchPage.selectOption('select[name="cgroupe"]', { label: 'INTERNET' });
  await searchPage.getByRole('button', { name: 'Rechercher' }).click();

  console.log("\n")
  console.log("-------------------------")
  console.log("LANCEMENT SUR : ")
  console.log("🔻 "+ prenom)
  console.log("🔻 "+ codePostal)
  console.log("🔻 "+ dateMin)
  console.log("🔻 "+ mode)
  console.log("\n")

  const alert = await searchPage.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
  if (alert) await alert.accept();
  else await scanResultTable(codes, dateMin, mode);
}

async function scanResultTable(codes: string[], dateMin: Date, mode: string) {
  let pageNum = 1;

  while (true) {
    let ligne = 2;
    while (true) {
      const rowClass = ligne % 2 === 0 ? '.left_blanc' : '.left_grisclair';
      const baseSelector = `${rowClass}:nth-child(${ligne}) > td:nth-child`;
      const exists = await searchPage?.$(`${baseSelector}(1)`);
      if (!exists) break;

      const numeroAbo = await searchPage?.textContent(`${baseSelector}(1)`);
      const codeAction = await searchPage?.textContent(`${baseSelector}(10)`);

      if ((mode === "Statut" && !codeAction) || (mode === "Annulation" && codes.includes(codeAction))) {
        const isValid = await checkDetails(numeroAbo || '', dateMin, codes, mode, ligne);
        if (isValid) {
          console.log("⭐⭐⭐ trouvé: ", numeroAbo);
          const codePostal = await searchPage?.textContent(`${baseSelector}(6)`);
          const prenomAbo = await searchPage?.textContent(`${baseSelector}(4)`);

          resultCache.push({
            numeroAbo: numeroAbo?.trim() ?? '',
            codePostal: codePostal?.trim() ?? '',
            prenom: prenomAbo?.trim() ?? '',
          });
        }
      }
      ligne++;
    }


    //on regarde d'abord si on est toujours en recherche 
    if(!isSearching){return}

    let nextBtn = null;
      
    pageNum++;
    console.log("ℹ️ Page suivante " +pageNum)

    const pageNumStr = pageNum.toString()

    try {
      const nextPage = await searchPage?.$(`a[href='javascript:pDisplaysubscriber(${pageNumStr});']`);
      await nextPage.click();
    } catch (e) {
      console.log("🎌 fin de pagination");
      break;
    }

  }
}

async function checkDetails(numeroAbo: string, dateMin: Date, codes: string[], mode: string, ligne: number): Promise<boolean> {
  if (!searchPage || !mainPage) return false;

  //console.log("❓ potentiel: ", numeroAbo);

  await searchPage.locator(`table tr:nth-child(${ligne}) td:first-child a`).click();

  //const titleFrame = await mainPage.frame({ name: 'titleFrame' });
  const rightFrame = await mainPage.frame({ name: '_right' });

  try {
    await rightFrame.waitForFunction(
      (expected) => {
        const el = document.querySelector('#numabo');
        return el && el instanceof HTMLInputElement && el.value === expected;
      },
      numeroAbo,
      { timeout: 5000 }
    );
  } catch (e) {
    console.log("❌❌❌ délais d'affichage trop long pour :", numeroAbo);
    return false;
  }

  switch (mode) {
    case "Statut": {
      try {
        const codeStatut = await rightFrame.textContent('#cfull');
        const distributeur = await rightFrame.textContent('#numdist');

        const dateStr = await rightFrame.textContent('#datcre');
        const match = dateStr?.match(/^(\d{2}\/\d{2}\/\d{4})$/);
        const dateParsed = parse(match[1], 'dd/MM/yyyy', new Date());

        if (!codeStatut || !codes.includes(codeStatut.trim())) return false;
        if (distributeur?.trim() == '1314') return false;
        return dateParsed > dateMin;

      } catch {
        return false;
      } finally {
        await mainPage.bringToFront();
      }
    }
    case "Annulation": {
      try {
        const dateStr = await rightFrame.textContent('#lannul');
        const match = dateStr?.match(/\((\d{2}\/\d{2}\/\d{4})\)/);

        const dateParsed = parse(match[1], 'dd/MM/yyyy', new Date());
        return dateParsed > dateMin;
      } catch (error) {
        console.log("❌ Erreur Annulation", error);
        return false;
      } finally {
        await mainPage.bringToFront();
      }
    }
    default:
      return false;
  }
}



//=======================================================================
//============================TOOLS FUNCTIONS============================
//=======================================================================


export async function getResults() {
  return resultCache;
}

export async function stopSearch() {
  isSearching = false;
  console.log("⛔ recherche arrêtée")
}

function attachLifecycleHooks() {
  if (!browser || !context) return;
  mainPage.on('close', cleanBotState);
  searchPage?.on('close', cleanBotState);
  browser.on('disconnected', cleanBotState);
  context.on('page', (page) => {
    page.on('close', cleanBotState);
  });
}

function cleanBotState() {
  console.log("💀💀💀💀");
  isSearching = false;
  searchPage = null;
  mainPage = null;
  context = null;
  browser = null;
  isConnected = false;
}

export async function getRealBotStatus() {
  //console.log(isConnected ? "🟢" : "🔴")
  return {
    isOpen: !!browser && !browser.isConnected?.() === false,
    isConnected: isConnected,
    isSearching: isSearching,
  };
}

async function botRefresh(){
  
  //await mainPage.reload();
  //await searchPage.reload();

  await searchPage.bringToFront();

  await mainPage.waitForLoadState('domcontentloaded')
  await searchPage.waitForLoadState('domcontentloaded')
}

export async function logBotState(details: boolean) {
  console.log('ℹ️ 🧠 ÉTAT ACTUEL DU BOT');
  console.log(`ℹ️ ⚡ Connecté : ${isConnected ? '🟢 Oui' : '🔴 Non'}`);
  console.log('ℹ️ ⚙️ Mémoire :', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
  console.log(`ℹ️ 📊 ResultCache: ${resultCache.length} éléments`);
  console.log('ℹ️ 📄 Pages:' + context.pages);
  

  if (browser && details) {
    console.log(`ℹ️ 🔌 isSearching: ${isSearching}`);
    console.log(`ℹ️ 📦 Browser: ${browser ? '✅ Oui' : '❌ Non'}`);
    console.log(`ℹ️ 🌐 Context: ${context ? '✅ Oui' : '❌ Non'}`);
    console.log(`ℹ️ 📄 Main Page: ${mainPage ? await mainPage.url() : '❌ Non défini'}`);
    console.log(`ℹ️ 🔍 Search Page: ${searchPage ? await searchPage.url() : '❌ Non défini'}`);
  }
  

  console.log('---------------------------------------\n');
}