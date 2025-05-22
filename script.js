document.addEventListener('DOMContentLoaded', function() {
    const hamburgerToggle = document.getElementById('hamburgerToggle');
    const menuLista = document.querySelector('.meniu-lista');
    
    hamburgerToggle.addEventListener('change', function() {
        if(this.checked) {
            menuLista.classList.add('show');
        } else {
            menuLista.classList.remove('show');
        }
    });
});