
import i18n from "./main/i18n.js";

// Client language configuration
const initLang = () => i18n.setLang(i18n.getIsoLang());
document.addEventListener("DOMContentLoaded", initLang); // on load view
//document.addEventListener("astro:after-swap", initLang); // after view transition event

export default i18n;
