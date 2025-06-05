document.addEventListener("DOMContentLoaded", function() {
    // Elemente DOM
    const inpNume = document.getElementById("inp-nume");
    const inpPret = document.getElementById("inp-pret");
    const inpSubcategorie = document.getElementById("inp-subcategorie");
    const radioBucatarii = document.getElementsByName("rad-bucatarie");
    const inpDiscount = document.getElementById("inp-discount");
    const inpDescriere = document.getElementById("inp-descriere");
    const inpVegetarian = document.getElementById("inp-vegetarian");
    const inpLuni = document.getElementById("inp-luni");
    const valPret = document.getElementById("val-pret");
    
    // Butoane
    const btnFiltrare = document.getElementById("btn-filtrare");
    const btnSortareCrescator = document.getElementById("btn-sortare-crescator");
    const btnSortareDescrescator = document.getElementById("btn-sortare-descrescator");
    const btnCalcul = document.getElementById("btn-calcul");
    const btnResetare = document.getElementById("btn-resetare");
    
    // Obține toate produsele
    const produse = document.querySelectorAll(".produs");
    
    // Actualizează valoarea afișată a range-ului
    inpPret.addEventListener("input", function() {
        valPret.textContent = `(${this.value})`;
    });
    
    // Funcționalitate buton filtrare
    btnFiltrare.addEventListener("click", function() {
        // Validare inputuri
        let inputValid = true;
        
        // Validare input text
        if (inpNume.value && !/^[a-zA-Z0-9\sĂăÂâÎîȘșȚț]+$/.test(inpNume.value)) {
            alert("Numele introdus conține caractere invalide!");
            inputValid = false;
        }
        
        // Validare textarea
        if (inpDescriere.value && !/^[a-zA-Z0-9\s.,;:?!ĂăÂâÎîȘșȚț]+$/.test(inpDescriere.value)) {
            alert("Descrierea introdusă conține caractere invalide!");
            inputValid = false;
        }
        
        if (!inputValid) return;
        
        // Filtrare produse
        filtrare();
    });
    
    // Funcționalitate butoane sortare
    btnSortareCrescator.addEventListener("click", function() {
        sortare(true);
    });
    
    btnSortareDescrescator.addEventListener("click", function() {
        sortare(false);
    });
    
    // Funcționalitate buton calcul
    btnCalcul.addEventListener("click", function() {
        calculeazaMedia();
    });
    
    // Funcționalitate buton resetare
    btnResetare.addEventListener("click", function() {
        const confirmare = confirm("Doriți să resetați toate filtrele?");
        if (confirmare) {
            resetare();
        }
    });
    
    // Funcția de filtrare
    function filtrare() {
        const numeCautat = inpNume.value.toLowerCase();
        const pretMaxim = parseInt(inpPret.value);
        const subcategorieCautata = inpSubcategorie.value.toLowerCase();
        
        // Obține valoarea selectată pentru tipul de bucătărie
        let tipBucatarieSelectat = "toate";
        for (const radio of radioBucatarii) {
            if (radio.checked) {
                tipBucatarieSelectat = radio.value;
                break;
            }
        }
        
        const cuvinteCheie = inpDescriere.value.toLowerCase().split(/\s+/).filter(cuvant => cuvant.length > 0);
        const vegetarianSelectat = inpVegetarian.value;
        
        // Obține lunile selectate
        const luniSelectate = Array.from(inpLuni.selectedOptions).map(option => parseInt(option.value));
        
        produse.forEach(produs => {
            const numeProdus = produs.querySelector("h3").textContent.toLowerCase();
            const pretProdus = parseFloat(produs.querySelector(".produs-pret").textContent.match(/\d+(\.\d+)?/)[0]);
            const detaliiProdus = produs.querySelector(".produs-detalii");
            const descriereProdus = produs.querySelector(".produs-descriere").textContent.toLowerCase();
            
            // Extrage tipul bucătăriei
            const tipBucatarie = detaliiProdus.querySelector("li:nth-child(1) em").textContent.toLowerCase();
            
            // Extrage subcategoria din clasa produsului
            const categoriaProdus = produs.classList[1];
            
            // Extrage numărul de ingrediente
            const ingrediente = detaliiProdus.querySelector("li:nth-child(2) em").textContent;
            const numarIngrediente = ingrediente.split(",").length;
            
            // Extrage timpul de preparare
            const timpPreparare = parseInt(detaliiProdus.querySelector("li:nth-child(3) em").textContent);
            
            // Extrage data și luna
            const dataText = detaliiProdus.querySelector("li:nth-child(4) time").getAttribute("datetime");
            const lunaProdus = new Date(dataText).getMonth();
            
            // Extrage dacă este vegetarian
            const esteVegetarian = detaliiProdus.querySelector("li:nth-child(5) em").textContent === "Da";
            
            // Aplică filtrele
            let afiseaza = true;
            
            // Filtrare după nume
            if (numeCautat && !numeProdus.includes(numeCautat)) {
                afiseaza = false;
            }
            
            // Filtrare după preț
            if (pretProdus > pretMaxim) {
                afiseaza = false;
            }
            
            // Filtrare după subcategorie
            if (subcategorieCautata && !categoriaProdus.includes(subcategorieCautata)) {
                afiseaza = false;
            }
            
            // Filtrare după tip bucătărie
            if (tipBucatarieSelectat !== "toate" && tipBucatarie !== tipBucatarieSelectat) {
                afiseaza = false;
            }
            
            // Filtrare după discount (produse cu timp de preparare sub 30 min)
            if (inpDiscount.checked && timpPreparare >= 30) {
                afiseaza = false;
            }
            
            // Filtrare după cuvinte cheie în descriere
            if (cuvinteCheie.length > 0) {
                const toateCuvinteleGasite = cuvinteCheie.every(cuvant => 
                    descriereProdus.includes(cuvant));
                
                if (!toateCuvinteleGasite) {
                    afiseaza = false;
                }
            }
            
            // Filtrare după vegetarian
            if (vegetarianSelectat !== "oricare") {
                if (vegetarianSelectat === "true" && !esteVegetarian) {
                    afiseaza = false;
                }
                if (vegetarianSelectat === "false" && esteVegetarian) {
                    afiseaza = false;
                }
            }
            
            // Filtrare după lunile selectate
            if (!luniSelectate.includes(lunaProdus)) {
                afiseaza = false;
            }
            
            // Afișează sau ascunde produsul
            produs.style.display = afiseaza ? "block" : "none";
        });
    }
    
    // Funcția de sortare
    function sortare(crescator) {
        const container = document.getElementById("produse-container");
        const produseArray = Array.from(produse);
        
        produseArray.sort((a, b) => {
            // Sortare după preț
            const pretA = parseFloat(a.querySelector(".produs-pret").textContent.match(/\d+(\.\d+)?/)[0]);
            const pretB = parseFloat(b.querySelector(".produs-pret").textContent.match(/\d+(\.\d+)?/)[0]);
            
            if (pretA !== pretB) {
                return crescator ? pretA - pretB : pretB - pretA;
            }
            
            // Sortare secundară după numărul de ingrediente
            const ingredienteA = a.querySelector(".produs-detalii li:nth-child(2) em").textContent.split(",").length;
            const ingredienteB = b.querySelector(".produs-detalii li:nth-child(2) em").textContent.split(",").length;
            
            return crescator ? ingredienteA - ingredienteB : ingredienteB - ingredienteA;
        });
        
        // Reordonare în DOM
        produseArray.forEach(produs => {
            container.appendChild(produs);
        });
    }
    
    // Funcția de calcul medie prețuri
    function calculeazaMedia() {
        const produseVizibile = Array.from(produse).filter(produs => 
            produs.style.display !== "none");
        
        if (produseVizibile.length === 0) {
            alert("Nu există produse care să corespundă filtrelor curente!");
            return;
        }
        
        let sumaPret = 0;
        produseVizibile.forEach(produs => {
            const pret = parseFloat(produs.querySelector(".produs-pret").textContent.match(/\d+(\.\d+)?/)[0]);
            sumaPret += pret;
        });
        
        const mediaPret = sumaPret / produseVizibile.length;
        
        // Afișează rezultatul într-un div cu poziție fixă
        const divRezultat = document.createElement("div");
        divRezultat.className = "rezultat-calcul";
        divRezultat.innerHTML = `<p>Media prețurilor: <strong>${mediaPret.toFixed(2)} lei</strong></p>`;
        document.body.appendChild(divRezultat);
        
        // Șterge div-ul după 2 secunde
        setTimeout(() => {
            divRezultat.remove();
        }, 2000);
    }
    
    // Funcția de resetare
    function resetare() {
        // Resetare inputuri
        inpNume.value = "";
        inpPret.value = inpPret.max;
        valPret.textContent = `(${inpPret.max})`;
        inpSubcategorie.value = "";
        radioBucatarii[0].checked = true; // Selectează opțiunea "Toate"
        inpDiscount.checked = false;
        inpDescriere.value = "";
        inpVegetarian.value = "oricare";
        
        // Selectează toate lunile
        for (let i = 0; i < inpLuni.options.length; i++) {
            inpLuni.options[i].selected = true;
        }
        
        // Reafișează toate produsele
        produse.forEach(produs => {
            produs.style.display = "block";
        });
        
        // Resetare sortare (reîncarcă pagina)
        location.reload();
    }
});

