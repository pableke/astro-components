
const isset = val => ((typeof(val) !== "undefined") && (val !== null));
const isnum = val => ((typeof(val) === "number") || (val instanceof Number));
const round = (num, scale) => +(Math.round(num + "e+" + scale)  + "e-" + scale);

function I18n() {
	const self = this; //self instance
    let lang = "en"; //default language

    this.isset = isset;
    this.setLang = val => { lang = val; return self; } // especific language

    // String formats
    String.prototype.getHours = function() {
        return +this.substring(11, 13); //hh int format
    }
    String.prototype.isoTime = function() {
        return this.substring(11, 19); //hh:MM:ss
    }
    String.prototype.isoTimeShort = function() {
        return this.substring(11, 16); //hh:MM
    }

    this.getHours = str => str && str.getHours();
    this.isoTime = str => str && str.isoTime();
    this.isoTimeShort = str => str && str.isoTimeShort();

    // Date formats
    this.isoDate = str => str && str.substring(0, 10); //Iso string = yyyy-mm-dd
    this.esDate = str => str && (str.substring(8, 10) + "/" + str.substring(5, 7) + "/" + str.substring(0, 4)); //Iso string to dd/mm/yyyy

    // Float formats
    const options = { minimumFractionDigits: 2 };
    this.toFloat = (str, d) => { //String to Float
        if (!str)
            return null; // nada que parsear
        const separator = str.lastIndexOf(d);
        const sign = ((str.charAt(0) == "-") ? "-" : ""); // Get sign number + or -
        const whole = (separator < 0) ? str : str.substr(0, separator); //extract whole part
        const decimal = (separator < 0) ? "" : ("." + str.substr(separator + 1)); //decimal part
        const num = parseFloat(sign + whole.replace(/\D+/g, "") + decimal); //float value
        return isNaN(num) ? null : num;
    }
    this.isoFloat = (num, n) => {// Float to String formated
        return isnum(num) ? round(num, n ?? 2).toLocaleString(lang, options) : null;
    }
    this.fmtFloat = (str, dIn, n) => { // String to String formated
        return self.isoFloat(self.toFloat(str, dIn), n);
    }

    // Int formats
    this.toInt = str => { //String to Int
        if (!str)
            return null; // nada que parsear
        const sign = ((str.charAt(0) == "-") ? "-" : ""); // Get sign number + or -
        const num = parseInt(sign + str.replace(/\D+/g, "")); // Integer number
        return isNaN(num) ? null : num;
    }
    this.isoInt = num => {// Int to String formated
        return isnum(num) ? num.toLocaleString(lang) : null;
    }
    this.fmtInt = str => { // String to String formated
        return self.isoInt(self.toInt(str));
    }
}

// Extends Number prototype
Number.isset = isset;
Number.isNumber = isnum;
Number.prototype.mask = function(i) { return ((this >> i) & 1); } // check bit at i position
Number.prototype.bitor = function(flags) { return ((this & flags) > 0); } // some flags up?
Number.prototype.bitand = function(flags) { return ((this & flags) == flags); } // all flags up?
Number.prototype.round = function(digits) { return round(this, digits ?? 2); } // default round 2 decimals

// Extends Date prototype
Date.prototype.addHours = function(hours) {
    this.setHours(this.getHours() + hours);
    return this;
}
Date.prototype.diffDays = function(date) { // Days between to dates
    return Math.floor((date.getTime() - this.getTime()) / (1000 * 3600 * 24));
}

export default new I18n();
