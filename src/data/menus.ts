import type { MenuItem } from "../types/MenuItem";

const en: MenuItem[] = [
    { url: "/en", name: "Home", icon: "" },
    { url: "/en/test", name: "Characters", icon: "" }
];

const es: MenuItem[] = [
    { url: "/es", name: "Inicio", icon: "" },
    { url: "/es/test", name: "Personajes", icon: "" }
];

const menus = { en, es };

export const getMenu = lang => (menus[lang] || en);
