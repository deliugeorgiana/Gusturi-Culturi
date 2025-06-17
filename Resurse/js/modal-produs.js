
// Gestionează funcționalitatea de modal box pentru produse
document.addEventListener('DOMContentLoaded', function() {
    // Selectează toate containerele de produse
    const containereProduse = document.querySelectorAll('.produs');
    const modal = document.getElementById('modal-produs');
    const modalInchide = document.querySelector('.modal-inchide');
    
    // Adaugă event listener pentru fiecare container de produs
containereProduse.forEach(container => {
    container.addEventListener('click', function(event) {
        // Verifică dacă s-a făcut click pe butonul "Vezi detalii" sau în apropierea lui
        const targetElement = event.target;
        const veziDetaliiLink = targetElement.closest('a.vezi-detalii') || 
                               (targetElement.tagName === 'A' && targetElement.classList.contains('vezi-detalii')) ||
                               (targetElement.textContent.trim() === 'Vezi detalii');
        
        // Permite navigarea normală pentru butonul "Vezi detalii"
        if (veziDetaliiLink) {
            return; // Permite comportamentul normal al link-ului
        }
        
        // Verifică alte butoane sau link-uri care ar trebui să funcționeze normal
        if (event.target.tagName === 'A' || event.target.closest('a')) {
            if (event.target.classList.contains('btn') || 
                event.target.closest('a').classList.contains('btn')) {
                return;
            }
            event.preventDefault();
        }
        
      
            // Obține datele produsului din atribute data-*
            const id = this.dataset.id;
            const nume = this.dataset.nume;
            const descriere = this.dataset.descriere;
            const imagine = this.dataset.imagine;
            const pret = parseFloat(this.dataset.pret);
            const ingrediente = this.dataset.ingrediente ? JSON.parse(this.dataset.ingrediente) : [];
            const bucatarie = this.dataset.bucatarie;
            const calorii = this.dataset.calorii;
            const gramaj = this.dataset.gramaj;
            const categorie = this.dataset.categorie;
            
            // Verifică dacă există o ofertă pentru acest produs
            const ofertaCategorie = window.ofertaCurenta ? window.ofertaCurenta.categorie : null;
            const ofertaReducere = window.ofertaCurenta ? window.ofertaCurenta.reducere : 0;
            const areReducere = ofertaCategorie === bucatarie;
            
            // Populează modalul cu datele produsului
            document.getElementById('modal-titlu').textContent = nume;
            document.getElementById('modal-descriere').textContent = descriere;
            document.getElementById('modal-img').src = imagine;
            document.getElementById('modal-bucatarie').textContent = formatareDenumireCategorie(bucatarie);
            document.getElementById('modal-calorii').textContent = calorii;
            document.getElementById('modal-gramaj').textContent = gramaj;
            document.getElementById('modal-categorie').textContent = formatareDenumireCategorie(categorie);
            
            // Adaugă ingredientele
            const ingredienteContainer = document.getElementById('modal-ingrediente');
            if (ingrediente && ingrediente.length > 0) {
                let html = `<h4>Ingrediente:</h4>
                <ul class="ingrediente-lista">`;
                
                ingrediente.forEach(ingredient => {
                    html += `<li>${ingredient}</li>`;
                });
                
                html += `</ul>`;
                ingredienteContainer.innerHTML = html;
                ingredienteContainer.style.display = 'block';
            } else {
                ingredienteContainer.style.display = 'none';
            }
            
            // Afișează prețul (cu sau fără reducere)
            const pretContainer = document.getElementById('modal-pret');
            if (areReducere) {
                const pretRedus = (pret * (100 - ofertaReducere) / 100).toFixed(2);
                pretContainer.innerHTML = `
                    <span class="pret-original">${pret} lei</span>
                    <span class="pret-redus">
                        ${pretRedus} lei
                        <span class="badge bg-danger">-${ofertaReducere}%</span>
                    </span>
                `;
            } else {
                pretContainer.innerHTML = `<span>${pret} lei</span>`;
            }
            
            // Afișează modalul
            modal.style.display = 'block';
            
            // Previne scroll-ul pe pagina din spate
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Închide modalul când se apasă butonul X
    modalInchide.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Închide modalul când se face click în afara lui
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Funcție pentru formatarea categoriilor
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
    
    // Adaugă oferta curentă în window pentru a fi accesată de JavaScript
    if (window.ofertaCurenta) {
        console.log("Oferta curentă disponibilă:", window.ofertaCurenta);
    }
});