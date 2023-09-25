
function initTheme() {
    const html = document.documentElement;
    const themeToggleDarkIcon = document.querySelector("#theme-dark");
    const themeToggleLightIcon = themeToggleDarkIcon.nextElementSibling;

    if ((localStorage.getItem("color-theme") === "dark") || (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        html.classList.add("dark");
        themeToggleLightIcon.classList.remove("hide");
    }
    else {
        html.classList.remove("dark");
        themeToggleDarkIcon.classList.remove("hide");
    }

    themeToggleDarkIcon.addEventListener("click", function() { // click dark
        // toggle icons inside button and set dark mode
        themeToggleDarkIcon.classList.toggle("hide");
        themeToggleLightIcon.classList.toggle("hide");
        localStorage.setItem("color-theme", "dark");
        html.classList.add("dark");
    });
    themeToggleLightIcon.addEventListener("click", function() { // click light
        // toggle icons inside button and set light mode
        themeToggleDarkIcon.classList.toggle("hide");
        themeToggleLightIcon.classList.toggle("hide");
        localStorage.setItem("color-theme", "light");
        html.classList.remove("dark");
    });
}

initTheme(); // on load view
document.addEventListener("astro:after-swap", initTheme); // after view transition event
