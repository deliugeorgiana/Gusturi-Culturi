const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

console.log("Folderul proiectului: ", __dirname);
console.log("Calea fisierului index.js: ", __filename);
console.log("Folderul curent de lucru: ", process.cwd());

// Change this to ejs instead of js
app.set("view engine", "ejs");

const obGlobal = {
    obErori: null
};

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