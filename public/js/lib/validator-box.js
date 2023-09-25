
import nb from "./number-box.js";
import sb from "./string-box.js";

/**
 * ValidatorBox module require
 * StringBox (sb) and NumberBox (nb)
 * 
 * @module ValidatorBox
 */
function ValidatorBox() {
	const self = this; //self instance
	const EMPTY = ""; //empty string

	//HTML special chars
	const ESCAPE_HTML = /"|'|&|<|>|\\/g;
	const ESCAPE_MAP = { '"': "&#34;", "'": "&#39;", "&": "&#38;", "<": "&#60;", ">": "&#62;", "\\": "&#92;" };

	//RegEx for validating
	const RE_DIGITS = /^[1-9]\d*$/;
	const RE_WORDS = /^\w+(,\w+)*$/;
	const RE_ARRAY = /^\d+(,\d+)*$/;
	const RE_MAIL = /\w+[^\s@]+@[^\s@]+\.[^\s@]+/;
	const RE_DATE = /^\d{4}-[01]\d-[0-3]\d/;
	const RE_TIME = /[0-2]\d:[0-5]\d:[0-5]\d[\.\d{1,3}]?$/;
	const RE_DATE_TIME = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d[\.\d{1,3}]?$/;
	const RE_LOGIN = /^[\w#@&°!§%;:=\^\/\(\)\?\*\+\~\.\,\-\$]{6,}$/;
	const RE_IPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
	const RE_IPv6 = /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/;
	const RE_SWIFT = /^[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}$/; //SWIFT / BIC
	const RE_URL = /(http|fttextp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
	// Spanish Id's
	const RE_DNI = /^(\d{8})([A-Z])$/;
	const RE_CIF = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
	const RE_NIE = /^[XYZ]\d{7,8}[A-Z]$/;
	// Cards Numbers
	const RE_VISA = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
	const RE_MASTER_CARD = /^(?:5[1-5][0-9]{14})$/;
	const RE_AMEX = /^(?:3[47][0-9]{13})$/;
	const RE_DISCOVER = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
	const RE_DINER_CLUB = /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/;
	const RE_JCB = /^(?:(?:2131|1800|35\d{3})\d{11})$/;

	const minify = sb.toCode;
	const fnRange = (num, min, max) => nb.between(+num, min, max) ? num : null; // NaN comparator always false
	const between = (str, min, max) => nb.between(sb.size(str), min, max) ? str : null; // for String and Arrays
	const fnSplit = (re, value) => sb.test(value, re) ? value.split(",") : null; // validate and split input

	this.unescape = str => str ? str.replace(/&#(\d+);/g, (key, num) => String.fromCharCode(num)) : null;
	this.escape = str => str ? str.trim().replace(ESCAPE_HTML, (matched) => ESCAPE_MAP[matched]) : null;

	// Validators
	this.intval = num => { num = parseInt(num); return isNaN(aux) ? null : aux; }
	this.intval3 = num => fnRange(nb.intval(num), 1, 3);
	this.intval5 = num => fnRange(nb.intval(num), 1, 5);
	this.intval9 = num => fnRange(nb.intval(num), 1, 9);
	this.range = (num, min, max) => fnRange(num, min, max);
	this.gt0 = num => fnRange(num, .0001, 1e9); // Float

	this.size = (str, min, max) => between(self.escape(str), min, max);
	this.required = value => self.size(value, 1, 1000);
	this.required10 = value => self.size(value, 1, 10);
	this.required50 = value => self.size(value, 1, 50);
	this.required100 = value => self.size(value, 1, 100);
	this.required200 = value => self.size(value, 1, 200);
	this.required500 = value => self.size(value, 1, 500);

	this.size10 = str => self.size(str, 0, 10);
	this.size50 = str => self.size(str, 0, 50);
	this.size100 = str => self.size(str, 0, 100);
	this.size200 = str => self.size(str, 0, 200);
	this.size300 = str => self.size(str, 0, 300);
	this.size500 = str => self.size(str, 0, 500);

	this.text = (str, min, max) => between(self.escape(str), min, max);
	this.text10 = str => self.text(str, 0, 10);
	this.text50 = str => self.text(str, 0, 50);
	this.text100 = str => self.text(str, 0, 100);
	this.text200 = str => self.text(str, 0, 200);
	this.text300 = str => self.text(str, 0, 300);
	this.text500 = str => self.text(str, 0, 500);
	this.text1000 = str => self.text(str, 0, 1000);
	this.text2000 = str => self.text(str, 0, 1000);

	this.regex = (re, value) => sb.test(sb.trim(value), re);
	this.date = value => self.regex(RE_DATE, value);
	this.time = value => self.regex(RE_TIME, value);
	this.isoDateTime = value => self.regex(RE_DATE_TIME, value);
	this.word = value => self.regex(/\w+/, self.size50(value));
	this.words = value => between(fnSplit(RE_WORDS, sb.clean(value)), 1, 100);
	this.array = value => between(fnSplit(RE_ARRAY, sb.clean(value)), 1, 100);
	this.numbers = value => {
		const arr = fnSplit(RE_ARRAY, sb.clean(value));
		return between(arr, 1, 100) ? arr.map(nb.intval) : null;
	}

	this.digits = value => self.regex(RE_DIGITS, self.size50(value));
	this.login = value => self.regex(RE_LOGIN, self.size200(value));
	this.password = value => self.regex(RE_LOGIN, self.size200(value));
	this.swift = value => self.regex(RE_SWIFT, value);
	this.email = value => sb.lower(self.regex(RE_MAIL, self.size200(value)));
	this.code = value => sb.upper(self.regex(RE_LOGIN, self.size50(value)));

	// Date validations in string iso format (ej: "2022-05-11T12:05:01")
	const systime = (new Date()).toISOString().substring(0, 19); // exclude ms
	const sysdate = systime.substring(0, 10);
	const eqSize = (s1, s2) => (sb.size(s1) == sb.size(s2));
	this.past = str => (eqSize(str, sysdate) && (str < sysdate)) ? str : null;
	this.dtPast = str => (eqSize(str, systime) && (str < systime)) ? str : null;
	this.leToday = str => (eqSize(str, sysdate) && (str <= sysdate)) ? str : null;
	this.future = str => (eqSize(str, sysdate) && (str > sysdate)) ? str : null;
	this.dtFuture = str => (eqSize(str, systime) && (str > systime)) ? str : null;
	this.geToday = str => (eqSize(str, sysdate) && (str >= sysdate)) ? str : null;

	// Persons ID's
	function fnLetraDni(value) {
		const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
		let letra = letras.charAt(parseInt(value, 10) % 23);
		return (letra == value.charAt(8)) ? value : null;
	}
	this.dni = function(value) {
		value = sb.test(minify(value), RE_DNI);
		return value && fnLetraDni(value);
	}
	this.cif = function(value) {
		value = sb.test(minify(value), RE_CIF);
		if (!value) return null;

		var match = value.match(RE_CIF);
		var letter = match[1];
		var number  = match[2];
		var control = match[3];
		var sum = 0;

		for (var i = 0; i < number.length; i++) {
			var n = parseInt(number[i], 10);
			//Odd positions (Even index equals to odd position. i=0 equals first position)
			if ((i % 2) === 0) {
				n *= 2; //Odd positions are multiplied first
				// If the multiplication is bigger than 10 we need to adjust
				n = (n < 10) ? n : (parseInt(n / 10) + (n % 10));
			}
			sum += n;
		}

		sum %= 10;
		var control_digit = (sum !== 0) ? 10 - sum : sum;
		var control_letter = "JABCDEFGHI".substr(control_digit, 1);
		var ok = letter.match(/[ABEH]/) ? (control == control_digit) //Control must be a digit
								: letter.match(/[KPQS]/) ? (control == control_letter) //Control must be a letter
								: ((control == control_digit) || (control == control_letter)); //Can be either
		return ok ? value : null;
	}
	this.nie = function(value) {
		value = sb.test(minify(value), RE_NIE);
		if (!value) return null;

		let prefix = value.charAt(0); //Change the initial letter for the corresponding number and validate as DNI
		let p0 = (prefix == "X") ? 0 : ((prefix == "Y") ? 1 : ((prefix == "Z") ? 2 : prefix));
		return fnLetraDni(p0 + value.substr(1));
	}
	this.idES = function(value) {
		return self.dni(value) || self.cif(value) || self.nie(value);
	}

	// Bancks entities and credit cards
	this.iban = function(IBAN) {
		const CODE_LENGTHS = {
			AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
			CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
			FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
			HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
			LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
			MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
			RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26,   
			AL: 28, BY: 28, CR: 22, EG: 29, GE: 22, IQ: 23, LC: 32, SC: 31, ST: 25,
			SV: 28, TL: 23, UA: 29, VA: 22, VG: 24, XK: 20
		};

		IBAN = minify(IBAN);
		let code = IBAN && IBAN.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/);
		if (!code || (sb.size(IBAN) !== CODE_LENGTHS[code[1]]))
			return null;

		let digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, letter => (letter.charCodeAt(0) - 55));
		let digital = digits.toString();
		let checksum = digital.slice(0, 2);
		for (let offset = 2; offset < digital.length; offset += 7) {
			let fragment = checksum + digital.substring(offset, offset + 7);
			checksum = parseInt(fragment, 10) % 97;
		}
		return (checksum === 1) ? IBAN : null; //save reformat
	}

	const ENTIDADES = {
		"2080": "Abanca", "1544": "Andbank España", "0182": "BBVA", "9000": "Banco de España", "0186": "Banco Mediolanum",
		"0081": "Banco Sabadell", "0049": "Banco Santander", "0128": "Bankinter", "0065": "Barclays Bank", "0058": "BNP Paribas España",
		"2100": "Caixabank", "0122": "Citibank España", "0154": "Credit Agricole", "0019": "Deutsche Bank", "0239": "Evo Banco",
		"0162": "HSBC Bank", "2085": "Ibercaja Banco", "1465": "ING", "1000": "Instituto de crédito oficial", "2095": "Kutxabank",
		"0073": "Openbank", "2103": "Unicaja Banco", "3058": "Cajamar", "3085": "Caja Rural", "3146": "Novanca", "0238": "Banco Pastor",
		"0487": "Banco Mare Nostrum", "2090": "Caja de Ahorros Mediterraneo", "0030": "Banco Español de Crédito", "0146": "Citibank"
	};
	this.getEntidades = () => ENTIDADES;
	this.getIban1 = iban => sb.substr(iban, 0, 4);
	this.getIban2 = iban => sb.substr(iban, 4, 4);
	this.getEntidad = iban => ENTIDADES[self.getIban2(iban)];
	this.getIban3 = iban => sb.substr(iban, 8, 4);
	this.getOficina = iban => sb.substr(iban, 8, 4);
	this.getDC = iban => sb.substr(iban, 12, 2);
	this.getIban4 = iban => sb.substr(iban, 12, 4);
	this.getIban5 = iban => sb.substr(iban, 16, 4);
	this.getIban6 = iban => sb.substr(iban, 20, 4);
	this.getIban7 = iban => sb.substr(iban, 24, 4);
	this.getIban8 = iban => sb.substr(iban, 28, 4);

	this.creditCardNumber = function(cardNo) { //Luhn check algorithm
		cardNo = minify(cardNo);
		if (sb.size(cardNo) != 16)
			return null;

		let s = 0;
		let doubleDigit = false;
		for (let i = 15; i >= 0; i--) {
			let digit = +cardNo[i];
			if (doubleDigit) {
				digit *= 2;
				digit -= (digit > 9) ? 9 : 0;
			}
			s += digit;
			doubleDigit = !doubleDigit;
		}
		return ((s % 10) == 0) ? cardNo : null;
	}

	this.generatePassword = function(size, charSet) {
		charSet = charSet || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@&°!§%;:=^/()?*+~.,-$";
		return Array.apply(null, Array(size || 10)).map(() => charSet.charAt(Math.random() * charSet.length)).join(EMPTY); 
	}
	this.testPassword = function(pass) {
		let strength = 0;
		//Check each group independently
		strength += /[A-Z]+/.test(pass) ? 1 : 0;
		strength += /[a-z]+/.test(pass) ? 1 : 0;
		strength += /[0-9]+/.test(pass) ? 1 : 0;
		strength += /[\W]+/.test(pass) ? 1 : 0;
		//Validation for length of password
		strength += ((strength > 2) && (sb.size(pass) > 8));
		return strength; //0 = bad, 1 = week, 2-3 = good, 4 = strong, 5 = very strong
	}
}

export default new ValidatorBox();
