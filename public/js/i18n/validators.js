
import i18n from "./main/langs.js";
import entidades from "../data/entidades.js";

// HTML special chars
const ESCAPE_HTML = /"|'|&|<|>|\\/g;
const ESCAPE_MAP = { '"': "&#34;", "'": "&#39;", "&": "&#38;", "<": "&#60;", ">": "&#62;", "\\": "&#92;" };
const sysdate = (new Date()).toISOString();

// RegEx for validating
/*const RE_IPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
const RE_IPv6 = /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/;
const RE_URL = /(http|fttextp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
// Cards Numbers
const RE_VISA = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
const RE_MASTER_CARD = /^(?:5[1-5][0-9]{14})$/;
const RE_AMEX = /^(?:3[47][0-9]{13})$/;
const RE_DISCOVER = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
const RE_DINER_CLUB = /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/;
const RE_JCB = /^(?:(?:2131|1800|35\d{3})\d{11})$/;*/

i18n.unescape = str => str ? str.replace(/&#(\d+);/g, (key, num) => String.fromCharCode(num)) : null;
i18n.escape = str => str ? str.trim().replace(ESCAPE_HTML, (matched) => ESCAPE_MAP[matched]) : null;

i18n.gt0 = (name, value, msg) => (value && (value > 0)) || !i18n.setError(msg || "errGt0", name); // required gt0
i18n.ge0 = (name, value, msg) => !value || (value > 0) || !i18n.setError(msg || "errGt0", name); // optional or gt0
i18n.max = (name, value, max, msg) => !value || (value.length <= max) || !i18n.setError(msg || "errMaxlength", name); // optional or length <= max
i18n.isKey = (name, value, msg) => { // Required DB-key
	if (!value)
		return !i18n.setError("errRequired", name);
	return (value > 0) || !i18n.setError(msg || "notFound", name);
}

i18n.size = (name, value, max, msg) => { // required and length <= max
	if (!value) // String length validations
		return !i18n.setError("errRequired", name);
	max = max ?? 1000; // Default max size == 1000
	if (value.length > max)
		return !i18n.setError(msg || "errMaxlength", name);
	return true;
}
i18n.size20 = (name, value, msg) => i18n.size(name, value, 20, msg);
i18n.size50 = (name, value, msg) => i18n.size(name, value, 50, msg);
i18n.size100 = (name, value, msg) => i18n.size(name, value, 100, msg);
i18n.size200 = (name, value, msg) => i18n.size(name, value, 200, msg);
i18n.size250 = (name, value, msg) => i18n.size(name, value, 250, msg);
i18n.size500 = (name, value, msg) => i18n.size(name, value, 500, msg);

i18n.isEmail = (name, value, msg) => {
	if (!i18n.size(name, value, 200))
		return false;
	if (!/\w+[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) // RE_MAIL format
		return !i18n.setError(msg || "errCorreo", name); // not valid
	return true;
}
i18n.isLogin = (name, value, msg) => { // Loggin / Password / Code
	if (!i18n.size(name, value, 200))
		return false;
	if (value.length < 8)
		return !i18n.setError("errMinlength8", name); // min length
	if (!/^[\w#@&°!§%;:=\^\/\(\)\?\*\+\~\.\,\-\$]{6,}$/.test(value)) // RE_LOGIN format
		return !i18n.setError(msg || "errFormat", name); // not valid
	return true;
}

i18n.word = (name, value, msg) => {
	if (!i18n.size(name, value, 50))
		return false;
	if (!/\w+/.test(value)) // RE_WORD format
		return !i18n.setError(msg || "errFormat", name); // not valid
	return true;
}
i18n.words = (name, value, msg) => {
	if (!i18n.size(name, value, 200))
		return false;
	if (!/^\w+(,\w+)*$/.test(value)) // RE_WORDS format
		return !i18n.setError(msg || "errFormat", name); // not valid
	return true;
}
i18n.digits = (name, value, msg) => {
	if (!i18n.size(name, value, 20))
		return false;
	if (!/^[1-9]\d*$/.test(value)) // RE_DIGITS format
		return !i18n.setError(msg || "errFormat", name); // not valid
	return true;
}
i18n.numbers = (name, value, msg) => {
	if (!i18n.size(name, value, 200))
		return false;
	if (!/^\d+(,\d+)*$/.test(value)) // RE_NUMBERS format
		return !i18n.setError(msg || "errFormat", name); // not valid
	return true;
}

// Date validations in string iso format (ej: "2022-05-11T12:05:01")
i18n.isDate = (name, value, msg) => {
	if (!value) // iso date validation
		return !i18n.setError("errRequired", name); // required
	if (!/^\d{4}-[01]\d-[0-3]\d/.test(value)) // RE_DATE format
		return !i18n.setError(msg || "errDate", name); // not valid
	return true;
}
i18n.isTime = (name, value, msg) => {
	if (!value) // iso date validation
		return !i18n.setError("errRequired", name); // required
	if (!/[0-2]\d:[0-5]\d:[0-5]\d[\.\d{1,3}]?$/.test(value)) // RE_TIME format
		return !i18n.setError(msg || "errDate", name); // not valid
	return true;
}
i18n.isDateTime = (name, value, msg) => {
	if (!value) // iso date validation
		return !i18n.setError("errRequired", name); // required
	if (!/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d{1,3}Z$/.test(value)) // RE_DATE_TIME format
		return !i18n.setError(msg || "errDate", name); // not valid
	return true;
}
i18n.leToday = (name, value, msg) => {
	if (!i18n.isDate(name, value))
		return false;
	if (value.substring(0, 10) > sysdate.substring(0, 10))
		return !i18n.setError(msg || "errDateLe", name); // not in time
	return true;
}
i18n.geToday = (name, value, msg) => {
	if (!i18n.isDate(name, value))
		return false;
	if (value.substring(0, 10) < sysdate.substring(0, 10))
		return !i18n.setError(msg || "errDateGe", name); // not in time
	return true;
}

// Persons ID's
function fnLetraDni(value) {
	const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
	const letra = letras.charAt(parseInt(value, 10) % 23);
	return (letra == value.charAt(8));
}
i18n.isDni = function(name, value) {
	if (!value)
		return !i18n.setError("errRequired", name);
	if (!/^(\d{8})([A-Z])$/.test(value) || !fnLetraDni(value)) // RE_DNI
		return !i18n.setError("errNif", name);
	return true;
}
i18n.isCif = function(name, value) {
	if (!value)
		return !i18n.setError("errRequired", name);
	const match = value.match(/^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/); // RE_CIF
	if (!match || (match.length < 2))
		return !i18n.setError("errNif", name);

	var letter = match[1];
	var number  = match[2];
	var control = match[3];
	var sum = 0;

	for (let i = 0; i < number.length; i++) {
		let n = parseInt(number[i], 10);
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
	return ok || !i18n.setError("errNif", name);
}
i18n.isNie = function(name, value) {
	if (!value) // RE_NIE = /^[XYZ]\d{7,8}[A-Z]$/;
		return !i18n.setError("errRequired", name);
	const prefix = value.charAt(0); //Change the initial letter for the corresponding number and validate as DNI
	let p0 = (prefix == "X") ? 0 : ((prefix == "Y") ? 1 : ((prefix == "Z") ? 2 : prefix));
	return fnLetraDni(p0 + value.substr(1)) || !i18n.setError("errNif", name);
}
i18n.idES = function(name, value) {
	return i18n.isDni(name, value) || i18n.isCif(name, value) || i18n.isNie(name, value);
}

// Bancks entities and credit cards
i18n.isIban = function(name, iban) {
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

	let code = iban && iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/);
	if (!code || (iban.length !== CODE_LENGTHS[code[1]]))
		return !i18n.setError("errRequired", name);

	let digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, letter => (letter.charCodeAt(0) - 55));
	let digital = digits.toString();
	let checksum = digital.slice(0, 2);
	for (let offset = 2; offset < digital.length; offset += 7) {
		let fragment = checksum + digital.substring(offset, offset + 7);
		checksum = parseInt(fragment, 10) % 97;
	}
	return (checksum === 1) || !i18n.setError("errFormat", name);
}
i18n.isSwift = (name, value, msg) => {
	if (!value) // iso date validation
		return !i18n.setError("errRequired", name); // required
	if (!/^[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}$/.test(value)) // RE_SWIFT / RE_BIC format
		return !i18n.setError(msg || "errDate", name); // not valid
	return true;
}

i18n.getEntidades = () => entidades;
i18n.getIban1 = iban => iban && iban.substring(0, 4);
i18n.getIban2 = iban => iban && iban.substring(4, 8);
i18n.getEntidad = iban => entidades[i18n.getIban2(iban)];
i18n.getIban3 = iban => iban && iban.substring(8, 12);
i18n.getOficina = iban => iban && iban.substring(8, 12);
i18n.getDC = iban => iban && iban.substring(12, 14);

i18n.isCreditCardNumber = function(name, cardNo) { //Luhn check algorithm
	if (!cardNo || (cardNo.length != 16))
		return !i18n.setError("errRequired", name);

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
	return ((s % 10) == 0) || !i18n.setError("errFormat", name);;
}

i18n.generatePassword = function(size, charSet) {
	charSet = charSet || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@&°!§%;:=^/()?*+~.,-$";
	return Array.apply(null, Array(size || 10)).map(() => charSet.charAt(Math.random() * charSet.length)).join(""); 
}
i18n.testPassword = function(pass) {
	let strength = 0;
	//Check each group independently
	strength += /[A-Z]+/.test(pass) ? 1 : 0;
	strength += /[a-z]+/.test(pass) ? 1 : 0;
	strength += /[0-9]+/.test(pass) ? 1 : 0;
	strength += /[\W]+/.test(pass) ? 1 : 0;
	//Validation for length of password
	strength += ((strength > 2) && (pass.length > 8));
	return strength; //0 = bad, 1 = week, 2-3 = good, 4 = strong, 5 = very strong
}

export default i18n;
