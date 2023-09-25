
function NumberBox() {
	const self = this; //self instance
	const EMPTY = ""; //empty string
	const ZERO = "0"; //left decimals zeros
	const DOT = "."; //floats separator
	const COMMA = ","; //floats separator

	// Helpers
	const isset = val => (typeof(val) !== "undefined") && (val !== null); // Is defined var
	const fnWhole = str => str.replace(/\D+/g, EMPTY); // Extract whole part
	const fnTrim0 = str => fnWhole(str).replace(/^0+(\d+)/, "$1"); // Extract whole part withot left zeros
	const fnSign = str => ((str.charAt(0) == "-") ? "-" : EMPTY); // Get sign number + or -
	function chunk(str, separator) {
		let i = str.length; // index
		let output = (i > 2) ? str.substring(i - 3, i) : str;
		for (i -= 3; i > 3; i -= 3)
			output = str.substring(i - 3, i) + separator + output;
		return (i > 0) ? (str.substring(0, i) + separator + output) : output;
	}

	const fnBetween = (num, min, max) => (min <= num) && (num <= max);
	this.between = (num, min, max) => fnBetween(num, min ?? num, max = max ?? num);
	this.in = (num, min, max) => num ? self.between(num, min, max) : true; // Open range filter
	this.range = (val, min, max) => Math.min(Math.max(val, min), max); //force in range
	this.min = (val, min) => self.range(val, min || 0, val); //force val into [min to val]
	this.max = (val, max) => self.range(val, 0, max); //force val into [0 to max]
	this.dec = (val, min) => self.min(val - 1, min); //dec value into a range
	this.inc = (val, max) => self.max(val + 1, max); //inc value into a range
	this.mask = (val, i) => ((val >> i) & 1); // check bit at i position
	this.bitor = (val, flags) => ((val & flags) > 0); // some flags up?
	this.bitand = (val, flags) => ((val & flags) == flags); // all flags up?

	this.round = function(num, d) {
		d = isset(d) ? d : 2; //default 2 decimals
		return +(Math.round(num + "e" + d) + "e-" + d);
	}
	this.eq2 = (num1, num2) => isset(num1) && (self.round(num1) == self.round(num2));
	this.eq3 = (num1, num2) => isset(num1) && (self.round(num1, 3) == self.round(num2, 3));
	this.eq01 = (num1, num2) => fnBetween(num1 - num2, -.01, .01); //reange +-0.01f

	this.lt0 = num => isset(num) && (num < 0);
	this.le0 = num => isset(num) && (num <= 0);
	this.gt0 = num => isset(num) && (num > 0);
	//this.gt2 = (num1, num2) => isset(num1) && (self.round(num1) > self.round(num2));
	this.multicmp = names => names.map(name => ((a, b) => self.cmp(a[name], b[name])));
	this.cmp = function(n1, n2) {
		if (isset(n1) && isset(n2))
			return n1 - n2;
		return isset(n1) ? -1 : 1; //nulls last
	}

	this.rand = (min, max) => Math.random() * ((max || 1e9) - min) + min;
	this.randInt = (min, max) => Math.floor(self.rand(min || 0, max));

	// Integers
	this.toInt = function(str) { // String to Integer
		if (str) {
			let num = parseInt(fnSign(str) + fnWhole(str));
			return isNaN(num) ? null : num;
		}
		return null; // not number
	}

	function fnInt(str, s) {
		let sign = fnSign(str);
		let whole = fnTrim0(str);
		return whole ? (sign + chunk(whole, s)) : null;
	}
	this.isoInt = (val, s) => isset(val) ? fnInt(EMPTY + val, s) : null;
	this.enIsoInt = val => self.isoInt(val, COMMA); // Integer to EN String format
	this.esIsoInt = val => self.isoInt(val, DOT); // Integer to ES String format

	this.fmtInt = (str, s) => str && fnInt(str, s); // String (representing int) to String formated
	this.enFmtInt = str => self.fmtInt(str, COMMA); // reformat EN String
	this.esFmtInt = str => self.fmtInt(str, DOT); // reformat ES String
	this.intval = str => parseInt(str) || 0; //integer
	this.numbers = arr => arr ? arr.map(self.intval) : arr;

	// Floats
	this.toFloat = function(str, d) { //String to Float
		if (str) {
			let sign = fnSign(str);
			let separator = str.lastIndexOf(d);
			let whole = (separator < 0) ? str : str.substr(0, separator); //extract whole part
			let decimal = (separator < 0) ? EMPTY : (DOT + str.substr(separator + 1)); //decimal part
			let num = parseFloat(sign + fnWhole(whole) + decimal); //float value
			return isNaN(num) ? null : num;
		}
		return null; // not number
	}
	this.enFloat = str => self.toFloat(str, DOT); // EN String format to Float
	this.esFloat = str => self.toFloat(str, COMMA); // ES String format to Float

	function fnFloat(str, s, d, n, dIn) {
		n = isNaN(n) ? 2 : n; //number of decimals
		let sign = fnSign(str);
		let separator = str.lastIndexOf(dIn); //decimal separator
		let whole = (separator > 0) ? str.substr(0, separator) : str;
		whole = (separator == 0) ? ZERO : fnTrim0(whole);
		if (whole) { //exists whole part?
			let decimal = (separator < 0) ? ZERO : str.substr(separator + 1, n); //extract decimal part
			return sign + chunk(whole, s) + d + ((separator < 0) ? ZERO.repeat(n) : decimal.padEnd(n, ZERO));
		}
		return null;
	}
	this.isoFloat = (val, s, d, n) => isset(val) ? fnFloat(EMPTY + self.round(val, n), s, d, n, DOT) : null; // Float to String formated
	this.enIsoFloat = (val, n) => self.isoFloat(val, COMMA, DOT, n); // EN String format to Float
	this.esIsoFloat = (val, n) => self.isoFloat(val, DOT, COMMA, n); // ES String format to Float

	this.fmtFloat = (str, s, d, n) => str && fnFloat(str, s, d, n, d); // String to String formated
	this.enFmtFloat = (str, n) => self.fmtFloat(str, COMMA, DOT, n); // reformat EN String
	this.isoFloatToEnFmt = self.enFmtFloat; // EN ISO-String to EN String formated
	this.esFmtFloat = (str, n) => self.fmtFloat(str, DOT, COMMA, n); // reformat ES String
	this.isoFloatToEsFmt = (str, n) => str && fnFloat(str, DOT, COMMA, n, DOT); // EN ISO-String to ES String formated
	this.floatval = str => parseFloat(str) || 0; //float

	// Booleans
	this.boolval = val => val && (val !== "false") && (val !== "0");
	this.enBool = val => self.boolval(val) ? "Yes" : "No";
	this.esBool = val => self.boolval(val) ? "Sí" : "No";
}

export default new NumberBox();
