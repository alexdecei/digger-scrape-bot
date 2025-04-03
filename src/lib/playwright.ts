import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { parse } from 'date-fns';

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
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    mainPage = await context.newPage();
    
    isConnected = true;
    isSearching = false;

    attachLifecycleHooks();

    await mainPage.goto('https://cgaweb-drom.canal-plus.com/server/servlet/Home');

    

    await loginWithOkta(oktaCode);

    const searchPagePromise = mainPage.waitForEvent('popup');
    await mainPage.frameLocator('frame[name="titleFrame"]').getByText('Sélection Abonné').click();
    searchPage = await searchPagePromise;

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



export async function loginWithOkta(oktaCode: string) {
  await mainPage.fill('#cuser', 'VAD-DCY2');
  await mainPage.fill('#pass', 'Canal974**y');
  await mainPage.getByRole('button', { name: 'Login' }).click();
  await mainPage.getByRole('radio').check();
  await mainPage.getByRole('button', { name: 'Valider' }).click();
  await mainPage.fill('#passCode', oktaCode);
  //await mainPage.getByRole('button', { name: 'Valider' }).click();
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
  await logBotState(false);

  resultCache = [];
  const dateMin = new Date(params.date);

  isSearching = true;
  for (const codePostal of params.postalCodes) {
    for (const prenom of params.names) {
      try {
        await runSingleSearch(prenom, codePostal, params.codes, dateMin, params.mode);
      } catch (error) {
        console.log("❌ erreur sur", prenom);
        console.log(error);
      }
    }
  }
  isSearching = false;
}

async function runSingleSearch(prenom: string, codePostal: string, codes: string[], dateMin: Date, mode: string) {
  if (!searchPage) throw new Error("Search page not initialized");

  await searchPage.fill('input[name="cpostal"]', codePostal);
  await searchPage.fill('input[name="prenom"]', `%${prenom}`);
  await searchPage.selectOption('select[name="cgroupe"]', { label: 'INTERNET' });
  await searchPage.getByRole('button', { name: 'Rechercher' }).click();

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

      if ((mode === "Status" && !codeAction) || (mode === "Annulation" && codes.includes(codeAction))) {
        const isValid = await checkDetails(numeroAbo || '', dateMin, codes, mode, ligne);
        if (isValid) {
          const codePostal = await mainPage?.textContent(`${baseSelector}(6)`);
          const prenomAbo = await mainPage?.textContent(`${baseSelector}(4)`);

          resultCache.push({
            numeroAbo: numeroAbo?.trim() ?? '',
            codePostal: codePostal?.trim() ?? '',
            prenom: prenomAbo?.trim() ?? '',
          });
        }
      }
      ligne++;
    }

    pageNum++;
    const nextPage = await mainPage?.$(`a[href='javascript:pDisplaysubscriber(${pageNum});']`);
    if (!nextPage) break;
    await nextPage.click();
  }
}

async function checkDetails(numeroAbo: string, dateMin: Date, codes: string[], mode: string, ligne: number): Promise<boolean> {
  if (!searchPage || !mainPage) return false;

  console.log("ℹ️ lancement checkDetails pour", numeroAbo);

  await searchPage.locator(`table tr:nth-child(${ligne}) td:first-child a`).click();

  switch (mode) {
    case "Statut": {
      try {
        const codeStatut = await mainPage.textContent('#cfull');
        const distributeur = await mainPage.textContent('#numdist');
        const dateStr = await mainPage.textContent('#datcre');

        if (!codeStatut || !codes.includes(codeStatut.trim())) return false;
        if (distributeur?.trim() === '1314') return false;

        const date = parse(dateStr?.trim() ?? '', 'dd/MM/yyyy', new Date());
        return date > dateMin;
      } catch {
        return false;
      } finally {
        await mainPage.bringToFront();
      }
    }
    case "Annulation": {
      try {
        const rightFrame = await mainPage.frame({ name: '_right' });
        if (!rightFrame) return false;
        await rightFrame.waitForSelector('#lannul');
        const dateStr = await rightFrame.textContent('#lannul');
        const match = dateStr?.match(/\((\d{2}\/\d{2}\/\d{4})\)/);
        if (!match) return false;

        const dateParsed = parse(match[1], 'dd/MM/yyyy', new Date());
        return dateParsed > dateMin;
      } catch (error) {
        console.error("❌ Erreur Annulation", error);
        return false;
      } finally {
        await mainPage.bringToFront();
      }
    }
    default:
      return false;
  }
}

export async function getResults() {
  return resultCache;
}



//=======================================================================
//============================TOOLS FUNCTIONS============================
//=======================================================================


function attachLifecycleHooks() {
  if (!browser || !context) return;
  browser.on('disconnected', cleanBotState);
  context.on('page', (page) => {
    page.on('close', cleanBotState);
  });
}

function cleanBotState() {
  console.log("💀💀💀💀");
  isConnected = false;
  isSearching = false;
  browser = null;
  mainPage = null;
  searchPage = null;
  context = null;
}

export async function getRealBotStatus() {
  return {
    isOpen: !!browser && !browser.isConnected?.() === false,
    isConnected: isConnected,
    isSearching: isSearching,
  };
}

export async function logBotState(details: boolean) {
  console.log('ℹ️🧠 ÉTAT ACTUEL DU BOT');

  console.log(`ℹ️🔌 isConnected: ${isConnected}`);
  console.log(`ℹ️📦 Browser: ${browser ? '✅ Oui' : '❌ Non'}`);
  console.log(`ℹ️🌐 Context: ${context ? '✅ Oui' : '❌ Non'}`);
  console.log(`ℹ️📄 Main Page: ${mainPage ? await mainPage.url() : '❌ Non défini'}`);
  console.log(`ℹ️🔍 Search Page: ${searchPage ? await searchPage.url() : '❌ Non défini'}`);
  console.log(`ℹ️📊 ResultCache: ${resultCache.length} éléments`);

  if (browser && details) {
    const contexts = browser.contexts();
    console.log(`ℹ️🧱 Browser contient ${contexts.length} contextes:`);

    for (const [i, ctx] of contexts.entries()) {
      const pages = ctx.pages();
      console.log(`  🔸 Contexte ${i + 1}: ${pages.length} page(s)`);

      for (const [j, page] of pages.entries()) {
        const title = await page.title().catch(() => '???');
        const url = page.url();
        console.log(`    🔹 Page ${j + 1}: "${title}" [${url}]`);

        const frames = page.frames();
        console.log(`      🔳 ${frames.length} frame(s):`);
        frames.forEach((frame, k) => {
          console.log(`        ▫ Frame ${k + 1}: name="${frame.name()}" url="${frame.url()}"`);
        });
      }
    }
  }

  console.log('---------------------------------------\n');
}