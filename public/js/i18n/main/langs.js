
import en from "./en.js";
import es from "./es.js";

function Langs() {
	const self = this; //self instance
    const DEFAULT = "en"; // Default iso lang
    const KEY_ERR = "msgError"; // Error key
    const MSGS = {}; // Messages container

    let _langs = { en, "en-GB": en, es, "es-ES": es }; // All langs
    let _lang = en; // Default language
	let errors = 0; // Errors counter

    this.getLangs = () => _langs;
    this.getLang = () => _lang;
    this.setLang = lang => { // especific language
        _lang = _langs[lang] || _lang;
        return self;
    }

    this.addLang = function(name, lang) {
        Object.assign(_langs[name], lang);
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

    const BOOLEAN_TRUE = ["1", "true", "yes", "on"];
    this.boolval = str => globalThis.isset(str) ? _lang.msgBool[+BOOLEAN_TRUE.includes("" + str)] : null;
    this.strval = (data, name) => data[name + "_" + _lang.lang] || data[name];
}

export default new Langs();
