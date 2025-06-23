const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const router = express.Router();
const sass = require("sass");
const pg = require("pg");

// Importă modulul de oferte
const sistemOferte = require('./resurse/js/oferta');

const Client = pg.Client;
client = new Client({
    database: "gusturiculturi",
    user: "postgres",
    password: "tehniciweb",
    host: "localhost",
    port: 5432
});

client.connect()
    .then(() => {
        console.log("Connected to PostgreSQL");
        
        // Inițializează sistemul de oferte după conectare la baza de date
        sistemOferte.initializeazaSistemOferte(client);
        
        return client.query("SELECT * FROM feluri_mancare");
    })
    .then(rezultat => {
        console.log("Rezultat query:", rezultat.rows);
        return client.query("SELECT * FROM unnest(enum_range(null::tip_bucatarie))");
    })
    .then(rezultat => {
        console.log(rezultat.rows);
    })
    .catch(err => {
        console.error("Database error:", err);
    });

// Modifică și celelalte verificări
client.query("SELECT * FROM feluri_mancare", function (err, rezultat) {
    console.log(err)
    console.log("Rezultat query:", rezultat)
})
client.query("SELECT * FROM unnest(enum_range(null::tip_bucatarie))", function (err, rezultat) {
    console.log(err)
    console.log(rezultat)
})

app = express();

v = [10, 27, 23, 44, 15]

nrImpar = v.find(function (elem) { return elem % 100 == 1 })
console.log(nrImpar)


console.log("Folderul proiectului: ", __dirname);
console.log("Calea fisierului index.js: ", __filename);
console.log("Folderul curent de lucru: ", process.cwd());


// Change this to ejs instead of js
app.set("view engine", "ejs");

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}


function toRoman(num) {
    const romanNumerals = {
        1: 'i', 2: 'ii', 3: 'iii', 4: 'iv', 5: 'v',
        6: 'vi', 7: 'vii', 8: 'viii', 9: 'ix', 10: 'x',
        11: 'xi', 12: 'xii', 13: 'xiii', 14: 'xiv', 15: 'xv'
    };
    return romanNumerals[num] || num;
}

// Adaugă funcția la locals pentru a fi disponibilă în toate șabloanele
app.use((req, res, next) => {
    res.locals.toRoman = toRoman;
    next();
});

function compileazaScss(caleScss, caleCss) {
    console.log("cale:", caleCss);
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0];
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    let numeFisCss = path.basename(caleCss);

    let timestamp = Date.now();
    let numeFisCssBackup = numeFisCss.replace(".css", `_${timestamp}.css`);

    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(caleBackup, numeFisCssBackup));
    }

    let rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
}

//la pornirea serverului
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    console.log(eveniment, numeFis);
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})


function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    console.log(obGlobal.obErori);

    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
    console.log(obGlobal.obErori);
}

initErori();

async function initImagini() {
    try {
        console.log("Starting image initialization...");

        // 1. Load and parse the gallery JSON file
        const galeriePath = path.join(__dirname, "resurse/json/galerie.json");
        if (!fs.existsSync(galeriePath)) {
            throw new Error("Gallery JSON file not found");
        }

        const fileContent = fs.readFileSync(galeriePath, "utf-8");
        const galleryData = JSON.parse(fileContent);

        // 2. Validate the JSON structure
        if (!galleryData?.cale_galerie || !Array.isArray(galleryData?.imagini)) {
            throw new Error("Invalid gallery JSON structure");
        }

        // 3. Prepare paths
        const galerieFolder = path.join(__dirname, galleryData.cale_galerie);
        const mediumFolder = path.join(galerieFolder, "mediu");

        // 4. Create medium folder if needed
        if (!fs.existsSync(mediumFolder)) {
            fs.mkdirSync(mediumFolder, { recursive: true });
            console.log("Created medium folder:", mediumFolder);
        }

        // 5. Process each image
        const processedImages = [];
        for (const image of galleryData.imagini) {
            try {
                // Skip if missing required field
                if (!image?.fisier_imagine) {
                    console.warn("Skipping image - missing fisier_imagine:", image);
                    continue;
                }

                const [fileName, fileExt] = image.fisier_imagine.split('.');
                const sourcePath = path.join(galerieFolder, image.fisier_imagine);
                const mediumPath = path.join(mediumFolder, `${fileName}.webp`);

                // Verify source exists
                if (!fs.existsSync(sourcePath)) {
                    console.warn(`Source image not found: ${sourcePath}`);
                    continue;
                }

                // Process image
                await sharp(sourcePath)
                    .resize(300)
                    .toFile(mediumPath);

                // Update image object with paths
                const processedImage = {
                    ...image,
                    fisier_mediu: `/${galleryData.cale_galerie}/mediu/${fileName}.webp`,
                    fisier: `/${galleryData.cale_galerie}/${image.fisier_imagine}`
                };

                processedImages.push(processedImage);
                console.log(`Processed image: ${image.fisier_imagine}`);

            } catch (err) {
                console.error(`Error processing image ${image?.fisier_imagine || 'unknown'}:`, err);
            }
        }

        // 6. Update global object
        obGlobal.obImagini = {
            cale_galerie: galleryData.cale_galerie,
            imagini: processedImages
        };

        console.log("Successfully initialized gallery with", processedImages.length, "images");
        return true;

    } catch (error) {
        console.error("CRITICAL ERROR in initImagini:", error);

        // Provide fallback empty structure
        obGlobal.obImagini = {
            cale_galerie: "resurse/imagini/galerie",
            imagini: []
        };
        return false;
    }
}


app.get("/pagina_galerie", function (req, res) {
    res.render("pagini/pagina_galerie", { ip: req.ip, imagini: obGlobal.obImagini.imagini });
})


// Găsește handler-ul rutei /produse și modifică-l:
app.get("/produse", function (req, res) {
    let conditieWhere = "";
    const categorie = req.query.categorie;

    if (categorie && categorie !== "toate") {
        conditieWhere = ` WHERE bucatarie='${categorie}'`;
    }

    const queryText = `SELECT * FROM feluri_mancare${conditieWhere} ORDER BY id`;

    // Obține oferta curentă
    const ofertaCurenta = sistemOferte ? sistemOferte.getOfertaCurenta() : null;

    // O singură interogare și un singur render
    client.query(queryText, function (err, rezultat) {
        if (err) {
            console.error(err);
            afisareEroare(res, 500);
            return;
        }

        client.query("SELECT unnest(enum_range(NULL::tip_bucatarie)) as categorie", function (errCategorii, rezCategorii) {
            if (errCategorii) {
                console.error(errCategorii);
                afisareEroare(res, 500);
                return;
            }

            const categorii = rezCategorii.rows.map(row => row.categorie);
            
            // Identifică cel mai ieftin produs din fiecare categorie
            const celeMaiIeftineProduse = {};
            
            // Grupează produsele pe categorii
            const produsePeCategorie = {};
            for (const produs of rezultat.rows) {
                const bucatarie = produs.bucatarie || "necunoscuta";
                if (!produsePeCategorie[bucatarie]) {
                    produsePeCategorie[bucatarie] = [];
                }
                produsePeCategorie[bucatarie].push(produs);
            }
            
            // Pentru fiecare categorie, găsește produsul cu prețul cel mai mic
            for (const cat in produsePeCategorie) {
                let celMaiIeftinProdus = produsePeCategorie[cat][0];
                
                for (const produs of produsePeCategorie[cat]) {
                    if (parseFloat(produs.pret) < parseFloat(celMaiIeftinProdus.pret)) {
                        celMaiIeftinProdus = produs;
                    }
                }
                
                celeMaiIeftineProduse[cat] = celMaiIeftinProdus.id;
            }

            // Un singur render cu toate datele necesare
            res.render("pagini/produse", {
                produse: rezultat.rows,
                categorii: categorii,
                categorie_selectata: categorie || "toate",
                oferta: ofertaCurenta,
                celeMaiIeftineProduse: celeMaiIeftineProduse
            });
        });
    });
});

app.get("/seturi", function (req, res) {
    // Obține oferta curentă
    const ofertaCurenta = sistemOferte ? sistemOferte.getOfertaCurenta() : null;

    // Obține toate seturile cu produsele lor
    const queryText = `
        SELECT s.id, s.nume, s.descriere,
               ARRAY_AGG(p.id) as produs_ids,
               ARRAY_AGG(p.nume) as produs_nume,
               ARRAY_AGG(p.imagine) as produs_imagini,
               ARRAY_AGG(p.pret) as produs_preturi
        FROM seturi s
        JOIN asociere_set a ON s.id = a.id_set
        JOIN feluri_mancare p ON a.id_produs = p.id
        GROUP BY s.id, s.nume, s.descriere
        ORDER BY s.id
    `;

    client.query(queryText, function (err, rezultat) {
        if (err) {
            console.error("Eroare la obținerea seturilor:", err);
            afisareEroare(res, 500);
            return;
        }

        // Calculează prețurile pentru fiecare set
        const seturiCuPreturi = rezultat.rows.map(set => {
            // Convertește prețurile la numere și calculează suma
            const preturi = set.produs_preturi.map(p => parseFloat(p));
            const sumaPreturi = preturi.reduce((total, p) => total + p, 0);
            
            // Calculează reducerea: min(5, număr_produse) * 5%
            const numarProduse = set.produs_ids.length;
            const procentReducere = Math.min(5, numarProduse) * 5;
            const reducere = sumaPreturi * (procentReducere / 100);
            
            // Calculează prețul final
            const pretFinal = sumaPreturi - reducere;
            
            return {
                ...set,
                suma_preturi: sumaPreturi.toFixed(2),
                procent_reducere: procentReducere,
                valoare_reducere: reducere.toFixed(2),
                pret_final: pretFinal.toFixed(2)
            };
        });

        res.render("pagini/seturi", {
            seturi: seturiCuPreturi,
            oferta: ofertaCurenta
        });
    });
});


// Modifică secțiunea din ruta produsului
app.get("/produs/:id", function (req, res) {
    const idProdus = parseInt(req.params.id);

    if (isNaN(idProdus)) {
        afisareEroare(res, 400);
        return;
    }

    // Obține oferta curentă pentru a o afișa și pe pagina produsului
    const ofertaCurenta = sistemOferte.getOfertaCurenta();

    // Obține detaliile produsului
    client.query("SELECT * FROM feluri_mancare WHERE id = $1", [idProdus], function (err, rezultatProdus) {
        if (err) {
            console.error(err);
            afisareEroare(res, 500);
            return;
        }

        if (rezultatProdus.rowCount === 0) {
            afisareEroare(res, 404);
            return;
        }
        
        const produs = rezultatProdus.rows[0];
        
        // Obține produse similare - din aceeași bucătărie și/sau tip de fel
        // CORECTAT: categorie → tip_fel
        const querySimilare = `
            SELECT * FROM feluri_mancare 
            WHERE id != $1 
            AND (bucatarie = $2 OR tip_fel = $3)
            ORDER BY 
                CASE WHEN bucatarie = $2 AND tip_fel = $3 THEN 1
                     WHEN bucatarie = $2 THEN 2
                     WHEN tip_fel = $3 THEN 3
                     ELSE 4
                END,
                RANDOM()
            LIMIT 4
        `;
        
        
        client.query(querySimilare, [idProdus, produs.bucatarie, produs.tip_fel], function(errSimilare, rezultatSimilare) {
            // Gestionează posibile erori
            if (errSimilare) {
                console.error("Eroare la obținerea produselor similare:", errSimilare);
                rezultatSimilare = { rows: [] }; // Setează un array gol pentru produse similare
            }

            // Obține seturile din care face parte produsul
            const queryText = `
                SELECT s.id, s.nume, s.descriere,
                       ARRAY_AGG(p.id) as produs_ids,
                       ARRAY_AGG(p.nume) as produs_nume,
                       ARRAY_AGG(p.imagine) as produs_imagini,
                       ARRAY_AGG(p.pret) as produs_preturi
                FROM seturi s
                JOIN asociere_set a ON s.id = a.id_set
                JOIN feluri_mancare p ON a.id_produs = p.id
                WHERE EXISTS (
                    SELECT 1 FROM asociere_set a2 
                    WHERE a2.id_set = s.id AND a2.id_produs = $1
                )
                GROUP BY s.id, s.nume, s.descriere
                ORDER BY s.id
            `;

            client.query(queryText, [idProdus], function (errSeturi, rezultatSeturi) {
                if (errSeturi) {
                    console.error("Eroare la obținerea seturilor pentru produs:", errSeturi);
                    rezultatSeturi = { rows: [] }; // Array gol pentru seturi
                }

                // Calculează prețurile pentru fiecare set
                const seturiCuPreturi = rezultatSeturi.rows.map(set => {
                    // Convertește prețurile la numere și calculează suma
                    const preturi = set.produs_preturi.map(p => parseFloat(p));
                    const sumaPreturi = preturi.reduce((total, p) => total + p, 0);
                    
                    // Calculează reducerea: min(5, număr_produse) * 5%
                    const numarProduse = set.produs_ids.length;
                    const procentReducere = Math.min(5, numarProduse) * 5;
                    const reducere = sumaPreturi * (procentReducere / 100);
                    
                    // Calculează prețul final
                    const pretFinal = sumaPreturi - reducere;
                    
                    return {
                        ...set,
                        suma_preturi: sumaPreturi.toFixed(2),
                        procent_reducere: procentReducere,
                        valoare_reducere: reducere.toFixed(2),
                        pret_final: pretFinal.toFixed(2)
                    };
                });

                res.render("pagini/produs", {
                    produs: rezultatProdus.rows[0],
                    oferta: ofertaCurenta,
                    seturi: seturiCuPreturi,
                    produseSimilare: rezultatSimilare.rows
                });
            });
        });
    });
});

app.use(function (req, res, next) {
    client.query("SELECT unnest(enum_range(NULL::tip_bucatarie)) as categorie", function (errCategorii, rezCategorii) {
        if (errCategorii) {
            console.error(errCategorii);
            next();
            return;
        }

        res.locals.categorii = rezCategorii.rows.map(row => row.categorie);
        next();
    });
});

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(function (elem) {
        return elem.identificator == identificator;
    });

    let titluCustom, textCustom, imagineCustom;

    if (eroare) {
        if (eroare.status)
            res.status(identificator);
        titluCustom = titlu || eroare.titlu;
        textCustom = text || eroare.text;
        imagineCustom = imagine || eroare.imagine;
    } else {
        let err = obGlobal.obErori.eroare_default;
        titluCustom = titlu || err.titlu;
        textCustom = text || err.text;
        imagineCustom = imagine || err.imagine;
    }

    return res.render("pagini/eroare", {
        identificator: identificator,
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
    });
}

app.use("/resurse", function (req, res, next) {
    let caleFisier = path.join(__dirname, "resurse", req.url);
    if (fs.existsSync(caleFisier) && fs.lstatSync(caleFisier).isDirectory()) {
        return afisareEroare(res, 403);
    } else {
        next();
    }
});

app.use("/resurse", express.static(path.join(__dirname, "resurse"), {
    index: false,
    fallthrough: true
}));

const faviconDir = path.join(__dirname, "resurse/ico/favicon");
if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true });
    console.log("Folderul pentru favicon a fost creat");
}

const faviconPath = path.join(faviconDir, "favicon.ico");
if (!fs.existsSync(faviconPath)) {
    fs.copyFileSync(
        path.join(__dirname, "resurse/imagini/favicon/favicon-96x96.png"),
        faviconPath
    );
    console.log("Favicon generat cu succes");
}

app.get("/favicon.ico", function (req, res) {
    res.sendFile(faviconPath);
});

app.get("/index/a", function (req, res) {
    res.render("pagini/index");
});

app.get("/cerere", function (req, res) {
    res.send("<p style='color:blue'>Buna ziua</p>");
});

app.get("/fisier", function (req, res) {
    res.sendFile(path.join(__dirname, "package.json"));
});

app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
});

app.get("/comparare/:id1/:id2", function (req, res) {
    // Extrage și validează parametrii
    const id1 = parseInt(req.params.id1);
    const id2 = parseInt(req.params.id2);

    console.log("Cerere comparare produse - ID-uri primite:", id1, id2);

    // Validează ID-urile
    if (isNaN(id1) || isNaN(id2)) {
        console.error("ID-uri invalide:", req.params.id1, req.params.id2);
        afisareEroare(res, 400);
        return;
    }

    // Verifică dacă fișierul template există
    try {
        const templatePath = path.join(__dirname, 'views', 'pagini', 'comparare.ejs');
        if (!fs.existsSync(templatePath)) {
            console.error("Template-ul nu există:", templatePath);
            afisareEroare(res, 500, "Eroare de configurare", "Template-ul pentru comparare nu a fost găsit");
            return;
        }
        console.log("Template-ul există:", templatePath);
    } catch (err) {
        console.error("Eroare la verificarea template-ului:", err);
    }

    // Interogarea bazei de date
    client.query("SELECT * FROM feluri_mancare WHERE id = $1 OR id = $2",
        [id1, id2],
        function (err, rezultat) {
            if (err) {
                console.error("Eroare SQL:", err);
                afisareEroare(res, 500);
                return;
            }

            // Verifică dacă s-au găsit ambele produse
            console.log("Produse găsite:", rezultat.rowCount, "- ID-uri:", rezultat.rows.map(p => p.id));

            if (rezultat.rowCount != 2) {
                console.error("Produse negăsite sau număr incorect:", rezultat.rowCount);
                afisareEroare(res, 404);
                return;
            }

            try {
                // Funcție helper pentru formatare categorii
                function formatareDenumireCategorie(categorie) {
    if (!categorie) return "Necategorizat";
    
    const traduceri = {
        "romaneasca": "Românească",
        "ruseasca": "Rusească",
        "italiana": "Italiană",
        "franceza": "Franceză",
        "chinezeasca": "Chinezească",
        "mediteraneana": "Mediteraneană",
        "americana": "Americană",
        "fel_principal": "Fel principal",
        "aperitiv": "Aperitiv",
        "desert": "Desert",
        "traditional": "Tradițional",
        "street_food": "Street food",
        "garnitura": "Garnitură",
        "festiv": "Festiv"
    };
    
    return traduceri[categorie] || categorie.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

                // Ordonează rezultatele pentru a avea produsele în ordinea id1, id2
                let produseOrdonat = [...rezultat.rows];
                if (produseOrdonat.length > 1 && produseOrdonat[0].id !== id1) {
                    [produseOrdonat[0], produseOrdonat[1]] = [produseOrdonat[1], produseOrdonat[0]];
                }

                // Obține oferta curentă
                const ofertaCurenta = sistemOferte.getOfertaCurenta();

                // Afișează template-ul
                console.log("Randare template comparare cu produsele:", produseOrdonat.map(p => p.nume));
                res.render("pagini/comparare", {
                    produse: produseOrdonat,
                    formatareDenumireCategorie: formatareDenumireCategorie,
                    oferta: ofertaCurenta
                });
            } catch (err) {
                console.error("Eroare la pregătirea datelor pentru template:", err);
                afisareEroare(res, 500);
            }
        });
});

// Procesare imagini și servire date galerie
app.get(["/", "/index", "/home"], async (req, res) => {
    try {
        // Încarcă datele din JSON
        const dateGalerie = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse", "json", "galerie.json")));

        // Procesează imaginile și pregătește datele pentru afișare
        const imaginiProcesate = await proceseazaImagini(dateGalerie);

        // Obține oferta curentă
        const ofertaCurenta = sistemOferte.getOfertaCurenta();

        res.render("pagini/index", {
            ip: req.ip,
            cale_galerie: dateGalerie.cale_galerie,
            imaginiGalerie: imaginiProcesate,
            path: req.url,
            oferta: ofertaCurenta
        });
    } catch (err) {
        console.error("Eroare la încărcarea galeriei:", err);
        res.render("pagini/index", {
            ip: req.ip,
            path: req.url,
            error: "Eroare la încărcarea galeriei de imagini."
        });
    }
});

// Adaugă rută pentru pagina dedicată galeriei
app.get("/galerie", async (req, res) => {
    try {
        const dateGalerie = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse", "json", "galerie.json")));
        const imaginiProcesate = await proceseazaImagini(dateGalerie);

        // Obține oferta curentă
        const ofertaCurenta = sistemOferte.getOfertaCurenta();

        res.render("pagini/galerie", {
            ip: req.ip,
            cale_galerie: dateGalerie.cale_galerie,
            imaginiGalerie: imaginiProcesate,
            path: req.url,
            oferta: ofertaCurenta
        });
    } catch (err) {
        console.error("Eroare la încărcarea galeriei:", err);
        res.render("pagini/galerie", {
            ip: req.ip,
            path: req.url,
            error: "Eroare la încărcarea galeriei de imagini."
        });
    }
});

// Ruta catch-all - TREBUIE SĂ FIE ULTIMA RUTĂ
app.get("/*", function (req, res) {
    try {
        res.render("pagini" + req.url, function (err, rezultatRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                } else {
                    afisareEroare(res);
                }
            } else {
                console.log(rezultatRandare);
                res.send(rezultatRandare);
            }
        });
    } catch (errRandare) {
        if (errRandare.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
        } else {
            afisareEroare(res);
        }
    }
});

// Funcție pentru procesarea imaginilor și filtrarea după zi
async function proceseazaImagini(dateGalerie) {

    const zileSaptamana = ["duminica", "luni", "marti", "miercuri", "joi", "vineri", "sambata"];
    const dataAzi = new Date();
    const ziCurenta = zileSaptamana[dataAzi.getDay()];

    const caleGalerie = path.join(__dirname, dateGalerie.cale_galerie);

    const caleMediu = path.join(caleGalerie, "medium");
    const caleMic = path.join(caleGalerie, "small");

    if (!fs.existsSync(caleMediu)) {
        fs.mkdirSync(caleMediu, { recursive: true });
    }
    if (!fs.existsSync(caleMic)) {
        fs.mkdirSync(caleMic, { recursive: true });
    }

    // Generează imagini redimensionate
    for (const img of dateGalerie.imagini) {
        const caleFisier = path.join(caleGalerie, img.fisier_imagine);
        const caleMediuImg = path.join(caleMediu, img.fisier_imagine);
        const caleMicImg = path.join(caleMic, img.fisier_imagine);

        if (fs.existsSync(caleFisier)) {
            // Creează versiunea de dimensiune medie dacă nu există
            if (!fs.existsSync(caleMediuImg)) {
                await sharp(caleFisier)
                    .resize(300) // lățime 300px pentru ecran mediu
                    .toFile(caleMediuImg);
                console.log(`Imagine medie generată: ${img.fisier_imagine}`);
            }

            // Creează versiunea de dimensiune mică dacă nu există
            if (!fs.existsSync(caleMicImg)) {
                await sharp(caleFisier)
                    .resize(150) // lățime 150px pentru ecran mic
                    .toFile(caleMicImg);
                console.log(`Imagine mică generată: ${img.fisier_imagine}`);
            }
        }
    }

    console.log(`Ziua curentă: ${ziCurenta}`);

    const imaginiPotrivite = dateGalerie.imagini.filter(img => {
        if (!img.intervale_zile) return false;

        console.log(`Verificare imagine ${img.fisier_imagine}:`, img.intervale_zile);

        return img.intervale_zile.some(interval => {
            const ziStart = interval[0];
            const ziSfarsit = interval[1];

            const indexZiStart = zileSaptamana.indexOf(ziStart);
            const indexZiSfarsit = zileSaptamana.indexOf(ziSfarsit);
            const indexZiCurenta = zileSaptamana.indexOf(ziCurenta);

            // Verifică dacă ziua curentă este în interval
            if (indexZiStart <= indexZiSfarsit) {
                return indexZiCurenta >= indexZiStart && indexZiCurenta <= indexZiSfarsit;
            } else {
                // Interval care trece peste sfârșitul săptămânii (ex: vineri-luni)
                return indexZiCurenta >= indexZiStart || indexZiCurenta <= indexZiSfarsit;
            }
        });
    });
    // La sfârșitul funcției, chiar înainte de return:
    console.log(`Ziua curentă este: ${ziCurenta}`);
    console.log(`Număr de imagini potrivite: ${imaginiPotrivite.length}`);

    if (imaginiPotrivite.length === 0) {
        console.log("Nu s-au găsit imagini pentru ziua curentă! Afișăm toate imaginile.");
        return dateGalerie.imagini;
    }

    const numarImagini = Math.floor(imaginiPotrivite.length / 2) * 2;
    return imaginiPotrivite.slice(0, numarImagini);
}

const vectFoldere = ["temp", "temp1"];
vectFoldere.forEach(folder => {
    const caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
        console.log("Folderul a fost creat.");
    } else {
        console.log("Folderul există deja.");
    }
});

app.listen(8080);
console.log("Serverul a pornit");
console.log("Accesati http://localhost:8080/");