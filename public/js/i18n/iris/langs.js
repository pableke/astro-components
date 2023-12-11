
import en from "./en.js";
import es from "./es.js";
import i18n from "../langs/langs.js";

// Lenguaje especifico del proyecto actual
const main = i18n.getLangs();
Object.assign(main.en, en);
Object.assign(main.es, es);

export default i18n;
