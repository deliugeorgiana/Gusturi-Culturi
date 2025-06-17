document.addEventListener('DOMContentLoaded', function() {
    // Obține ID-urile produselor ascunse din sessionStorage
    const produseAscunseSession = JSON.parse(sessionStorage.getItem('produseAscunse') || '[]');
    
    // Aplică starea salvată la încărcarea paginii
    produseAscunseSession.forEach(id => {
        const produs = document.getElementById(`produs_${id}`);
        if (produs) {
            produs.classList.add('hidden-session');
            const buton = produs.querySelector('.btn-ascunde-sesiune');
            if (buton) buton.classList.add('active');
        }
    });
    
    // Array cu produsele fixate (pinned)
    let produsePinnedList = [];
    
    // Array cu produsele ascunse temporar
    let produseAscunseTemp = [];
    
    // Funcție pentru actualizarea stării butoanelor de filtrare
    function actualizeazaFiltrare() {
        const produse = document.querySelectorAll('.produs');
        
        produse.forEach(produs => {
            // Verifică dacă produsul ar trebui să fie vizibil conform filtrelor curente
            const arTrebuiVizibil = !produs.classList.contains('filtru-hidden');
            
            // Verifică dacă produsul este pinned
            const estePinned = produsePinnedList.includes(produs.id);
            
            // Verifică dacă produsul este ascuns temporar
            const esteAscunsTemp = produseAscunseTemp.includes(produs.id);
            
            // Verifică dacă produsul este ascuns pentru sesiune
            const esteAscunsSession = produs.classList.contains('hidden-session');
            
            // Aplică logica de vizibilitate
            if (estePinned) {
                // Produsele pinned sunt întotdeauna vizibile
                produs.style.display = '';
            } else if (esteAscunsTemp || esteAscunsSession) {
                // Produsele ascunse sunt întotdeauna ascunse
                produs.style.display = 'none';
            } else {
                // Altfel, respectă filtrarea normală
                produs.style.display = arTrebuiVizibil ? '' : 'none';
            }
        });
    }
    
    // Funcție de fixare/desprindere produs (pin/unpin)
    function togglePin(produs, buton) {
        const produsId = produs.id;
        
        if (produsePinnedList.includes(produsId)) {
            // Desprinde produsul
            produsePinnedList = produsePinnedList.filter(id => id !== produsId);
            produs.classList.remove('pinned');
            buton.classList.remove('active');
            buton.title = 'Păstrează produsul vizibil chiar dacă nu corespunde filtrelor';
        } else {
            // Fixează produsul
            produsePinnedList.push(produsId);
            produs.classList.add('pinned');
            buton.classList.add('active');
            buton.title = 'Permite produsului să fie filtrat normal';
            
            // Dacă produsul era ascuns temporar, anulează ascunderea
            if (produseAscunseTemp.includes(produsId)) {
                produseAscunseTemp = produseAscunseTemp.filter(id => id !== produsId);
                const butonAscundeTemp = produs.querySelector('.btn-ascunde-temp');
                if (butonAscundeTemp) butonAscundeTemp.classList.remove('active');
            }
        }
        
        actualizeazaFiltrare();
    }
    
    // Funcție pentru ascunderea temporară a unui produs
    function ascundeTemporar(produs, buton) {
        const produsId = produs.id;
        
        // Dacă produsul este pinned, anulează pin-ul întâi
        if (produsePinnedList.includes(produsId)) {
            produsePinnedList = produsePinnedList.filter(id => id !== produsId);
            produs.classList.remove('pinned');
            const butonPin = produs.querySelector('.btn-pin');
            if (butonPin) butonPin.classList.remove('active');
        }
        
        // Ascunde temporar produsul
        produseAscunseTemp.push(produsId);
        produs.classList.add('hidden-temp');
        produs.style.display = 'none';
    }
    
    // Funcție pentru ascunderea pe sesiune a unui produs
    function ascundeSession(produs, buton) {
        const produsId = produs.id;
        const idNumeric = produsId.replace('produs_', '');
        
        // Dacă produsul este pinned, anulează pin-ul întâi
        if (produsePinnedList.includes(produsId)) {
            produsePinnedList = produsePinnedList.filter(id => id !== produsId);
            produs.classList.remove('pinned');
            const butonPin = produs.querySelector('.btn-pin');
            if (butonPin) butonPin.classList.remove('active');
        }
        
        // Ascunde produsul pentru sesiune
        produs.classList.add('hidden-session');
        produs.style.display = 'none';
        buton.classList.add('active');
        
        // Salvează în sessionStorage
        let produseAscunse = JSON.parse(sessionStorage.getItem('produseAscunse') || '[]');
        if (!produseAscunse.includes(idNumeric)) {
            produseAscunse.push(idNumeric);
            sessionStorage.setItem('produseAscunse', JSON.stringify(produseAscunse));
        }
    }
    
    // Adaugă event listeners pentru butoane
    document.querySelectorAll('.produs').forEach(produs => {
        // Butonul de fixare (pin)
        const butonPin = produs.querySelector('.btn-pin');
        if (butonPin) {
            butonPin.addEventListener('click', function(e) {
                e.stopPropagation(); // Previne declanșarea evenimentului click pe produs
                togglePin(produs, butonPin);
            });
        }
        
        // Butonul de ascundere temporară
        const butonAscundeTemp = produs.querySelector('.btn-ascunde-temp');
        if (butonAscundeTemp) {
            butonAscundeTemp.addEventListener('click', function(e) {
                e.stopPropagation();
                ascundeTemporar(produs, butonAscundeTemp);
            });
        }
        
        // Butonul de ascundere pe sesiune
        const butonAscundeSession = produs.querySelector('.btn-ascunde-sesiune');
        if (butonAscundeSession) {
            butonAscundeSession.addEventListener('click', function(e) {
                e.stopPropagation();
                ascundeSession(produs, butonAscundeSession);
            });
        }
    });
    
    // Interceptează evenimentele de filtrare și sortare
    const formFiltrare = document.getElementById('form-filtrare');
    if (formFiltrare) {
        formFiltrare.addEventListener('submit', function() {
            // La schimbarea filtrelor, resetează lista de produse ascunse temporar
            produseAscunseTemp = [];
            
            // Anulează și clasa pentru produsele ascunse temporar
            document.querySelectorAll('.hidden-temp').forEach(elem => {
                elem.classList.remove('hidden-temp');
            });
            
            // Timpul pentru actualizarea filtrării după procesarea formularului
            setTimeout(actualizeazaFiltrare, 100);
        });
    }
    
    // Resetare filtre
    const butonResetare = document.querySelector('button[type="reset"]');
    if (butonResetare) {
        butonResetare.addEventListener('click', function() {
            // La resetare, resetează lista de produse ascunse temporar
            produseAscunseTemp = [];
            
            // Anulează și clasa pentru produsele ascunse temporar
            document.querySelectorAll('.hidden-temp').forEach(elem => {
                elem.classList.remove('hidden-temp');
            });
            
            // Timpul pentru actualizarea filtrării după procesarea resetării
            setTimeout(actualizeazaFiltrare, 100);
        });
    }
});