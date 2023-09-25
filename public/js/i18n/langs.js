
import en from "./en.js";
import es from "./es.js";

function Langs() {
	const self = this; //self instance
    const MSGS = {}; // Messages container
    const langs = { en, es };
    const KEYS = Object.keys(langs);

    let _lang = en; // Default language
	let errors = 0; // Errors counter

    this.getLangs = () => langs;
    this.getLang = lang => langs[lang] || _lang;
    this.setLang = lang => { _lang = langs[lang] || _lang; } // especific language

    this.getIsoLangs = () => KEYS;
    this.getIsoLang = () => document.documentElement.getAttribute("lang") || "en"; // || navigator.language || navigator.userLanguage;
    this.get = msg => _lang[msg] || msg;

    this.getMsgs = () => MSGS;
	this.getMsg = name => MSGS[name];
	this.setMsg = (name, msg) => {
		MSGS[name] = _lang[msg] || msg;
		return self;
	}

	this.setOk = msg => self.setMsg("msgOk", msg);
	this.setInfo = msg => self.setMsg("msgInfo", msg);
	this.setWarn = msg => self.setMsg("msgWarn", msg);
	this.getError = name => MSGS[name || "msgError"];
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
    
    // Add i18n Float formats
    const enFormatter = Intl.NumberFormat("en");
    const esFormatter = Intl.NumberFormat("es");
    
    function fnToFloat(str, d) { //String to Float
        let separator = str.lastIndexOf(d);
        let sign = ((str.charAt(0) == "-") ? "-" : ""); // Get sign number + or -
        let whole = (separator < 0) ? str : str.substr(0, separator); //extract whole part
        let decimal = (separator < 0) ? "" : ("." + str.substr(separator + 1)); //decimal part
        let num = parseFloat(sign + whole.replace(/\D+/g, "") + decimal); //float value
        return isNaN(num) ? null : num;
    }
    function fnIsoFloat(formatter, num, n) {
        return formatter.format(num.toFixed(isNaN(n) ? 2 : n));
    }
    function fnFmtFloat(formatter, str, dIn, n) { // String to String formated
        const num = fnToFloat(str, dIn); // String to Float type
        return isNaN(num) ? null : fnIsoFloat(formatter, num, n);
    }
    
    en.toFloat = str => str && fnToFloat(str, ".");  // String to Float
    en.isoFloat = (num, n) => isNaN(num) ? null : fnIsoFloat(enFormatter, num, n); // Float to String formated
    en.fmtFloat = (str, n) => str && fnFmtFloat(enFormatter, str, ".", n); // String to EN String formated
    
    es.toFloat = str => str && fnToFloat(str, ",");  // String to Float
    es.isoFloat = (num, n) => isNaN(num) ? null : fnIsoFloat(esFormatter, num, n); // Float to String formated
    es.fmtFloat = (str, n) => str && fnFmtFloat(esFormatter, str, ",", n); // String to EN String formated
    
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
    function fnIsoInt(formatter, num) {
        return formatter.format(num);
    }
    function fnFmtInt(formatter, str) { // String to String formated
        const num = fnToInt(str); // String to Int type
        return isNaN(num) ? null : fnIsoInt(formatter, num);
    }
    
    en.toInt = str => str && fnToInt(str);  // String to Int
    en.isoInt = (num, n) => isNaN(num) ? null : fnIsoInt(enFormatter, num); // Int to String formated
    en.fmtInt = (str, n) => str && fnFmtInt(enFormatter, str); // String to EN String formated
    
    es.toInt = str => str && fnToInt(str);  // String to Int
    es.isoInt = (num, n) => isNaN(num) ? null : fnIsoInt(esFormatter, num); // Int to String formated
    es.fmtInt = (str, n) => str && fnFmtInt(esFormatter, str); // String to EN String formated
    
    this.toInt = str => _lang.toInt(str);
    this.isoInt = num => _lang.isoInt(num);
    this.fmtInt = str => _lang.fmtInt(str);

    // Initialize langs
    const initLang = () => { // selected language
        const current = document.documentElement.getAttribute("lang");
        _lang = langs[current] || _lang;
    }
    document.addEventListener("DOMContentLoaded", initLang); // on load view
    document.addEventListener("astro:after-swap", initLang); // after view transition event
}

export default new Langs();