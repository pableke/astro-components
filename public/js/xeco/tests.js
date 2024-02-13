
import api from "../components/Api.js";
import Form from "../components/Form.js";
import nav from "../components/Navigation.js";
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

function index() {
    const info = document.getElementById("info-pokemon");
    const fnSelect = data => {
        info.render({
            name: data.name,
            type: data.types[0].type.name,
            hp: data.stats[0].base_stat,
            species: data.species.name,
            attack: data.stats[1].base_stat,
            defense: data.stats[3].base_stat,
            img: data.sprites.front_default
        }).show();
        console.log(data);
    }

    const formPokemon = new Form("#form-pokemon");
    formPokemon.setAutocomplete("#pokemon", {
        source: (term, acPokemon) => {
            const fnFilter = pokemon => String.ilike(pokemon.name, term);
            api.json("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0")
                .then(data => acPokemon.render(data.results.filter(fnFilter)));
        },
		render: item => item.name,
		select: item => item.name,
		afterSelect: item => api.json(`https://pokeapi.co/api/v2/pokemon/${item.name}`).then(fnSelect),
		onReset: () => info.hide()
    });
}

nav.addListener("/dist/views/maps.html", maps)
    .addListener("/dist/views/index.html", index).addListener("/dist/views/", index);
