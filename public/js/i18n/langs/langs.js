
import en from "./en.js";
import es from "./es.js";
import i18n from "../i18n.js";

function Langs() {
	const self = this; //self instance
    const DEFAULT = "en"; // Default iso lang
    const KEY_ERR = "msgError"; // Error key
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
    this.setLang = lang => { // especific language
        _lang = _langs[lang] || _lang;
        i18n.setLang(_lang.lang);
        return self;
    }

    this.getIsoLangs = () => Object.keys(_langs);
	this.getNavLang = () => navigator.language || navigator.userLanguage; // default browser language
    this.getIsoLang = () => document.documentElement.getAttribute("lang") || self.getNavLang() || DEFAULT;
    this.findIsoLang = list => {
        list = list || ""; // languages list (ej: es-ES,es)
        return list.split(",").find(lang => _langs[lang]) || DEFAULT;
    }

    this.get = msg => _lang[msg] || msg || "";
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
	this.getError = name => MSGS[name || KEY_ERR];
	this.reject = msg => !self.setMsg(KEY_ERR, msg);
    this.setMsgError = (name, msg) => { errors++; return self.setMsg(name, msg); }
    this.setInputError = (name, tip, msg) => self.setMsgError(name, tip).setMsg(KEY_ERR, msg);
    this.setError = (msg, name, tip) => {
        return tip ? self.setInputError(name, tip, msg): self.setMsgError(name || KEY_ERR, msg);
	}

	this.isOk = () => (errors == 0);
	this.isError = () => (errors > 0);
	this.reset = () => {
		errors = 0;
        Object.clear(MSGS);
		return self;
    }

    en.strval = (data, name) => (data[name + "_en"] || data[name]);
    es.strval = (data, name) => (data[name + "_es"] || data[name]);
    this.strval = (data, name) => _lang.strval(data, name);

    const BOOLEAN_TRUE = ["1", "true", "yes", "on"];
    this.boolval = str => globalThis.isset(str) ? _lang.msgBool[+BOOLEAN_TRUE.includes("" + str)] : null;

    // Add i18n Date formats
    en.isoDate = i18n.isoDate; //Iso string = yyyy-mm-dd
    es.isoDate = i18n.esDate; //Iso string to dd/mm/yyyy
	this.enDate = i18n.isoDate; //Iso string = yyyy-mm-dd
	this.isoTime = i18n.isoTime; //Iso hh:MM:ss
	this.isoTimeShort = i18n.isoTimeShort; //Iso hh:MM
    this.isoDate = str => _lang.isoDate(str); // String locale date
	this.isoDateTime = str => self.isoDate(str) + " " + i18n.isoTime(str); //ISO date + hh:MM:ss

    en.isoFloat = i18n.isoFloat; // Float to String formated
    en.toFloat = str => i18n.toFloat(str, ".");  // String to Float
    en.fmtFloat = (str, n) => i18n.fmtFloat(str, ".", n); // String to EN String formated

    es.isoFloat = i18n.isoFloat; // Float to String formated
    es.toFloat = str => i18n.toFloat(str, ",");  // String to Float
    es.fmtFloat = (str, n) => i18n.fmtFloat(str, ",", n); // String to EN String formated

    this.toFloat = str => _lang.toFloat(str);
    this.isoFloat = num => _lang.isoFloat(num);
    this.isoFloat2 = num => _lang.isoFloat(num);
    this.isoFloat3 = num => _lang.isoFloat(num, 3);
    this.fmtFloat = str => _lang.fmtFloat(str);
    this.fmtFloat2 = str => _lang.fmtFloat(str);
    this.fmtFloat3 = str => _lang.fmtFloat(str, 3);

    this.toInt = i18n.toInt; // String to Int
    this.isoInt = i18n.isoInt; // Int to String formated
    this.fmtInt = i18n.fmtInt; // String to EN String formated

    // Initialize langs
    const initLang = () => self.setLang(self.getIsoLang());
    document.addEventListener("DOMContentLoaded", initLang); // on load view
    //document.addEventListener("astro:after-swap", initLang); // after view transition event
}

export default new Langs();
