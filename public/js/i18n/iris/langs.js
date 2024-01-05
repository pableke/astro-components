
import i18n from "./i18n.js";
import langs from "../langs.js";

// Client language configuration
// Spcifics functions for current language proyect
String.prototype.getHours = function() {
    return +this.substring(11, 13); //hh int format
}

i18n.getHours = str => str && str.getHours(); // Get HH int format

export default langs;
