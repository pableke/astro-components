
import i18n from "../validators.js";

// Server config language
const langs = i18n.getLangs();
const isnum = val => ((typeof(val) === "number") || (val instanceof Number));
const round = (num, scale) => +(Math.round(num + "e+" + scale)  + "e-" + scale);

// String formats
String.prototype.inDay = function(dt) {
    return this.startsWith(dt.substring(0, 10)); //yyyy-mm-dd
}
String.prototype.isoTime = function() {
    return this.substring(11, 19); //hh:MM:ss
}
String.prototype.isoTimeShort = function() {
    return this.substring(11, 16); //hh:MM
}

// Add i18n Date formats
langs.en.isoDate = str => str && str.substring(0, 10); //Iso string = yyyy-mm-dd
langs.es.isoDate = str => str && (str.substring(8, 10) + "/" + str.substring(5, 7) + "/" + str.substring(0, 4)); //Iso string to dd/mm/yyyy

i18n.enDate = langs.en.isoDate; //Iso string = yyyy-mm-dd
i18n.isoTime = str => str && str.isoTime(); //Iso hh:MM:ss
i18n.isoTimeShort = str => str && str.isoTimeShort(); //Iso hh:MM
i18n.isoDate = str => i18n.getLang().isoDate(str); // String locale date
i18n.isoDateTime = str => i18n.isoDate(str) + " " + i18n.isoTime(str); //ISO date + hh:MM:ss

// Extends Date prototype
Date.prototype.addHours = function(hours) {
    this.setHours(this.getHours() + hours);
    return this;
}
Date.prototype.diffDays = function(date) { // Days between to dates
    return Math.floor((date.getTime() - this.getTime()) / (1000 * 3600 * 24));
}

// Float formats
const options = { minimumFractionDigits: 2 };
function toFloat(str, d) { //String to Float
    if (!str)
        return null; // nada que parsear
    const separator = str.lastIndexOf(d);
    const sign = ((str.charAt(0) == "-") ? "-" : ""); // Get sign number + or -
    const whole = (separator < 0) ? str : str.substr(0, separator); //extract whole part
    const decimal = (separator < 0) ? "" : ("." + str.substr(separator + 1)); //decimal part
    const num = parseFloat(sign + whole.replace(/\D+/g, "") + decimal); //float value
    return isNaN(num) ? null : num;
}
function isoFloat(num, n) { // Float to String formated
    return isnum(num) ? round(num, n ?? 2).toLocaleString(i18n.getLang().lang, options) : null;
}
function fmtFloat(str, dIn, n) { // String to String formated
    return isoFloat(toFloat(str, dIn), n);
}

langs.en.isoFloat = isoFloat; // Float to String formated
langs.en.toFloat = str => toFloat(str, ".");  // String to Float
langs.en.fmtFloat = (str, n) => fmtFloat(str, ".", n); // String to EN String formated

langs.es.isoFloat = isoFloat; // Float to String formated
langs.es.toFloat = str => toFloat(str, ",");  // String to Float
langs.es.fmtFloat = (str, n) => fmtFloat(str, ",", n); // String to ES String formated

i18n.toFloat = str => i18n.getLang().toFloat(str);
i18n.isoFloat = num => i18n.getLang().isoFloat(num);
i18n.isoFloat2 = num => i18n.getLang().isoFloat(num);
i18n.isoFloat3 = num => i18n.getLang().isoFloat(num, 3);
i18n.fmtFloat = str => i18n.getLang().fmtFloat(str);
i18n.fmtFloat2 = str => i18n.getLang().fmtFloat(str);
i18n.fmtFloat3 = str => i18n.getLang().fmtFloat(str, 3);

// Int formats
function toInt(str) { //String to Int
    if (!str)
        return null; // nada que parsear
    const sign = ((str.charAt(0) == "-") ? "-" : ""); // Get sign number + or -
    const num = parseInt(sign + str.replace(/\D+/g, "")); // Integer number
    return isNaN(num) ? null : num;
}
function isoInt(num) { // Int to String formated
    return isnum(num) ? num.toLocaleString(i18n.getLang().lang) : null;
}
function fmtInt(str) { // String to String formated
    return isoInt(toInt(str));
}

i18n.toInt = toInt; // String to Int
i18n.isoInt = isoInt; // Int to String formated
i18n.fmtInt = fmtInt; // String to EN String formated

// Extends Number prototype
Number.isNumber = isnum;
Number.prototype.mask = function(i) { return ((this >> i) & 1); } // check bit at i position
Number.prototype.bitor = function(flags) { return ((this & flags) > 0); } // some flags up?
Number.prototype.bitand = function(flags) { return ((this & flags) == flags); } // all flags up?
Number.prototype.round = function(digits) { return round(this, digits ?? 2); } // default round 2 decimals

globalThis.isnum = isnum; // Check if Number type
globalThis.dec = (num, min) => ((num > (min ?? 0)) ? num-- : num); // Decrement number until min
globalThis.inc = (num, max) => ((num < max) ? num++ : num); // Increment number until max

export default i18n;
