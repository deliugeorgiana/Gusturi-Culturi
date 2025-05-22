const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp= require("sharp");
const router= express.Router();
const sass= require("sass");
const pg=require("pg");



const Client=pg.Client;
client=new Client({
    database:"gusturiculturi",
    user:"postgres",
    password:"tehniciweb",
    host:"localhost",
    port:5050
})


client.connect()
client.query("select * from produse", function (err, rezultat) {
    console.log(err)
    console.log("Rezultat query:", rezultat)
})
client.query("select * from unnest(enum_range(null::categorie_mare))", function (err, rezultat) {
    console.log(err)
    console.log(rezultat)
})

app=express();

v = [10, 27, 23, 44, 15]

nrImpar = v.find(function (elem) { return elem % 100 == 1 })
console.log(nrImpar)


console.log("Folderul proiectului: ", __dirname);
console.log("Calea fisierului index.js: ", __filename);
console.log("Folderul curent de lucru: ", process.cwd());


// Change this to ejs instead of js
app.set("view engine", "ejs");

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup")
}



function compileazaScss(caleScss, caleCss){
    console.log("cale:", caleCss);
    if(!caleCss){
        let numeFisExt = path.basename(caleScss); // "folder1/folder2/ceva.txt" -> "ceva.txt"
        let numeFis = numeFisExt.split(".")[0]; // "a.scss" -> ["a","scss"]
        caleCss = numeFis + ".css"; // output: a.css
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, {recursive: true});
    }

    let numeFisCss = path.basename(caleCss);

    let timestamp = Date.now();
    let numeFisCssBackup = numeFisCss.replace(".css", `_${timestamp}.css`);

    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(caleBackup, numeFisCssBackup));
    }

    let rez = sass.compile(caleScss, {"sourceMap": true});
    fs.writeFileSync(caleCss, rez.css);
}

//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
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

// Rută pentru toate produsele
app.get("/produse", function(req, res) {
    let conditieWhere = "";
    const categorie = req.query.categorie;
    
    if (categorie && categorie !== "toate") {
        conditieWhere = ` WHERE categorie='${categorie}'`;
    }
    
    const queryText = `SELECT * FROM produse${conditieWhere} ORDER BY id`;
    
    client.query(queryText, function(err, rezultat) {
        if (err) {
            console.error(err);
            afisareEroare(res, 500);
            return;
        }
        
        client.query("SELECT unnest(enum_range(NULL::categorie_mare)) as categorie", function(errCategorii, rezCategorii) {
            if (errCategorii) {
                console.error(errCategorii);
                afisareEroare(res, 500);
                return;
            }
            
            const categorii = rezCategorii.rows.map(row => row.categorie);
            
            res.render("pagini/produse", {
                produse: rezultat.rows,
                categorii: categorii,
                categorie_selectata: categorie || "toate"
            });
        });
    });
});

// Rută pentru pagina unui produs specific
app.get("/produs/:id", function(req, res) {
    const idProdus = parseInt(req.params.id);
    
    if (isNaN(idProdus)) {
        afisareEroare(res, 400);
        return;
    }
    
    client.query("SELECT * FROM produse WHERE id = $1", [idProdus], function(err, rezultat) {
        if (err) {
            console.error(err);
            afisareEroare(res, 500);
            return;
        }
        
        if (rezultat.rowCount === 0) {
            afisareEroare(res, 404);
            return;
        }
        
        res.render("pagini/produs", {
            produs: rezultat.rows[0]
        });
    });
});

// Middleware pentru a trimite categoriile la toate template-urile
app.use(function(req, res, next) {
    client.query("SELECT unnest(enum_range(NULL::categorie_mare)) as categorie", function(errCategorii, rezCategorii) {
        if (errCategorii) {
            console.error(errCategorii);
            next(); // Continuă chiar dacă există o eroare
            return;
        }
        
        res.locals.categorii = rezCategorii.rows.map(row => row.categorie);
        next();
    });
});

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(function(elem) { 
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
    
    // Return the render call to ensure the function ends here
    return res.render("pagini/eroare", {
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
    });
}

app.use("/resurse", function(req, res, next) {
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

app.get("/favicon.ico", function(req, res) {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon/favicon.ico"));
});


const faviconPath = path.join(faviconDir, "favicon.ico");
if (!fs.existsSync(faviconPath)) {
    // Copiază un favicon din resurse sau generează unul simplu
    fs.copyFileSync(
        path.join(__dirname, "resurse/imagini/favicon/favicon-96x96.png"), 
        faviconPath
    );
    console.log("Favicon generat cu succes");
}

app.get("/index/a", function(req, res) {
    res.render("pagini/index");
});

app.get("/cerere", function(req, res) {
    res.send("<p style='color:blue'>Buna ziua</p>");
});

app.get("/fisier", function(req, res) {
    // Changed sendfile to sendFile (capital F is the correct method name)
    res.sendFile(path.join(__dirname, "package.json"));
});

app.get("/*.ejs", function(req, res) {
    afisareEroare(res, 400);
});


app.get("/*", function(req, res) {
    try {
        res.render("pagini" + req.url, function(err, rezultatRandare) {
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



app.get(["/", "/index", "/home"], (req, res) => {
    const caleGalerie = path.join(__dirname, "resurse", "imagini", "galerie");
    let galleryImages = [];

    try {
        galleryImages = fs.readdirSync(caleGalerie);
    } catch (err) {
        console.error("Eroare la citirea imaginilor din galerie:", err);
    }

    res.render("pagini/index", {
        ip: req.ip,
        galleryImages: galleryImages,
        galeriePath: "/resurse/imagini/galerie",
        path: req.url
    });
});

const faviconDir = path.join(__dirname, "resurse/ico/favicon");
if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true });
    console.log("Folderul pentru favicon a fost creat");
}


app.listen(8080);
console.log("Serverul a pornit");
console.log("Accesati http://localhost:8080/");
