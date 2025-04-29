const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp= require("sharp");
const router= express.Router();

const app = express();

console.log("Folderul proiectului: ", __dirname);
console.log("Calea fisierului index.js: ", __filename);
console.log("Folderul curent de lucru: ", process.cwd());


// Change this to ejs instead of js
app.set("view engine", "ejs");

const obGlobal = {
    obErori: null
};

function getDayOfWeekRo(date) {
    const days = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'];
    return days[date.getDay()];
}

function isDayInIntervals(dayOfWeek, intervals) {
    for (const interval of intervals) {
        const days = ['luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata', 'duminica'];
        const startIdx = days.indexOf(interval[0]);
        const endIdx = days.indexOf(interval[1]);
        
        if (startIdx === -1 || endIdx === -1) continue;
        
        // Check if the day is in the interval (inclusive)
        const dayIdx = days.indexOf(dayOfWeek);
        if (startIdx <= endIdx) {
            // Normal interval like ["luni", "miercuri"]
            if (dayIdx >= startIdx && dayIdx <= endIdx) return true;
        } else {
            // Interval that wraps around like ["sambata", "luni"]
            if (dayIdx >= startIdx || dayIdx <= endIdx) return true;
        }
    }
    return false;
}

function truncateToEvenNumber(images) {
    if (images.length % 2 === 0) return images;
    return images.slice(0, images.length - 1);
}

async function createResizedImages(imageInfo, galerieFolder) {
    const sourceImage = path.join(galerieFolder, imageInfo.fisier_imagine);
    const imageName = path.parse(imageInfo.fisier_imagine).name;
    const imageExtension = path.parse(imageInfo.fisier_imagine).ext;
    
    // Create medium and small versions of the image
    const mediumImagePath = path.join(galerieFolder, "medium", `${imageName}${imageExtension}`);
    const smallImagePath = path.join(galerieFolder, "small", `${imageName}${imageExtension}`);
    
    // Create directories if they don't exist
    try {
        if (!fs.existsSync(path.join(galerieFolder, "medium"))) {
            fs.mkdirSync(path.join(galerieFolder, "medium"), { recursive: true });
        }
        
        if (!fs.existsSync(path.join(galerieFolder, "small"))) {
            fs.mkdirSync(path.join(galerieFolder, "small"), { recursive: true });
        }
    } catch (err) {
        console.error("Could not create directories for resized images:", err);
    }
    
     // Create medium version (300px wide)
     if (!fs.existsSync(mediumImagePath)) {
        try {
            await sharp(sourceImage)
                .resize(300) // Resize to 300px width
                .toFile(mediumImagePath);
        } catch (err) {
            console.error(`Error creating medium image for ${imageInfo.fisier_imagine}:`, err);
        }
    }

    if (!fs.existsSync(smallImagePath)) {
        try {
            await sharp(sourceImage)
                .resize(150) // Resize to 150px width
                .toFile(smallImagePath);
        } catch (err) {
            console.error(`Error creating small image for ${imageInfo.fisier_imagine}:`, err);
        }
    }
    return {
        original: imageInfo.fisier_imagine,
        medium: `medium/${imageName}${imageExtension}`,
        small: `small/${imageName}${imageExtension}`
    };
}

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

app.get(["/", "/index", "/home"], function(req, res) {
    res.render("pagini/index", {ip: req.ip});
});

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


app.listen(8080);
console.log("Serverul a pornit");
console.log("Accesati http://localhost:8080/");

