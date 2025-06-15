// Funcționalitate pentru compararea produselor
document.addEventListener('DOMContentLoaded', function() {
    // Verifică dacă produsele de comparare există în localStorage
    const comparareProduse = JSON.parse(localStorage.getItem('comparareProduse') || '[]');
    const dataExpirare = localStorage.getItem('comparareExpirare');
    const acumTimestamp = Date.now();
    
    // Verifică dacă suntem pe o pagină de eroare și resetează selecția
    if (window.location.pathname.includes('/404') || 
        document.title.includes('404') || 
        document.body.textContent.includes('404')) {
        localStorage.removeItem('comparareProduse');
        localStorage.removeItem('comparareExpirare');
        console.log("Selecția de comparare a fost resetată din cauza unei erori 404");
        return; // Nu mai execută restul codului pe pagina de eroare
    }
    
    // Verifică dacă au trecut 24 de ore de la ultima acțiune
    if (dataExpirare && acumTimestamp > parseInt(dataExpirare)) {
        // Șterge datele expirate
        localStorage.removeItem('comparareProduse');
        localStorage.removeItem('comparareExpirare');
    } else if (comparareProduse.length > 0) {
        // Afișează containerul de comparare
        afiseazaContainerComparare();
        
        // Adaugă produsele salvate în container
        comparareProduse.forEach(produs => {
            adaugaProdusInContainer(produs.id, produs.nume);
        });
        
        // Actualizează starea butoanelor
        actualizeazaButoane();
    }
    
    // Adaugă event listeners pentru butoanele de comparare
    document.querySelectorAll('.btn-compara').forEach(buton => {
        buton.addEventListener('click', function() {
            const idProdus = this.dataset.id;
            const numeProdus = this.dataset.nume;
            
            // Adaugă produsul în lista de comparare
            adaugaProdusLaComparare(idProdus, numeProdus);
            
            // Actualizează timestamp-ul expirare
            localStorage.setItem('comparareExpirare', Date.now() + 24 * 60 * 60 * 1000); // 24 de ore
        });
    });
    
    // Event listener pentru butonul de închidere/resetare
    const btnClose = document.getElementById('btn-close-comparare');
    if (btnClose) {
        btnClose.addEventListener('click', function() {
            resetareCompletaComparare();
        });
    }
    
    // Event listener pentru butonul de afișare comparație
    const btnAfiseaza = document.getElementById('btn-afiseaza-comparare');
    if (btnAfiseaza) {
        btnAfiseaza.addEventListener('click', function() {
            const produse = JSON.parse(localStorage.getItem('comparareProduse') || '[]');
            if (produse.length === 2) {
                // Deschide comparația în aceeași fereastră (mai bun UX)
                const url = `/comparare/${produse[0].id}/${produse[1].id}`;
                window.location.href = url;
            }
        });
    }
    
    // Adaugă un buton de resetare separat dacă există în pagină
    const btnReset = document.getElementById('btn-reset-comparare');
    if (btnReset) {
        btnReset.addEventListener('click', function() {
            resetareCompletaComparare();
            // Afișează notificare
            alert('Selecția pentru comparare a fost resetată!');
        });
        
        // Actualizează starea butonului de resetare
        btnReset.disabled = comparareProduse.length === 0;
        if (comparareProduse.length > 0) {
            btnReset.textContent = `Resetează compararea (${comparareProduse.length}/2)`;
        }
    }
});

// Funcția pentru resetarea completă a comparării
function resetareCompletaComparare() {
    // Șterge toate produsele din localStorage
    localStorage.removeItem('comparareProduse');
    localStorage.removeItem('comparareExpirare');
    
    // Ascunde containerul dacă există
    const container = document.getElementById('container-comparare');
    if (container) {
        container.classList.add('hidden');
    }
    
    // Resetează butoanele de comparare
    document.querySelectorAll('.btn-compara').forEach(btn => {
        btn.disabled = false;
        btn.title = '';
    });
    
    // Resetează butonul de afișare
    const btnAfiseaza = document.getElementById('btn-afiseaza-comparare');
    if (btnAfiseaza) {
        btnAfiseaza.disabled = true;
    }
    
    // Resetează butonul de reset dacă există
    const btnReset = document.getElementById('btn-reset-comparare');
    if (btnReset) {
        btnReset.disabled = true;
        btnReset.textContent = 'Resetează compararea';
    }
    
    // Golește containerul de produse
    const produseContainer = document.getElementById('produse-comparare');
    if (produseContainer) {
        produseContainer.innerHTML = '';
    }
}

// Funcția pentru adăugarea unui produs la comparare
function adaugaProdusLaComparare(id, nume) {
    const comparareProduse = JSON.parse(localStorage.getItem('comparareProduse') || '[]');
    
    // Verifică dacă produsul este deja în lista de comparare
    if (!comparareProduse.some(p => p.id === id)) {
        // Verifică dacă avem deja 2 produse în comparare
        if (comparareProduse.length < 2) {
            comparareProduse.push({id, nume});
            localStorage.setItem('comparareProduse', JSON.stringify(comparareProduse));
            
            // Afișează containerul de comparare
            afiseazaContainerComparare();
            
            // Adaugă produsul în container
            adaugaProdusInContainer(id, nume);
            
            // Actualizează starea butoanelor
            actualizeazaButoane();
        } else {
            alert('Poți compara maxim 2 produse. Resetează selecția sau elimină un produs din comparare.');
        }
    } else {
        alert('Acest produs este deja adăugat în lista de comparare.');
    }
    
    // Actualizează butonul de reset dacă există
    const btnReset = document.getElementById('btn-reset-comparare');
    if (btnReset) {
        btnReset.disabled = comparareProduse.length === 0;
        btnReset.textContent = `Resetează compararea (${comparareProduse.length}/2)`;
    }
}

// Funcția pentru afișarea containerului de comparare
function afiseazaContainerComparare() {
    const container = document.getElementById('container-comparare');
    if (container) {
        container.classList.remove('hidden');
    }
}

// Funcția pentru adăugarea unui produs în containerul de comparare
function adaugaProdusInContainer(id, nume) {
    const produseContainer = document.getElementById('produse-comparare');
    if (produseContainer) {
        // Verifică dacă produsul este deja adăugat
        if (!document.querySelector(`.produs-comparare[data-id="${id}"]`)) {
            const produsElement = document.createElement('div');
            produsElement.className = 'produs-comparare';
            produsElement.dataset.id = id;
            produsElement.innerHTML = `
                <span>${nume}</span>
                <button class="btn-sterge-produs" data-id="${id}"><i class="bi bi-trash"></i></button>
            `;
            produseContainer.appendChild(produsElement);
            
            // Adaugă event listener pentru butonul de ștergere
            produsElement.querySelector('.btn-sterge-produs').addEventListener('click', function() {
                stergeProdus(id);
            });
        }
    }
}

// Funcția pentru ștergerea unui produs din comparare
function stergeProdus(id) {
    let comparareProduse = JSON.parse(localStorage.getItem('comparareProduse') || '[]');
    comparareProduse = comparareProduse.filter(p => p.id !== id);
    localStorage.setItem('comparareProduse', JSON.stringify(comparareProduse));
    
    // Șterge produsul din container
    const produsElement = document.querySelector(`.produs-comparare[data-id="${id}"]`);
    if (produsElement) {
        produsElement.remove();
    }
    
    // Dacă nu mai sunt produse, ascunde containerul
    if (comparareProduse.length === 0) {
        const container = document.getElementById('container-comparare');
        if (container) {
            container.classList.add('hidden');
        }
    }
    
    // Actualizează starea butoanelor
    actualizeazaButoane();
    
    // Actualizează butonul de reset dacă există
    const btnReset = document.getElementById('btn-reset-comparare');
    if (btnReset) {
        btnReset.disabled = comparareProduse.length === 0;
        if (comparareProduse.length > 0) {
            btnReset.textContent = `Resetează compararea (${comparareProduse.length}/2)`;
        } else {
            btnReset.textContent = 'Resetează compararea';
        }
    }
}

// Funcția pentru actualizarea stării butoanelor
function actualizeazaButoane() {
    const comparareProduse = JSON.parse(localStorage.getItem('comparareProduse') || '[]');
    
    // Actualizează butonul de afișare
    const btnAfiseaza = document.getElementById('btn-afiseaza-comparare');
    if (btnAfiseaza) {
        btnAfiseaza.disabled = comparareProduse.length !== 2;
        
        // Arată/ascunde butonul în funcție de numărul de produse
        if (comparareProduse.length === 2) {
            btnAfiseaza.style.display = 'inline-block';
        } else {
            btnAfiseaza.style.display = 'none';
        }
    }
    
    // Actualizează butoanele de comparare
    document.querySelectorAll('.btn-compara').forEach(btn => {
        const idProdus = btn.dataset.id;
        const produsSelectat = comparareProduse.some(p => p.id === idProdus);
        
        if (produsSelectat) {
            // Produsul este deja selectat
            btn.disabled = false;
            btn.classList.add('active');
            btn.title = 'Produs selectat pentru comparare';
        } else if (comparareProduse.length >= 2) {
            // Limita de 2 produse este atinsă
            btn.disabled = true;
            btn.classList.remove('active');
            btn.title = 'Poți compara maxim 2 produse';
        } else {
            // Poți selecta acest produs
            btn.disabled = false;
            btn.classList.remove('active');
            btn.title = 'Adaugă pentru comparare';
        }
    });
}