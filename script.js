document.addEventListener('DOMContentLoaded', function() {
    // Verifics dacă exista checkbox-ul pentru hamburger
    const hamburgerToggle = document.getElementById('hamburgerToggle');
    
    if (hamburgerToggle) {
        hamburgerToggle.addEventListener('change', function() {
            // Verifica dacă meniul este deschis sau închis
            const isMenuOpen = this.checked;
            
            // Obtine lista de meniu
            const menuList = document.querySelector('.meniu-lista');
            
            // Seteaza display-ul în functie de starea checkbox-ului
            if (isMenuOpen) {
                menuList.style.display = 'block';
            } else {
                
                setTimeout(() => {
                    menuList.style.display = 'none';
                }, 200); // Întârziere de 200ms
            }
        });
    }
    
    // Event listener pentru elementele de meniu
    document.querySelectorAll('.meniu-element').forEach(item => {
        item.addEventListener('click', function(e) {
            if (window.innerWidth <= 700) { 
                // Dacă elementul are submeniu, previne navigarea și extinde submeniul
                const submenu = this.querySelector('.submenu');
                if (submenu) {
                    e.preventDefault();
                    this.classList.toggle('active');
                    
                    if (submenu.style.display === 'block') {
                        submenu.style.display = 'none';
                    } else {
                        submenu.style.display = 'block';
                    }
                }
                
            }
        });
    });
});