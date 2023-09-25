
import en from "./en.js";
import es from "./es.js";

const DEFAULT = "en";
const langs = { en, es };
const KEYS = Object.keys(langs);

export const getLangs = () => langs;
export const getLang = lang => langs[lang] || en;

export const getPaths = (values, name) => {
    let routes = [];
    if (Array.isArray(values)) {
        name = name || "id";
        KEYS.forEach(lang => {
            values.forEach(value => {
                const params = { lang };
                params[name] = value;
                routes.push({ params });
            });
        });
    }
    else
        routes = KEYS.map(lang => ({ params: { lang } }));
    return routes;
}

export const getIsoLangs = () => KEYS;
export const getIsoLang = list => {
    list = list || ""; // languages list (ej: es-ES,es)
    return list.split(",").find(lang => langs[lang]) || DEFAULT;
}
