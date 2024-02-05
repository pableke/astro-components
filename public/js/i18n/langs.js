
import i18n from "./main/i18n.js";

// Language selector
/*const currentLang = dom.get("#currentLang", _nav);
const linkLang = dom.get('[href="?lang=' + i18n.get("lang") + '"]', currentLang.nextElementSibling);
currentLang.firstElementChild.src = linkLang.firstElementChild.src;
dom.hide(linkLang.parentNode);*/

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
/*const html = document.documentElement;
const themeToggleBtn = document.querySelector("#theme-toggle");
const themeToggleDarkIcon = themeToggleBtn.firstElementChild;
const themeToggleLightIcon = themeToggleBtn.lastElementChild;
if ((localStorage.getItem("color-theme") === "dark") || (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    html.classList.add("dark");
    themeToggleLightIcon.classList.remove("hidden");
}
else {
    html.classList.remove("dark");
    themeToggleDarkIcon.classList.remove("hidden");
}
themeToggleBtn.addEventListener("click", function() {
    // toggle icons inside button
    themeToggleDarkIcon.classList.toggle("hidden");
    themeToggleLightIcon.classList.toggle("hidden");

    // if set via local storage previously
    if (localStorage.getItem("color-theme")) {
        if (localStorage.getItem("color-theme") === "light") {
            html.classList.add("dark");
            localStorage.setItem("color-theme", "dark");
        } else {
            html.classList.remove("dark");
            localStorage.setItem("color-theme", "light");
        }
    }
    else { // if NOT set via local storage previously
        if (html.classList.contains("dark")) {
            html.classList.remove("dark");
            localStorage.setItem("color-theme", "light");
        } else {
            html.classList.add("dark");
            localStorage.setItem("color-theme", "dark");
        }
    }
});*/

// Client language configuration
const initLang = () => i18n.setLang(i18n.getIsoLang());
document.addEventListener("DOMContentLoaded", initLang); // on load view
//document.addEventListener("astro:after-swap", initLang); // after view transition event

export default i18n;
