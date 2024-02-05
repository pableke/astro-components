
import coll from "../components/Collection.js";
import menus from "../data/menu.js";
import i18n from "../i18n/langs.js";

// Menu handler
const menuToggleBtn = document.querySelector("#menu-toggle");
menuToggleBtn.addEventListener("click", ev => menuToggleBtn.children.toggle());
// Build tree menu as UL > Li > *
function preorden(data, node, level) {
    var output = `<li class="item-menu item-menu-${level}">`;
    const label = (node.icono || "") + node.nombre; // item menu label
    const children = data.filter(child => (child.padre == node.id)); // sub-menu items
    if (children.length) {
        output += `<a href="${node.enlace}" class="link-menu link-menu-${level}" title="${node.titulo}">${label}<i class="fas fa-caret-right"></i></a>`;
        output += `<ul class="sub-menu sub-menu-${level + 1}">` + children.map(child => preorden(data, child, level + 1)).join("") + "</ul>";
    }
    else {
        output += `<a href="${node.enlace}" class="link-menu link-menu-${level}" title="${node.titulo}">${label}</a>`;
        output += children.map(child => preorden(data, child, level + 1)).join("");
    }
    return output + "</li>";
}
const menu = document.querySelector("ul.menu");
menu.innerHTML = menus.sort((a, b) => (a.orden - b.orden))
                        .filter(node => (!node.padre && (node.tipo == 1)))
                        .map(node => preorden(menus, node, 1)).join("");

// Language selector
const html = document.documentElement;
const langs = document.getElementById("languages");
const linkLang = langs.querySelector('[href="?lang=' + i18n.get("lang") + '"]');
langs.firstElementChild.firstElementChild.src = linkLang.firstElementChild.src;

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
const themeToggleBtn = document.querySelector("#theme-toggle");
if ((localStorage.getItem("color-theme") === "dark") || (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    html.classList.add("dark");
    themeToggleBtn.lastElementChild.classList.remove("hide"); // ligth icon
}
else {
    html.classList.remove("dark");
    themeToggleBtn.firstElementChild.classList.remove("hide"); // dark icon
}
themeToggleBtn.addEventListener("click", function() {
    // toggle icons inside button
    themeToggleBtn.children.toggle();

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
});
