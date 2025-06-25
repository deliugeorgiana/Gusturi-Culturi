document.addEventListener('DOMContentLoaded', function() {
    // Selectoare pentru elementele DOM
    const btnOrar = document.getElementById('btn-orar');
    const containerOrar = document.getElementById('container-orar');
    const btnInchideOrar = document.querySelector('.orar-close');
    const statusOrar = document.getElementById('status-orar');
    let timeoutID;

    // Verifică dacă elementele necesare există
    if (!btnOrar || !containerOrar) {
        console.error('Nu s-au găsit elementele necesare pentru orar.');
        return;
    }

    // Verifica daca este deschis în momentul actual
    function verificaStatusDeschis() {
        const acum = new Date();
        const zi = acum.getDay(); // 0 = Duminică, 1 = Luni, etc.
        const ora = acum.getHours();
        const minute = acum.getMinutes();
        const timpCurent = ora + minute / 60; // Timp în format zecimal 

        let deschis = false;
        let mesaj = "";

        switch (zi) {
            case 0: // Duminica
                deschis = false;
                mesaj = "Suntem ÎNCHIȘI astăzi. Ne revedem luni începând cu ora 10:00.";
                break;
            case 1: // Luni
            case 2: // Marti
            case 3: // Miercuri
            case 4: // Joi
                if (timpCurent >= 10 && timpCurent < 22) {
                    deschis = true;
                    mesaj = "Suntem DESCHIȘI! Vă așteptăm până la ora 22:00.";
                } else {
                    deschis = false;
                    mesaj = timpCurent < 10 
                        ? "Deschidem la ora 10:00. Vă așteptăm!" 
                        : "Suntem ÎNCHIȘI. Reveniți mâine începând cu ora 10:00.";
                }
                break;
            case 5: // Vineri
                if (timpCurent >= 10 && timpCurent < 23) {
                    deschis = true;
                    mesaj = "Suntem DESCHIȘI! Vă așteptăm până la ora 23:00.";
                } else {
                    deschis = false;
                    mesaj = timpCurent < 10 
                        ? "Deschidem la ora 10:00. Vă așteptăm!" 
                        : "Suntem ÎNCHIȘI. Reveniți mâine începând cu ora 11:00.";
                }
                break;
            case 6: // Sambata
                if (timpCurent >= 11 && timpCurent < 23) {
                    deschis = true;
                    mesaj = "Suntem DESCHIȘI! Vă așteptăm până la ora 23:00.";
                } else {
                    deschis = false;
                    mesaj = timpCurent < 11 
                        ? "Deschidem la ora 11:00. Vă așteptăm!" 
                        : "Suntem ÎNCHIȘI duminica.";
                }
                break;
        }

        // Actualizează UI
        if (statusOrar) {
            statusOrar.textContent = mesaj;
            statusOrar.className = `status-orar ${deschis ? 'status-deschis' : 'status-inchis'}`;
        }
        
        return deschis;
    }

    // Functie pentru evideniterea zilei curente în tabel
    function evidentiazaZiuaCurenta() {
        const ziuaCurenta = new Date().getDay();
        console.log("Ziua curentă (JavaScript):", ziuaCurenta);
        
        // Reseteaza toate clasele zi-curenta
        document.querySelectorAll('.tabel-orar tr').forEach(tr => {
            tr.classList.remove('zi-curenta');
        });
        
        // Mapeaza indexul zilei la clasa corespunzătoare
        const zileClase = [
            'zi-duminica', 'zi-luni', 'zi-marti', 'zi-miercuri', 
            'zi-joi', 'zi-vineri', 'zi-sambata'
        ];
        
        // Adaugă clasa zi-curenta la ziua potrivită
        if (ziuaCurenta >= 0 && ziuaCurenta < zileClase.length) {
            const selector = `.${zileClase[ziuaCurenta]}`;
            const randZiCurenta = document.querySelector(selector);
            if (randZiCurenta) {
                randZiCurenta.classList.add('zi-curenta');
                console.log("Ziua evidențiată:", zileClase[ziuaCurenta]);
            } else {
                console.error("Nu s-a găsit rândul pentru ziua curentă:", selector);
            }
        }
    }

    // Deschide containerul orarului
    function deschideOrar() {
        console.log("Deschidere orar");
        
        // Creează un overlay pentru a da un efect de "modal"
        const overlay = document.createElement('div');
        overlay.className = 'orar-overlay';
        document.body.appendChild(overlay);
        
        // Arată overlay-ul și containerul
        overlay.style.display = 'block';
        containerOrar.style.display = 'block';
        
        // Verifică status deschis/închis și evidențiază ziua curentă
        verificaStatusDeschis();
        evidentiazaZiuaCurenta();
        
        // Setează timeout pentru închidere automată
        timeoutID = setTimeout(() => {
            inchideOrar();
        }, 10000); // Se închide după 10 secunde
        
        // Adaugă event listener pentru click pe overlay
        overlay.addEventListener('click', inchideOrar);
    }

    // Închide containerul orarului
    function inchideOrar() {
        console.log("Închidere orar");
        const overlay = document.querySelector('.orar-overlay');
        
        // Elimină overlay-ul și ascunde containerul
        if (overlay) {
            containerOrar.style.animation = 'fadeOut 0.3s';
            overlay.style.animation = 'fadeOut 0.3s';
            
            setTimeout(() => {
                containerOrar.style.display = 'none';
                containerOrar.style.animation = '';
                overlay.remove();
            }, 300);
        } else {
            // Dacă nu există overlay, ascunde doar containerul
            containerOrar.style.display = 'none';
        }
        
        // Anulează timeout-ul dacă există
        if (timeoutID) {
            clearTimeout(timeoutID);
        }
    }

    // Adaugă event listeners
    if (btnOrar) {
        btnOrar.addEventListener('click', function(e) {
            e.preventDefault();
            deschideOrar();
        });
    }

    if (btnInchideOrar) {
        btnInchideOrar.addEventListener('click', inchideOrar);
    }

    // Închide la click în afara containerului (backup pentru overlay)
    document.addEventListener('click', function(e) {
        if (containerOrar.style.display === 'block' && 
            !containerOrar.contains(e.target) && 
            e.target !== btnOrar && 
            !e.target.closest('#btn-orar')) {
            inchideOrar();
        }
    });

    // Adaugă keydown handler pentru Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && containerOrar.style.display === 'block') {
            inchideOrar();
        }
    });
    
    // Inițializează containerul ca fiind ascuns
    if (containerOrar) {
        containerOrar.style.display = 'none';
    }
});