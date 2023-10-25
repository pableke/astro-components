
import en from "./en.js";
import es from "./es.js";

const isset = val => ((typeof(val) !== "undefined") && (val !== null));
const isnum = val => ((typeof(val) === "number") || (val instanceof Number));

Number.isset = isset;
Number.isNumber = isnum;

function Langs() {
	const self = this; //self instance
    const DEFAULT = "en"; // Default iso lang
    const MSGS = {}; // Messages container

    let _langs = { en, es };
    let _lang = en; // Default language
	let errors = 0; // Errors counter

    this.getLangs = () => _langs;
	this.setLangs = langs => {
		_langs = langs;
		_lang = langs.en;
		return self;
	}
    this.getLang = lang => _langs[lang] || _lang;
    this.setLang = lang => { _lang = _langs[lang] || _lang; } // especific language

    this.getIsoLangs = () => Object.keys(_langs);
	this.getNavLang = () => navigator.language || navigator.userLanguage; // default browser language
    this.getIsoLang = () => document.documentElement.getAttribute("lang") || self.getNavLang() || DEFAULT;
    this.findIsoLang = list => {
        list = list || ""; // languages list (ej: es-ES,es)
        return list.split(",").find(lang => _langs[lang]) || DEFAULT;
    }

    this.get = msg => _lang[msg] || msg;
    this.getItem = (msg, index) => _lang[msg][index];

    this.getMsgs = () => MSGS;
	this.getMsg = name => MSGS[name];
	this.setMsg = (name, msg) => {
		MSGS[name] = self.get(msg);
		return self;
	}

	this.setOk = msg => self.setMsg("msgOk", msg);
	this.setInfo = msg => self.setMsg("msgInfo", msg);
	this.setWarn = msg => self.setMsg("msgWarn", msg);
	this.getError = name => MSGS[name || "msgError"];
	this.reject = msg => !self.setMsg("msgError", msg);
    this.setError = (msg, name) => {
		errors++;
		name = name || "msgError";
		return self.setMsg(name, msg);
	}

	this.isOk = () => (errors == 0);
	this.isError = () => (errors > 0);
	this.reset = () => {
		errors = 0;
        for (let key in MSGS)
            delete MSGS[key];
		return self;
    }

    en.strval = (data, name) => (data[name + "_en"] || data[name]);
    es.strval = (data, name) => (data[name + "_es"] || data[name]);

    // Add i18n Date formats
    en.isoDate = str => str && str.substring(0, 10); //Iso string = yyyy-mm-dd
    es.isoDate = str => str && (str.substring(8, 10) + "/" + str.substring(5, 7) + "/" + str.substring(0, 4)); //Iso string to dd/mm/yyyy
    this.isoDate = str => _lang.isoDate(str);
	this.isoTime = str => str && str.substring(11, 19); //hh:MM:ss
	this.isoDateTime = str => self.isoDate(str) + " " + self.isoTime(str); //ISO date + hh:MM:ss

    // Add i18n Float formats
    const options = { minimumFractionDigits: 2 };
    function fnToFloat(str, d) { //String to Float
        const separator = str.lastIndexOf(d);
        const sign = ((str.charAt(0) == "-") ? "-" : ""); // Get sign number + or -
        const whole = (separator < 0) ? str : str.substr(0, separator); //extract whole part
        const decimal = (separator < 0) ? "" : ("." + str.substr(separator + 1)); //decimal part
        const num = parseFloat(sign + whole.replace(/\D+/g, "") + decimal); //float value
        return isNaN(num) ? null : num;
    }
    function fnIsoFloat(num, n) {
        return parseFloat(num.toFixed(n ?? 2)).toLocaleString(_lang.lang, options);
    }
    function fnFmtFloat(str, dIn, n) { // String to String formated
        const num = fnToFloat(str, dIn); // String to Float type
        return isNaN(num) ? null : fnIsoFloat(num, n);
    }
    
    en.toFloat = str => str && fnToFloat(str, ".");  // String to Float
    en.isoFloat = (num, n) => isset(num) ? fnIsoFloat(num, n) : null; // Float to String formated
    en.fmtFloat = (str, n) => str && fnFmtFloat(str, ".", n); // String to EN String formated

    es.toFloat = str => str && fnToFloat(str, ",");  // String to Float
    es.isoFloat = (num, n) => isset(num) ? fnIsoFloat(num, n) : null; // Float to String formated
    es.fmtFloat = (str, n) => str && fnFmtFloat(str, ",", n); // String to EN String formated
    
    this.toFloat = str => _lang.toFloat(str);
    this.isoFloat = num => _lang.isoFloat(num);
    this.isoFloat2 = num => _lang.isoFloat(num);
    this.isoFloat3 = num => _lang.isoFloat(num, 3);
    this.fmtFloat = str => _lang.fmtFloat(str);
    this.fmtFloat2 = str => _lang.fmtFloat(str);
    this.fmtFloat3 = str => _lang.fmtFloat(str, 3);
    
    // Add i18n Int formats
    function fnToInt(str) { //String to Int
        const sign = ((str.charAt(0) == "-") ? "-" : ""); // Get sign number + or -
        const num = parseInt(sign + str.replace(/\D+/g, "")); // Integer number
        return isNaN(num) ? null : num;
    }
    function fnIsoInt(num) {
        return num.toLocaleString(_lang.lang);
    }
    function fnFmtInt(str) { // String to String formated
        const num = fnToInt(str); // String to Int type
        return isNaN(num) ? null : fnIsoInt(num);
    }
    
    en.toInt = str => str && fnToInt(str);  // String to Int
    en.isoInt = num => isset(num) ? fnIsoInt(num) : null; // Int to String formated
    en.fmtInt = str => str && fnFmtInt(str); // String to EN String formated
    
    es.toInt = str => str && fnToInt(str);  // String to Int
    es.isoInt = num => isset(num) ? fnIsoInt(num) : null; // Int to String formated
    es.fmtInt = str => str && fnFmtInt(str); // String to EN String formated
    
    this.toInt = str => _lang.toInt(str);
    this.isoInt = num => _lang.isoInt(num);
    this.fmtInt = str => _lang.fmtInt(str);

    // Initialize langs
    const initLang = () => self.setLang(self.getIsoLang());
    document.addEventListener("DOMContentLoaded", initLang); // on load view
    //document.addEventListener("astro:after-swap", initLang); // after view transition event
}

export default new Langs();
