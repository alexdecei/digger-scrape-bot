import { chromium, Browser, Page, BrowserContext } from 'playwright';


import { parse } from 'date-fns';

let browser: Browser | null = null;
let mainPage: Page | null = null;
let detailPage: Page | null = null;
let isRunning = false;
let context: BrowserContext | null = null;
let resultCache: any[] = [];

export async function startBot(oktaCode?: string) {
  if (browser) return;
  if (isRunning) return;

  browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  mainPage = await context.newPage();

  await mainPage.goto('https://cgaweb-drom.canal-plus.com/server/servlet/Home');
  isRunning = true;

  browser.on('disconnected', () => {
    isRunning = false;
    browser = null;
    mainPage = null;
    detailPage = null;
  });

  await loginWithOkta(oktaCode).catch((e) => console.error('[Login OKTA] Failed:', e));

  detailPage = await context.newPage();
  await mainPage.goto('https://cgaweb-drom.canal-plus.com/server/selectsubscriber.do');
  await mainPage.bringToFront();
  
}



export async function stopBot() {
  if (browser) {
    await browser.close(); // ← S'ASSURER que cette ligne est atteinte
    browser = null;
    mainPage = null;
    detailPage = null;
    isRunning = false;
  }
}

export async function isBotRunning() {
  return isRunning;
}



export async function loginWithOkta(oktaCode: string) {
  if (!mainPage) throw new Error("Page not initialized");

  // 1. ID & pass
  await mainPage.fill('#cuser', 'VAD-DCY2');
  await mainPage.fill('#pass', 'Canal974**y');
  await mainPage.click('input[type="submit"][name="login"]');

  // 2. Sélection du facteur
  await mainPage.waitForSelector('input[name="factorId"][value="ostd2pwbw7wBSj9q5417"]');
  await mainPage.check('input[name="factorId"][value="ostd2pwbw7wBSj9q5417"]');

  // 3. Valider
  await mainPage.click('input[name="sendChallenge"]');

  // 4. Entrer le code
  await mainPage.fill('#passCode', "044345");

  // 5. Valider
  await mainPage.click('input[name="verifyChallenge"]');

  
}



//------------------------------------------------------------------------




export async function performSearch(params: {
  mode: string;
  names: string[];
  codes: string[];
  postalCodes: string[];
  date: string;
}) {

  /*
  if (!mainPage) throw new Error('Bot not initialized');

  const searchUrl = 'https://cgaweb-drom.canal-plus.com/server/selectsubscriber.do';

  if (mainPage.url() !== searchUrl) {
    console.log('[BOT] Redirection vers page de recherche...');
    await mainPage.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  }
    */
  console.log("lancement performsearch sur : ")
  console.log('[Search Params]', JSON.stringify(params, null, 2));

  resultCache = [];
  const dateMin = new Date(params.date);

  for (const codePostal of params.postalCodes) {
    for (const prenom of params.names) {
      await runSingleSearch(prenom, codePostal, params.codes, dateMin, params.mode);
    }
  }
}

async function runSingleSearch(prenom: string, codePostal: string, codes: string[], dateMin: Date, mode: string) {
  await mainPage!.bringToFront();

  await mainPage!.fill('input[name="cpostal"]', codePostal);
  await mainPage!.fill('input[name="prenom"]', '%'+prenom);
  await mainPage!.selectOption('select[name="cgroupe"]', { label: 'INTERNET' });
  await mainPage!.click('input[name="search"]');

  const alert = await mainPage!.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
  if (alert) {
    await alert.accept();
    return;
  }

  await scanResultTable(codes, dateMin, mode);
}

async function scanResultTable(codes: string[], dateMin: Date, mode: string) {
  let pageNum = 1;

  while (true) {
    let ligne = 2;
    while (true) {
      const rowClass = ligne % 2 === 0 ? '.left_blanc' : '.left_grisclair';
      const baseSelector = `${rowClass}:nth-child(${ligne}) > td:nth-child`;

      const exists = await mainPage!.$(`${baseSelector}(1)`);
      if (!exists) break;

      const numeroAbo = await mainPage!.textContent(`${baseSelector}(1)`);
      const codeAction = await mainPage!.textContent(`${baseSelector}(10)`);
      

      //verification a refaire : on vérifirae juste si un des mode est valide
      if ((!codeAction && mode=="Status") || (codes.includes(codeAction) && mode=="Annulation")) 
        {
        console.log(numeroAbo)
        const isValid = await checkDetails(baseSelector, dateMin, codes, mode);
        //const isValid = true
        if (isValid) {
          console.log("trouvé : "+numeroAbo)
          const codePostal = await mainPage!.textContent(`${baseSelector}(6)`);
          const prenomAbo = await mainPage!.textContent(`${baseSelector}(4)`);

          const result = {
            numeroAbo: numeroAbo?.trim() ?? '',
            codePostal: codePostal?.trim() ?? '',
            prenom: prenomAbo?.trim() ?? '',
          };

          resultCache.push(result);
        }
      }

      ligne++;
    }

    pageNum++;
    const nextPage = await mainPage!.$(`a[href='javascript:pDisplaysubscriber(${pageNum});']`);
    if (!nextPage) break;
    await nextPage.click();
  }
}

async function checkDetails(baseSelector: string, dateMin: Date, codes: string[], mode : string): Promise<boolean> {
  

  try {
    const index = 1; // ou autre index selon le résultat ciblé
    const scriptToRun = await mainPage.$eval(
      `${baseSelector}(${index}) > a`,
      (el: HTMLAnchorElement) => el.getAttribute('href')
    );
    
    if (!scriptToRun || !scriptToRun.startsWith('javascript:')) {
      console.error('[BOT] Lien JS introuvable ou incorrect');
      return;
    }
    
    // Exécuter le script JS manuellement dans le contexte de la page
    await mainPage.evaluate((code) => {
      // eslint-disable-next-line no-eval
      eval(code.replace(/^javascript:/, ''));
    }, scriptToRun);
    
    // Attendre un élément clé qui prouve que le "détail" s'est affiché
    await mainPage.waitForSelector('#datcre'); // ← remplace par le bon sélecteur
  }
  catch(error) {
    console.log(error);
  }

  switch(mode) { 
    case "Statut": { 
      try {
        const frame = detailPage.frame({ name: 'content' });
        if (!frame) return false;
    
        await frame.waitForSelector('#datcre', { timeout: 2000 });
    
        const codeStatut = await frame.textContent('#cfull');
        const distributeur = await frame.textContent('#numdist');
        const dateStr = await frame.textContent('#datcre');
    
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
        const frame = detailPage.frame({ name: 'content' });
        if (!frame) return false;
    
        await frame.waitForSelector('#lannul', { timeout: 2000 });
        const dateStr = await frame.textContent('#lannul');
    
        const date = parse(dateStr?.trim() ?? '', 'dd/MM/yyyy', new Date());
        return date > dateMin;
      } catch {
        return false;
      } finally {
        await mainPage.bringToFront();
      }
      
    }

  }
}

export async function getResults() {
  return resultCache;
}

