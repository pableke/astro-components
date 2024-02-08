
import coll from "../components/Collection.js";
import maps from "./iris/tests.js";
import menus from "../data/menu.js";
import i18n from "../i18n/langs.js";

// Build tree menu as UL > Li > *
function preorden(data, node, level) {
    const children = data.filter(child => (child.padre == node.id)); // sub-menu items (children from node)
    const label = `<span class="label-menu level-${level}">` + ((node.icono || "") + node.nombre) + "</span>"; // item menu label
    if (children.length) {
        var output = `<li class="item-menu level-${level} item-parent">`; // parent item menu (with children)
        output += `<a href="${node.enlace}" class="link-menu level-${level}" title="${node.titulo}">${label}<i class="fas fa-caret-right icon-right"></i></a>`;
        output += `<ul class="sub-menu level-${level + 1}">` + children.map(child => preorden(data, child, level + 1)).join("") + "</ul>";
        return output + "</li>";
    }
    var output = `<li class="item-menu level-${level} item-leaf">`; // leaf item menu (item hoja)
    output += `<a href="${node.enlace}" class="link-menu level-${level}" title="${node.titulo}">${label}</a>`;
    output += children.map(child => preorden(data, child, level + 1)).join("");
    return output + "</li>";
}
const menu = document.querySelector("ul.menu");
menu.innerHTML = menus.sort((a, b) => (a.orden - b.orden))
                        .filter(node => (!node.padre && (node.tipo == 1)))
                        .map(node => preorden(menus, node, 1)).join("");
menu.slideIn();
// toggle phone menu
const menuToggleBtn = document.querySelector("#menu-toggle");
menuToggleBtn.addEventListener("click", ev => {
    menu.closest("nav").toggle("active");
    menuToggleBtn.children.toggle();
});

// Language selector
const html = document.documentElement;
const langs = document.getElementById("languages");
const linkLang = langs.querySelector('[href="?lang=' + i18n.get("lang") + '"]');
langs.firstElementChild.firstElementChild.src = linkLang.firstElementChild.src;

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
const themeToggleBtn = document.querySelector("#theme-toggle");
if ((localStorage.getItem("color-theme") === "dark") || (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    html.classList.add("dark");
    themeToggleBtn.lastElementChild.show(); // ligth icon
}
else {
    html.classList.remove("dark");
    themeToggleBtn.firstElementChild.show(); // dark icon
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

// Check to see if API is supported
if (document.startViewTransition) {
    const main = document.querySelector("main");

    // cargamos la pagina de destino con fetch
    const fetchMain = async url => {
        const res = await fetch(url.pathname);
        const text = await res.text();
        // extraigo el contenido de la etiqueta main
        const data = text.match(/<main[^>]*>([\s\S]*)<\/main>/im)[1];
        // utilizamos la api de View Transitions
        document.startViewTransition(() => {
            main.innerHTML = data; // update contents
            document.documentElement.scrollTop = 0;
            const name = url.searchParams.get("ev") || "after-swap"; // Specific event aname
            document.dispatchEvent(new Event("vt:" + name)); // Dispatch vt:after-swap event
            //console.log("Event name =", "vt:" + name); // specific name event
        });
    }

    // capture navigation event links
    window.navigation.addEventListener("navigate", ev => {
        const url = new URL(ev.destination.url);
        // si es una pagina externa => ignoramos el evento
        if (location.origin == url.origin) {
            // Navegación en el mismo dominio (origin)
            const handler = () => fetchMain(url);
            ev.intercept({ handler }); // intercept event
        }
        //console.log(url, ev);
    });
}
