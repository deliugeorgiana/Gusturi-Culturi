window.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("flexSwitchCheckDefault");
    const body = document.body;

    body.classList.add("light-theme");
    
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.remove("light-theme", "dark-theme");
        body.classList.add(savedTheme);
    }
    if(savedTheme === "dark-theme") {
        themeToggle.checked = true;
    }
    themeToggle.onchange = function () {
        if (themeToggle.checked) {
            body.classList.remove("light-theme");
            body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark-theme");

        } else {
            body.classList.remove("dark-theme");
            body.classList.add("light-theme");
            localStorage.setItem("theme", "light-theme");
        }
    }
})