def findDateMode(self, codePostal, prenom, callback, codes_annul_liste, dateMin_annul):
        # go dans l'onglet search
        self.driver.switch_to.window(self.all_tabs[1])
        #print("lancement de: "+prenom,g_codeMQ, g_borneMax, g_borneMin)
        self.driver.find_element(By.NAME, "cpostal").clear()
        self.driver.find_element(By.NAME, "prenom").clear()
        self.driver.find_element(By.NAME, "cpostal").send_keys(codePostal)
        self.driver.find_element(By.NAME, "prenom").send_keys(prenom)
        dropdown = self.driver.find_element(By.NAME, "cgroupe")
        dropdown.find_element(By.XPATH, "//option[. = 'INTERNET']").click()
        self.driver.find_element(By.NAME, "search").click()

        #le numero de page actuel
        numero_page = 1

        # gérer l'alerte et cliquer sur OK
        try:
            time.sleep(0.5)
            self.driver.switch_to.alert.accept()
            callback(prenom)
            return
        except Exception as e:
            print("\n"+"##ERREUR: " + str(e).split("\n")[0])
            while (True):
                ligne_abo = 2
                while (True):
                    # les lignes paires sont appellés blanc et impaires grisclair
                    selection_ligne = "." + "left_grisclair" + ":nth-child(" + str(ligne_abo) + ") > td:nth-child"
                    if (ligne_abo % 2 == 0):
                        selection_ligne = "." + "left_blanc" + ":nth-child(" + str(ligne_abo) + ") > td:nth-child"

                    # si on ne trouve pas de ligne suivante on break
                    try:
                        self.driver.find_element(By.CSS_SELECTOR, selection_ligne + "(1)")
                    except NoSuchElementException:
                        break
                    numero_abo_g = self.driver.find_element(By.CSS_SELECTOR, selection_ligne + "(1)").text


                    abo_MBMQ = self.driver.find_element(By.CSS_SELECTOR, selection_ligne + "(10)").text
                    if (abo_MBMQ == ""):
                        if self.checkANNULdate(selection_ligne, dateMin_annul, codes_annul_liste):
                            self.driver.switch_to.window(self.all_tabs[1])
                            code_postal = self.driver.find_element(By.CSS_SELECTOR,selection_ligne + "(6)").text
                            prenomAbo = self.driver.find_element(By.CSS_SELECTOR,selection_ligne + "(4)").text
                            print("trouvé (code annulation): ", [numero_abo_g, code_postal, prenomAbo])
                            callback([numero_abo_g, code_postal, prenomAbo])
                        else:
                            # pas oublie de revenir à la page s'il trouve pas
                            self.driver.switch_to.window(self.all_tabs[1])
                    #dans tous les cas on passe au suivant
                    ligne_abo += 1

                numero_page += 1
                try:
                    tableau_suivant = self.driver.find_element(By.CSS_SELECTOR, f"a[href='javascript:pDisplaysubscriber({numero_page});']")
                except NoSuchElementException:
                    break
                tableau_suivant.click()

