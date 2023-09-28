
function StringBox() {
	const self = this; //self instance
	const EMPTY = ""; //empty string
	const ESCAPE_HTML = /"|'|&|<|>|\\/g;
	const ESCAPE_MAP = { '"': "&#34;", "'": "&#39;", "&": "&#38;", "<": "&#60;", ">": "&#62;", "\\": "&#92;" };
	const TR1 = "àáâãäåāăąÀÁÂÃÄÅĀĂĄÆßèéêëēĕėęěÈÉĒĔĖĘĚìíîïìĩīĭÌÍÎÏÌĨĪĬòóôõöōŏőøÒÓÔÕÖŌŎŐØùúûüũūŭůÙÚÛÜŨŪŬŮçÇñÑþÐŔŕÿÝ";
	const TR2 = "aaaaaaaaaAAAAAAAAAABeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIoooooooooOOOOOOOOOuuuuuuuuUUUUUUUUcCnNdDRryY";

	// Helpers
	const fnLower = str => tr(str).toLowerCase(); // translate and lower
	const isstr = val => (typeof(val) === "string") || (val instanceof String);
	const iiOf = (str1, str2) => fnLower(str1).indexOf(fnLower(str2));
	const fnWord = str => str.replace(/\W+/g, EMPTY); //remove no alfanum
	const fnSize = str => str ? str.length : 0; //string o array
	const replaceAt = (str1, str2, i) => str1.substring(0, i) + str2 + str1.substring(i + str2.length);
	
	function tr(str) {
		const size = fnSize(str);
		var output = str || EMPTY;
		for (let i = 0; i < size; i++) {
			let j = TR1.indexOf(str.charAt(i)); // is char remplazable
			output = (j < 0) ? output : replaceAt(output, TR2.charAt(j), i);
		}
		return output;
	}

	// Module functions
	this.isstr = isstr;
	this.size = fnSize;
	this.trLower = fnLower;
	this.trUpper = str => tr(str).toUpperCase();
	this.lower = str => str ? str.toLowerCase(str) : str;
	this.upper = str => str ? str.toUpperCase(str) : str;
	this.substr = (str, i, n) => str ? str.substr(i, n) : str;
	this.substring = (str, i, j) => str ? str.substring(i, j) : str;
	this.indexOf = (str1, str2) => str1 ? str1.indexOf(str2) : -1;
	this.lastIndexOf = (str1, str2) => str1 ? str1.lastIndexOf(str2) : -1;
	this.prevIndexOf = (str1, str2, i) => str1 ? str1.substr(0, i).lastIndexOf(str2) : -1;
	this.starts = (str1, str2) => str1 && str1.startsWith(str2);
	this.ends = (str1, str2) => str1 && str1.endsWith(str2);
	this.prefix = (str1, str2) => self.starts(str1, str2) ? str1 : (str2 + str1);
	this.suffix = (str1, str2) => self.ends(str1, str2) ? str1 : (str1 + str2);
	this.trunc = (str, size) => (fnSize(str) > size) ? (str.substr(0, size).trim() + "...") : str;

	this.trim = str => str ? str.trim() : str;
	this.ltrim = (str, str2) => str ? str.replace(new RegExp("^" + str2 + "+"), EMPTY) : str;
	this.rtrim = (str, str2) => str ? str.replace(new RegExp(str2 + "+$"), EMPTY) : str;
	this.rand = size => Math.random().toString(36).substring(2, 2 + (size || 8)); //random char

	this.escape = str => str && str.replace(ESCAPE_HTML, matched => ESCAPE_MAP[matched]);
	this.unescape = str => str && str.replace(/&#(\d+);/g, (key, num) => String.fromCharCode(num));

	//chunk string in multiple parts
	this.test = (str, re) => re.test(str) ? str : null;
	this.split = (str, sep) => str ? str.trim().split(sep) : null;
	this.match = (str, re) => str ? str.trim().match(re) : null;
	this.array = str => self.split(str, ",");
	this.lastId = str => +self.match(str, /\d+$/).pop();
	this.chunk = (str, size) => self.match(str, new RegExp(".{1," + size + "}", "g"));

	// Date iso string handlers (ej: "2022-05-11T12:05:01")
	const fnEnDate = str => str.substring(0, 10); //yyyy-mm-dd
	const fnBetween = (str, min, max) => ((min <= str) && (str <= max));
	this.toDate = str => str ? new Date(str) : null;
	this.inYear = (str1, str2) => self.substring(str1, 0, 4) == self.substring(str2, 0, 4);
	this.inMonth = (str1, str2) => self.substring(str1, 0, 7) == self.substring(str2, 0, 7);
	this.inDay = (str1, str2) => self.substring(str1, 0, 10) == self.substring(str2, 0, 10);
	this.inHour = (str1, str2) => self.substring(str1, 0, 13) == self.substring(str2, 0, 13);
	this.diffDate = (str1, str2) => (Date.parse(str1) - Date.parse(str2));
	this.startDay = str => str ? (fnEnDate(str) + "T00:00:00.0") : str;
	this.endDay = str => str ? (fnEnDate(str) + "T23:59:59.999") : str;
	this.isoDate = str => str && fnEnDate(str); //yyyy-mm-dd
	this.isoTime = str => str && str.substring(11, 19); //hh:MM:ss
	this.isoDateTime = (date, time) => (date + "T" + time + ".0"); //yyyy-mm-ddThh:MM:ss.0
	this.esDate = str => str && (str.substring(8, 10) + "/" + str.substring(5, 7) + "/" + str.substring(0, 4)); //Iso string to dd/mm/yyyy
	/****************** End Date helpers ******************/

	this.clean = str => str ? str.replace(/\s+/g, EMPTY) : str;
	this.minify = str => str ? str.trim().replace(/\s+/g, " ") : str;
	this.toWord = str => str ? fnWord(str) : str;
	this.toCode = str => str ? fnWord(str).toUpperCase() : str;
	this.lines = str => self.split(str, /[\n\r]+/);
	this.words = str => self.split(str, /\s+/);

	const fnCmp = (a, b) => ((a < b) ? -1 : ((a > b) ? 1 : 0));
	this.cmp = (a, b) => fnCmp(a ?? EMPTY, b ?? EMPTY); //compare strings
	this.cmpBy = (a, b, name) => self.cmp(a[name], b[name]); // compare objects prop.
	this.eq = (str1, str2) => (fnLower(str1) == fnLower(str2)); // insensitive equal
	this.ilike = (str1, str2) => (iiOf(str1, str2) > -1); // insensitive like
	this.olike = (obj, names, val) => names.some(name => self.ilike(obj[name], val));
	this.alike = (obj, names, val) => self.words(val).some(v => self.olike(obj, names, v));
	this.multilike = (obj, filter, names) => names.every(name => self.ilike(obj[name], filter[name]));
	this.multicmp = names => names.map(name => ((a, b) => self.cmp(a[name], b[name]))); // map => cmp functions
	this.between = (value, min, max) => value && fnBetween(value, min || value, max || value); // Value must exists
	this.in = (value, min, max) => value ? fnBetween(value, min || value, max || value) : true; // Open range filter

	// Formaters, renders and parsers
	this.format = function(tpl, data) {
		return tpl.replace(/@(\w+);/g, (m, k) => data[k] ?? EMPTY);
	}
	this.render = function(tpl, list, fnRender) {
		fnRender = fnRender || (data => data);
		const size = fnSize(list);
		let output = EMPTY; // Initialize result
		for (let i = 0; i < size; i++)
			output += self.format(tpl, fnRender(list[i], i, list));
		return output;
	}
	this.entries = function(tpl, data) {
		let output = EMPTY; //result buffer
		for (const k in data)
			output += tpl.replace("@value;", k).replace("@label;", data[k]);
		return output;
	}
}

export default new StringBox();
