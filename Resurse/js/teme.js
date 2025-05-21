document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('flexSwitchCheckDefault');
    
    // Verifică dacă există o preferință salvată
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.toggle('dark-theme', currentTheme === 'dark');
        toggleSwitch.checked = currentTheme === 'dark';
    }
    
    // Eveniment pentru comutator
    toggleSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Toggle pentru hamburger pe dispozitive mobile
    const hamburgerIcon = document.getElementById('hamburger-fa');
    const hamburgerNav = document.querySelector('#hamburger nav');
    
    if (hamburgerIcon && hamburgerNav) {
        hamburgerIcon.addEventListener('click', function() {
            const isDisplayed = hamburgerNav.style.display === 'block';
            hamburgerNav.style.display = isDisplayed ? 'none' : 'block';
        });
    }
});