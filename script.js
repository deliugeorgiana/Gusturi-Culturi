document.addEventListener('DOMContentLoaded', function() {
    const hamburgerToggle = document.getElementById('hamburgerToggle');
    const menuList = document.querySelector('.meniu-lista');

    if (hamburgerToggle && menuList) {
        hamburgerToggle.addEventListener('change', function() {
            menuList.classList.toggle('open', this.checked);
        });
    }

    // Suport pentru accesibilitate - navigare cu tastatura
    const menuItems = document.querySelectorAll('.meniu-element');
    menuItems.forEach(item => {
        item.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                const submenu = this.querySelector('.submeniu');
                if (submenu) {
                    submenu.classList.toggle('open');
                    event.preventDefault();
                }
            }
        });
    });
});