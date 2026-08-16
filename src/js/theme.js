// Immediately apply the theme to prevent a flash of the wrong theme on load
const currentTheme = localStorage.getItem("logicklub_theme");
if (currentTheme === "light") {
    const link = document.createElement("link");
    link.id = "light-theme-style";
    link.rel = "stylesheet";
    link.href = "css/styles-light.css";
    document.head.appendChild(link);
}

document.addEventListener("DOMContentLoaded", () => {
    // Create the theme toggle button
    const themeBtn = document.createElement("a");
    themeBtn.href = "#";
    themeBtn.id = "theme-toggle-btn";

    // Inherits standard nav link styling automatically via CSS 'nav a'

    // Set initial icon text
    const isLight = localStorage.getItem("logicklub_theme") === "light";
    themeBtn.innerHTML = isLight ? "Dark" : "Light";

    // Handle toggle click
    themeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentIsLight = localStorage.getItem("logicklub_theme") === "light";

        if (currentIsLight) {
            // Switch to Dark Theme
            localStorage.setItem("logicklub_theme", "dark");
            themeBtn.innerHTML = "Light";
            const lightStyle = document.getElementById("light-theme-style");
            if (lightStyle) lightStyle.remove();
        } else {
            // Switch to Light Theme
            localStorage.setItem("logicklub_theme", "light");
            themeBtn.innerHTML = "Dark";
            const link = document.createElement("link");
            link.id = "light-theme-style";
            link.rel = "stylesheet";
            link.href = "css/styles-light.css";
            document.head.appendChild(link);
        }
    });

    const nav = document.querySelector("nav");
    if (nav) {
        themeBtn.style.marginLeft = "auto";
        nav.appendChild(themeBtn);
    }
});
