
import nb from "./number-box.js";
import sb from "./string-box.js";
import valid from "./validator-box.js";

function I18nBox() {
	const self = this; //self instance
	const KEY_ERROR = "msgError"; // Error name message

	let errors = 0; // Errors counter
	let _langs, _lang; // Current languages
	let _data, _msgs; // Parsed data and messages

	this.getLangs = () => _langs;
	this.setLangs = langs => {
		_langs = langs;
		_lang = langs.es;
		return self;
	}

	this.getLang = () => _lang;
	this.setLang = lang => {
		_lang = _langs[lang] || _langs[sb.substr(lang, 0, 2)] || _lang; // especific language
		return self;
	}

	// Default browser language
	this.getNavLang = () => document.documentElement.getAttribute("lang") || navigator.language || navigator.userLanguage;
	this.load = () => self.setLang(self.getNavLang());

	this.get = name => _lang[name];
	this.tr = name => _lang[name] || name;
	this.format = tpl => sb.format(tpl, _lang);

	// Shortcuts
	this.toInt = str => _lang.toInt(str);
	this.isoInt = num => _lang.isoInt(num);
	this.fmtInt = str => _lang.fmtInt(str);

	this.isoFmt = str => _lang.isoFmt(str);
	this.toFloat = str => _lang.toFloat(str);
	this.isoFloat1 = num => _lang.isoFloat(num, 1);
	this.isoFloat = num => _lang.isoFloat(num);
	this.isoFloat3 = num => _lang.isoFloat(num, 3);
	this.fmtFloat1 = str => _lang.fmtFloat(str, 1);
	this.fmtFloat = str => _lang.fmtFloat(str);
	this.fmtFloat3 = str => _lang.fmtFloat(str, 3);

	this.fmtBool = val => _lang.fmtBool(val);
	this.confirm = msg => confirm(self.tr(msg));

	// Validators: data and messages
	this.getData = () => _data;
	this.setData = (name, value) => {
		_data[name] = value;
		return self;
	}
	// Parse optional fields
	this.setIntval = (name, value) => self.setData(name, nb.intval(value));
	this.setInteger = (name, value) => self.setData(name, _lang.toInt(value));
	this.setFloat = (name, value) => self.setData(name, _lang.toFloat(value));
	this.setArray = (name, value) => self.setData(name, valid.array(value));
	this.setText500 = (name, value) => self.setData(name, valid.text500(value));
	this.setText1000 = (name, value) => self.setData(name, valid.text1000(value));
	this.setText2000 = (name, value) => self.setData(name, valid.text2000(value));

	this.getMsgs = () => _msgs;
	this.setMsgs = msgs => { _msgs = msgs; return self; }
	this.getMsg = name => _msgs[name];
	this.setMsg = (name, msg) => {
		_msgs[name] = self.tr(msg);
		return self;
	}

	this.setOk = msg => self.setMsg("msgOk", msg);
	this.setInfo = msg => self.setMsg("msgInfo", msg);
	this.setWarn = msg => self.setMsg("msgWarn", msg);
	this.getError = name => _msgs[name || KEY_ERROR];
	this.setError = (msg, name) => {
		errors++;
		name = name || KEY_ERROR;
		return self.setMsg(name, msg);
	}

	this.isOk = () => (errors == 0);
	this.isError = () => (errors > 0);
	this.reset = () => self.init({}, {});
	this.init = (msgs, data) => {
		errors = 0;
		_data = data;
		return self.setMsgs(msgs);
	}

	// Validators
	const fnValid = (name, value, msg) => sb.isset(value) ? self.setData(name, value) : self.setError(msg, name);
	this.required = (name, value) => fnValid(name, valid.required(value), "errRequired");
	this.required10 = (name, value) => fnValid(name, valid.required10(value), "errRequired");
	this.required50 = (name, value) => fnValid(name, valid.required50(value), "errRequired");
	this.required100 = (name, value) => fnValid(name, valid.required100(value), "errRequired");
	this.required200 = (name, value) => fnValid(name, valid.required200(value), "errRequired");
	this.required500 = (name, value) => fnValid(name, valid.required500(value), "errRequired");

	this.size10 = (name, value, msg) => fnValid(name, valid.size10(value), msg ?? "errMaxlength");
	this.size50 = (name, value, msg) => fnValid(name, valid.size50(value), msg ?? "errMaxlength");
	this.size100 = (name, value, msg) => fnValid(name, valid.size100(value), msg ?? "errMaxlength");
	this.size200 = (name, value, msg) => fnValid(name, valid.size200(value), msg ?? "errMaxlength");
	this.size300 = (name, value, msg) => fnValid(name, valid.size300(value), msg ?? "errMaxlength");

	this.text10 = (name, value, msg) => fnValid(name, valid.text10(value), msg ?? "errMaxlength");
	this.text50 = (name, value, msg) => fnValid(name, valid.text50(value), msg ?? "errMaxlength");
	this.text100 = (name, value, msg) => fnValid(name, valid.text100(value), msg ?? "errMaxlength");
	this.text200 = (name, value, msg) => fnValid(name, valid.text200(value), msg ?? "errMaxlength");
	this.text300 = (name, value, msg) => fnValid(name, valid.text300(value), msg ?? "errMaxlength");
	this.text500 = (name, value, msg) => fnValid(name, valid.text500(value), msg ?? "errMaxlength");
	this.text1000 = (name, value, msg) => fnValid(name, valid.text1000(value), msg ?? "errMaxlength");
	this.text2000 = (name, value, msg) => fnValid(name, valid.text2000(value), msg ?? "errMaxlength");

	this.intval = (name, value, msg) => fnValid(name, valid.intval(value), msg ?? "errRange");
	this.intval3 = (name, value, msg) => fnValid(name, valid.intval3(value), msg ?? "errRange");
	this.intval9 = (name, value, msg) => fnValid(name, valid.intval9(value), msg ?? "errRange");
	this.iGt0 = (name, value, msg) => fnValid(name, valid.gt0(_lang.toInt(value)), msg ?? "errNumber");
	this.gt0 = (name, value, msg) => fnValid(name, valid.gt0(_lang.toFloat(value)), msg ?? "errGt0");

	this.regex = (name, value, msg) => fnValid(name, valid.regex(value), msg ?? "errRegex");
	this.word = (name, value, msg) => fnValid(name, valid.word(value), msg ?? "errRegex");
	this.words = (name, value, msg) => fnValid(name, valid.words(value), msg ?? "errRegex");
	this.array = (name, value, msg) => fnValid(name, valid.array(value), msg ?? "errRegex");
	this.digits = (name, value, msg) => fnValid(name, valid.digits(value), msg ?? "errNumber");
	this.login = (name, value, msg) => fnValid(name, valid.login(value), msg ?? "errRegex");
	this.password = (name, value, msg) => fnValid(name, valid.password(value), msg ?? "errRegex");
	this.email = (name, value, msg) => fnValid(name, valid.email(value), msg ?? "errCorreo");
	this.code = (name, value, msg) => fnValid(name, valid.code(value), msg ?? "errRegex");

	this.date = (name, value, msg) => fnValid(name, valid.date(value), msg ?? "errDate");
	this.past = (name, value, msg) => fnValid(name, valid.past(value), msg ?? "errDateLe");
	this.leToday = (name, value, msg) => fnValid(name, valid.leToday(value), msg ?? "errDateGe");
	this.future = (name, value, msg) => fnValid(name, valid.future(value), msg ?? "errDateGt");
	this.geToday = (name, value, msg) => fnValid(name, valid.geToday(value), msg ?? "errDateGe");

	this.dni = (name, value, msg) => fnValid(name, valid.dni(value), msg ?? "errNif");
	this.cif = (name, value, msg) => fnValid(name, valid.cif(value), msg ?? "errNif");
	this.nie = (name, value, msg) => fnValid(name, valid.nie(value), msg ?? "errNif");
	this.idES = (name, value, msg) => fnValid(name, valid.idES(value), msg ?? "errNif");
	this.user = (name, value, msg) => fnValid(name, valid.email(value) || valid.idES(value), msg ?? "errRegex");

	this.iban = (name, value, msg) => fnValid(name, valid.iban(value), msg ?? "errRegex");
	this.swift = (name, value, msg) => fnValid(name, valid.swift(value), msg ?? "errRegex");
	this.creditCardNumber = (name, value, msg) => fnValid(name, valid.creditCardNumber(value), msg ?? "errRegex");
}

export default  new I18nBox();
