document.addEventListener("DOMContentLoaded", function() {
    // butonul pt schimbarea temei
    const themeToggle = document.getElementById("theme-toggle");
    
    if (!themeToggle) {
        console.error("Elementul cu id 'theme-toggle' nu a fost găsit!");
        return;
    }
    
    //verif daca exista tema in localStorage
    const currentTheme = localStorage.getItem("theme");
    
    // setam tema initiala
    if (currentTheme === "dark") {
        document.body.classList.add("dark-theme");
        themeToggle.checked = true;
    }
    
//schimbarea temeu
    themeToggle.addEventListener("change", function() {
        if (this.checked) {

            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
            console.log("Tema intunecata activata");
        } else {
            
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
            console.log("Tema luminoasa activa");
        }
    });
});