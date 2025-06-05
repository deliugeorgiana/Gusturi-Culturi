document.addEventListener("DOMContentLoaded", function() {
    // Găsim butonul pentru schimbarea temei
    const themeToggle = document.getElementById("theme-toggle");
    
    if (!themeToggle) {
        console.error("Elementul cu id 'theme-toggle' nu a fost găsit!");
        return;
    }
    
    // Verificăm localStorage pentru preferința salvată
    const currentTheme = localStorage.getItem("theme");
    
    // Dacă există o preferință salvată, o aplicăm
    if (currentTheme === "dark") {
        document.body.classList.add("dark-theme");
        themeToggle.checked = true;
    }
    
    // Adăugăm event listener pentru schimbarea temei
    themeToggle.addEventListener("change", function() {
        if (this.checked) {
            // Activăm tema întunecată
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
            console.log("Tema întunecată activată");
        } else {
            // Dezactivăm tema întunecată
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
            console.log("Tema luminoasă activată");
        }
    });
});