document.addEventListener("DOMContentLoaded", function() {
    // Selectează butoanele radio
    const radioButtons = document.querySelectorAll('input[name="rad-bucatarie"]');
    
    // Selectează secțiunile de bucătărie (subsecțiuni din #produse)
    const sectiuniBucatarie = document.querySelectorAll('#produse > section');
    
    // Verifică dacă există secțiuni
    if(sectiuniBucatarie.length === 0) {
        console.error("Nu s-au găsit secțiuni de bucătării!");
        return;
    }
    
    // Adaugă event listener pentru fiecare buton
    radioButtons.forEach(button => {
        button.addEventListener('change', function() {
            if (this.checked) {
                const tipBucatarie = this.value;
                console.log("Tip bucătărie selectat:", tipBucatarie);
                
                if (tipBucatarie === 'toate') {
                    // Afișează toate secțiunile
                    sectiuniBucatarie.forEach(sectiune => {
                        sectiune.style.display = 'block';
                    });
                } else {
                    // Ascunde toate secțiunile inițial
                    sectiuniBucatarie.forEach(sectiune => {
                        sectiune.style.display = 'none';
                    });
                    
                    // Afișează doar secțiunea care corespunde valorii selectate
                    const sectiuneCorecta = Array.from(sectiuniBucatarie).find(sectiune => {
                        const titlu = sectiune.querySelector('h3').textContent.toLowerCase();
                        
                        if (tipBucatarie === 'mediteraneana' && titlu.includes('mediteraneană')) {
                            return true;
                        } else if (tipBucatarie === 'asiatica' && titlu.includes('asiatică')) {
                            return true;
                        } else if (tipBucatarie === 'romaneasca' && titlu.includes('românească')) {
                            return true;
                        }
                        
                        return false;
                    });
                    
                    if (sectiuneCorecta) {
                        sectiuneCorecta.style.display = 'block';
                        console.log("Afișez secțiunea:", sectiuneCorecta.querySelector('h3').textContent);
                    } else {
                        console.error("Nu s-a găsit secțiunea pentru bucătăria:", tipBucatarie);
                    }
                }
            }
        });
    });
});