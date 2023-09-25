
/**
 * DateBox module require
 * ArrayBox (ab)
 * 
 * @module DateBox
 */
function DateBox() {
	const self = this; //self instance
	const EMPTY = ""; //empty string
	const sysdate = new Date(); //global sysdate readonly
	const ONE_DAY = 86400000; //1d = 24 * 60 * 60 * 1000 = hours*minutes*seconds*milliseconds
	const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; //january..december

	const lpad = val => (val < 10) ? ("0" + val) : val; //always 2 digits
	//const century = () => parseInt(sysdate.getFullYear() / 100); //ej: 20
	const range = (val, min, max) => Math.min(Math.max(val || 0, min), max); //force range
	const range59 = val => range(val, 0, 59); //range for minutes and seconds
	const isLeapYear = year => ((year & 3) == 0) && (((year % 25) != 0) || ((year & 15) == 0)); //año bisiesto?
	const daysInMonth = (y, m) => daysInMonths[m] + ((m == 1) && isLeapYear(y));
	const isDate = date => date && date.getTime && !isNaN(date.getTime()); // full date validator

	function setTime(date, hh, mm, ss, ms) {
		date.setHours(range(hh, 0, 23), range59(mm), range59(ss), ms || 0);
		return isNaN(date.getTime()) ? null : date;
	}
	function toDate(yyyy, mm, dd, hh, min, ss, ms) {
		let date = new Date(); //returned instance
		date.setFullYear(yyyy, mm - 1, dd);
		return setTime(date, hh, min, ss, ms);
	}
	function fnBuild(parts) { //yyyy, mm, dd, hh, mi, ss, ms
		return toDate(+parts[0], +parts[1], +parts[2], +parts[3] || 0, +parts[4] || 0, +parts[5] || 0, +parts[6] || 0);
	}

	// Module functions
	this.isValid = isDate;
	this.sysdate = () => { sysdate.setTime(Date.now()); return sysdate; }
	this.isoSysDate = () => self.sysdate().toISOString().substring(0, 10);
	this.toDate = str => str ? new Date(str) : null;
	this.isLeap = date => date && isLeapYear(date.getFullYear());
	this.getDays = (d1, d2) => Math.round(Math.abs((d1 - d2) / ONE_DAY));
	this.daysInMonth = date => date ? daysInMonth(date.getFullYear(), date.getMonth()) : 0;
	this.toArray = date => date ? [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()] : [];
	this.reset = date => { date ? date.setFullYear(sysdate.getFullYear(), sysdate.getMonth(), sysdate.getDate()) : sysdate.setTime(Date.now()); return self; }
	this.addDate = function(date, val) { date && date.setDate(date.getDate() + val); return self; }
	this.addHours = function(date, val) { date && date.setHours(date.getHours() + val); return self; }
	this.addMs = function(date, val) { date && date.setMilliseconds(date.getMilliseconds() + val); return self; }
	this.isoDate = date => date ? date.toISOString().substring(0, 10) : null; //ej: 2021-05-01
	this.trunc = function(date) { date && date.setHours(0, 0, 0, 0); return self; }
	this.endDay = function(date) { date && date.setHours(23, 59, 59, 999); return self; }
	this.randTime = (d1, d2) => Math.floor(Math.random() * self.diffDate(d2, d1) + d1.getTime());
	this.randDate = (d1, d2) => new Date(self.randTime(d1, d2));
	this.rand = () => self.randDate(new Date(sysdate.getTime() - (ONE_DAY*30)), sysdate);
	this.clone = date => new Date((date || sysdate).getTime());
	this.build = str => str && fnBuild(str.split(/\D+/));

	this.getWeek = function(date) {
		date = date || sysdate; //default
		const d1 = new Date(date.getFullYear(), 0, 1);
		return Math.ceil((date.getDay() + 1 + self.getDays(date, d1)) / 7);
	}
	this.week = function(year, week) {
		week = week || 1; // default week = first week of year
		const firstDay = new Date(year, 0, 1); // first day of year
		const offset = (firstDay.getDay() + 6) % 7; //num days from start year and start week
		firstDay.setDate(firstDay.getDate() + (week * 7) - offset); //update date
		return firstDay; //first day of week
	}
	this.toWeek = str => str ? self.week(+str.substr(0, 4), +str.substr(6)) : null; //ej: "2021-W27"
	this.isoWeek = date => date ? (date.getFullYear() + "-W" + lpad(self.getWeek(date))) : null;

	this.toObject = function(date, lang) {
		date = date || sysdate; //default
		let D = date.getDay();
		let Y = date.getFullYear().toString();
		const flags = { yyyy: +Y, y: +Y.substr(0, 2), yy: +Y.substr(2, 2), m: date.getMonth(), d: date.getDate() };
		flags.mmm = lang.monthNamesShort[flags.m]; flags.mmmm = lang.monthNames[flags.m]; flags.mm = lpad(++flags.m);
		flags.ddd = lang.dayNamesShort[D]; flags.dddd = lang.dayNames[D]; flags.dd = lpad(flags.d);
		flags.h = date.getHours(); flags.hh = lpad(flags.h); flags.M = date.getMinutes(); flags.MM = lpad(flags.M);
		flags.s = date.getSeconds(); flags.ss = lpad(flags.s); flags.ms = date.getMilliseconds();
		flags.t = (flags.h < 12) ? "a" : "p"; flags.tt = flags.t + "m";
		return flags;
	}
	this.diff = function(d1, d2) {
		d2 = d2 || sysdate;
		if (d1 > d2) //swap
			return self.diff(d2, d1);

		const result = self.toArray(d2); //date parts
		const dias = self.daysInMonth(d2) - d2.getDate() + d1.getDate();
		const ajustes = [0, 12, dias, 24, 60, 60, 1000]; //years, months, days...

		function fnAjustar(val, i) {
			result[i] -= val;
			if (result[i] < 0) {
				result[i] += ajustes[i];
				fnAjustar(1, i-1);
			}
		}

		self.toArray(d1).forEach(fnAjustar);
		return result;
	}
	this.interval = function(date, timeleft, onTic, onTimeLeft, interval) {
		let auxdate = self.clone(date); //start date
		interval = interval || 1000; //default 1seg.
		const endDate = new Date(auxdate.getTime() + timeleft); //end date.
		const idInterval = setInterval(function() {
			self.addMs(auxdate, interval);
			if (!onTic(auxdate, endDate) || (endDate <= auxdate)) {
				clearInterval(idInterval);
				onTimeLeft && onTimeLeft();
			}
		}, interval);
		return self;
	}

	//equality operators == != === !== cannot be used to compare (the value of) dates
	this.lt = (d1, d2) => isDate(d1) && isDate(d2) && (d1.getTime() < d2.getTime());
	this.le = (d1, d2) => isDate(d1) && isDate(d2) && (d1.getTime() <= d2.getTime());
	this.eq = (d1, d2) => isDate(d1) && isDate(d2) && (d1.getTime() == d2.getTime());
	this.ge = (d1, d2) => isDate(d1) && isDate(d2) && (d1.getTime() >= d2.getTime());
	this.gt = (d1, d2) => isDate(d1) && isDate(d2) && (d1.getTime() > d2.getTime());
	this.multicmp = names => names.map(name => ((a, b) => self.cmp(a[name], b[name])));
	this.diffDate = (d1, d2) => (d1.getTime() - d2.getTime());
	this.cmp = function(d1, d2) {
		if (d1 && d2)
			return self.diffDate(d1, d2);
		return d1 ? -1 : 1; //nulls last
	}

	this.inYear = (d1, d2) => isDate(d1) && isDate(d2) && (d1.getFullYear() == d2.getFullYear());
	this.inMonth = (d1, d2) => self.inYear(d1, d2) && (d1.getMonth() == d2.getMonth());
	this.inDay = (d1, d2) => self.inMonth(d1, d2) && (d1.getDate() == d2.getDate());
	this.inHour = (d1, d2) => self.inDay(d1, d2) && (d1.getHours() == d2.getHours());
	this.geToday = date => self.inDay(date, sysdate) || self.ge(date, sysdate);
	this.future = date => self.gt(date, sysdate);
	this.past = date => self.lt(date, sysdate);

	function fnBetween(date, min, max) { // value into a range
		const time = date.getTime();
		min = isDate(min) ? min.getTime() : time;
		max = isDate(max) ? max.getTime() : time;
		return (min <= time) && (time <= max);
	}
	this.in = (date, min, max) => isDate(date) ? fnBetween(date, min, max) : true; // Open range filter
	this.between = (date, min, max) => isDate(date) && fnBetween(date, min, max); // Date into a range

	const fnMinTime = date => lpad(date.getHours()) + ":" + lpad(date.getMinutes()); //hh:MM
	const fnIsoTime = date => fnMinTime(date) + ":" + lpad(date.getSeconds()); //hh:MM:ss
	this.minTime = date => date ? fnMinTime(date) : null; //hh:MM
	this.isoTime = date => date ? fnIsoTime(date) : null; //hh:MM:ss
	this.acTime = str => str && str.replace(/(\d\d)(\d+)$/g, "$1:$2").replace(/[^\d\:]/g, EMPTY);
	this.toTime = function(str) {
		let parts = str && str.split(/\D+/); //at least hours required
		return parts ? setTime(new Date(), parts[0], parts[1], parts[2], parts[3]) : null;
	}
	this.fmtMinTime = str => str && str.substr(11, 5);
	this.fmtTime = str => str && str.substr(11, 8);

	// English
	const fnEnDate = date => date.getFullYear() + "-" + lpad(date.getMonth() + 1) + "-" + lpad(date.getDate()); //yyyy-mm-dd
	this.enDate = str => str ? toDate(str.substring(0, 4), str.substring(5, 7), str.substring(8, 10)) : null; //parse to Date object
	this.isoEnDate = date => isDate(date) ? fnEnDate(date) : null; //yyyy-mm-dd
	this.isoEnDateTime = date => isDate(date) ? (fnEnDate(date) + " " + fnIsoTime(date)) : null; //yyyy-mm-dd hh:MM:ss
	//this.fmtEnDate = str => str && str.substr(0, 10); //Iso string to yyyy-mm-dd
	//this.acEnDate = str => str && str.replace(/^(\d{4})(\d+)$/g, "$1-$2").replace(/^(\d{4}\-\d\d)(\d+)$/g, "$1-$2").replace(/[^\d\-]/g, EMPTY);

	// Spanis
	const fnEsDate = date => lpad(date.getDate()) + "/" + lpad(date.getMonth() + 1) + "/" + date.getFullYear(); //dd/mm/yyyy
	this.esDate = str => str ? toDate(str.substring(6, 10), str.substring(3, 5), str.substring(0, 2)) : null; //parse to Date object
	this.isoEsDate = date => isDate(date) ? fnEsDate(date) : null; //dd/mm/yyyy
	this.isoEsDateTime = date => isDate(date) ? (fnEsDate(date) + " " + fnIsoTime(date)) : null; //dd/mm/yyyy hh:MM:ss
	//this.fmtEsDate = str => str && (str.substring(8, 10) + "/" + str.substring(5, 7) + "/" + str.substring(0, 4)); //Iso string to dd/mm/yyyy
	//this.acEsDate = str => str && str.replace(/^(\d\d)(\d+)$/g, "$1/$2").replace(/^(\d\d\/\d\d)(\d+)$/g, "$1/$2").replace(/[^\d\/]/g, EMPTY);

	// Extends Date prototype
	Date.prototype.toJSON = function() { // Override toJSON to ignore TZ-offset
		return fnEnDate(this) + "T" + fnIsoTime(this) + "." + this.getMilliseconds(); //yyyy-mm-ddThh:MM:ss.ms
	}
}

export default new DateBox();
