const fs = require('fs');
const path = require('path');

// Configurare
const ofertePath = path.join(__dirname, '..', 'resurse', 'json', 'oferte.json');
const INTERVAL_OFERTA = 2 * 60 * 1000; // 2 minute pentru testare (T)
const STERGERE_OFERTE_VECHI = 15 * 60 * 1000; // 15 minute (T2)
const REDUCERI_DISPONIBILE = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

// Funcție pentru încărcarea ofertelor din JSON
function incarcaOferte() {
    try {
        if (!fs.existsSync(ofertePath)) {
            // Crează fișierul și folderul dacă nu există
            const dirPath = path.dirname(ofertePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            fs.writeFileSync(ofertePath, JSON.stringify({ oferte: [] }, null, 2));
            return { oferte: [] };
        }
        
        const continut = fs.readFileSync(ofertePath, 'utf8');
        return JSON.parse(continut);
    } catch (err) {
        console.error('Eroare la încărcarea ofertelor:', err);
        return { oferte: [] };
    }
}

// Funcție pentru salvarea ofertelor în JSON
function salveazaOferte(oferte) {
    try {
        fs.writeFileSync(ofertePath, JSON.stringify(oferte, null, 2));
    } catch (err) {
        console.error('Eroare la salvarea ofertelor:', err);
    }
}

// Funcție pentru crearea unei noi oferte
async function genereazaOfertaNoua(client) {
    try {
        // Obține toate bucătăriile din baza de date
        const rezultatCategorii = await client.query(
            "SELECT DISTINCT bucatarie FROM feluri_mancare"
        );
        const categorii = rezultatCategorii.rows.map(row => row.bucatarie);
        
        if (categorii.length === 0) {
            console.error('Nu s-au găsit bucătării în baza de date!');
            return;
        }
        
        // Încarcă ofertele existente
        const jsonOferte = incarcaOferte();
        const ofertaAnterioara = jsonOferte.oferte.length > 0 ? jsonOferte.oferte[0] : null;
        
        // Selectează o categorie aleatoare diferită de cea anterioară
        let categorie;
        do {
            const indexAleator = Math.floor(Math.random() * categorii.length);
            categorie = categorii[indexAleator];
        } while (ofertaAnterioara && categorie === ofertaAnterioara.categorie && categorii.length > 1);
        
        // Selectează o reducere aleatorie
        const indexReducere = Math.floor(Math.random() * REDUCERI_DISPONIBILE.length);
        const reducere = REDUCERI_DISPONIBILE[indexReducere];
        
        // Setează datele pentru oferta nouă
        const acum = new Date();
        const dataFinalizare = new Date(acum.getTime() + INTERVAL_OFERTA);
        
        // Creează noua ofertă
        const ofertaNoua = {
            "categorie": categorie,
            "data-incepere": acum.toISOString(),
            "data-finalizare": dataFinalizare.toISOString(),
            "reducere": reducere
        };
        
        // Adaugă noua ofertă la începutul vectorului
        jsonOferte.oferte.unshift(ofertaNoua);
        
        // Șterge ofertele vechi expirate (mai vechi decât T2)
        const limitaTimp = new Date(acum.getTime() - STERGERE_OFERTE_VECHI);
        jsonOferte.oferte = jsonOferte.oferte.filter(oferta => {
            const dataExpirare = new Date(oferta["data-finalizare"]);
            return dataExpirare > limitaTimp;
        });
        
        // Salvează ofertele actualizate
        salveazaOferte(jsonOferte);
        console.log(`Ofertă nouă generată: ${categorie} cu reducere de ${reducere}%`);
        
        return ofertaNoua;
    } catch (err) {
        console.error('Eroare la generarea ofertei:', err);
    }
}

// Funcție pentru a obține oferta curentă
function getOfertaCurenta() {
    const jsonOferte = incarcaOferte();
    if (jsonOferte.oferte.length === 0) {
        return null;
    }
    
    const ofertaCurenta = jsonOferte.oferte[0];
    const acum = new Date();
    const dataFinalizare = new Date(ofertaCurenta["data-finalizare"]);
    
    // Verifică dacă oferta este încă validă
    if (dataFinalizare > acum) {
        return ofertaCurenta;
    }
    
    return null;
}

// Pornește sistemul de generare oferte
async function initializeazaSistemOferte(client) {
    // Generează o ofertă inițială dacă nu există niciuna
    const ofertaCurenta = getOfertaCurenta();
    if (!ofertaCurenta) {
        await genereazaOfertaNoua(client);
    }
    
    // Verifică perioadic dacă oferta curentă a expirat
    setInterval(async () => {
        const ofertaCurenta = getOfertaCurenta();
        if (!ofertaCurenta) {
            await genereazaOfertaNoua(client);
        }
    }, 30 * 1000); // Verifică la fiecare 30 secunde
}


// Funcția pentru formatarea categoriilor
function formatareDenumireCategorie(categorie) {
    if (!categorie) return "Necategorizat";
    
    const traduceri = {
        "romaneasca": "Bucătărie românească",
        "ruseasca": "Bucătărie rusească",
        "italiana": "Bucătărie italiană",
        "franceza": "Bucătărie franceză",
        "chinezeasca": "Bucătărie chinezească",
        "mediteraneana": "Bucătărie mediteraneană",
        "americana": "Bucătărie americană"
    };
    
    return traduceri[categorie] || categorie.charAt(0).toUpperCase() + categorie.slice(1);
}


module.exports = {
    initializeazaSistemOferte,
    getOfertaCurenta,
    genereazaOfertaNoua
};