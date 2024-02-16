
import api from "./Api.js";
import alerts from "./Alerts.js";
import Table from "./Table.js";
import Datalist from "./Datalist.js";
import Autocomplete from "./Autocomplete.js";
import i18n from "../i18n/langs.js";

const divNull = document.createElement("div");

export default function(form, opts) {
	form = isstr(form) ? document.forms.findOne(form) : form; // Find by name
	opts = opts || {}; // default options

	opts.defaultMsgOk = opts.defaultMsgOk || "saveOk"; // default key for message ok
	opts.defaultMsgError = opts.defaultMsgError || "errForm"; // default key error

	opts.dateClass = opts.dateClass || "ui-date"; // Date type
	opts.boolClass = opts.boolClass || "ui-bool"; // Boolean type
	opts.checkAllClass = opts.checkAllClass || "ui-check-all"; // Check all related checkboxes
	opts.floatFormatClass = opts.floatFormatClass || "ui-float"; // Float i18n
	opts.integerFormatClass = opts.integerFormatClass || "ui-integer"; // Integer i18n
	opts.numberFormatClass = opts.numberFormatClass || "ui-number"; // Number type
	opts.inputErrorClass = opts.inputErrorClass || "ui-error"; // Input error styles
	opts.tipErrorClass = opts.tipErrorClass || "ui-errtip"; // Tip error style
	opts.groupSelector = opts.groupSelector || "label"; // Parent container (ej: .ui-group)
	opts.negativeNumClass = opts.negativeNumClass || "text-red"; // Negative numbers styles

	const self = this; //self instance
	const EMPTY = ""; // Empty string
	const INPUTS = "input:not([type=hidden]),select,textarea"; // All input fields
	const FOCUSABLED = "[tabindex]:not([type=hidden],[readonly],[disabled])";

	this.focus = el => { el && el.focus(); return self; }
	this.setFocus = selector => self.focus(self.getInput(selector));
	this.autofocus = () => self.focus(form.elements.find(el => el.isVisible(FOCUSABLED)));
	this.getInput = selector => form.elements.findOne(selector); // find an element
	this.getInputs = selector => form.elements.query(selector); // filter elements
	this.querySelector = selector => form.querySelector(selector); // Child element

	// Alerts helpers
	this.loading = () => { alerts.loading(); return self; } // Encapsule loading frame
	this.showOk = msg => { alerts.showOk(msg); return self; } // Encapsule showOk message
	this.showInfo = msg => { alerts.showInfo(msg); return self; } // Encapsule showInfo message
	this.showWarn = msg => { alerts.showWarn(msg); return self; } // Encapsule showWarn message
	this.showError = msg => { alerts.showError(msg); return self; } // Encapsule showError message
	this.showAlerts = data => { alerts.showAlerts(data); return self; } // Encapsule showAlerts message

	// Actions to update form view (inputs, texts, ...)
	const fnContains = (el, name) => el.classList.contains(name);
	const fnFor = (list, fn) => { list.forEach(fn); return self; }
	const fnEach = (selector, fn) => fnFor(form.querySelectorAll(selector), fn);
	const fnUpdate = (selector, fn) => {
		selector = selector || INPUTS; // Default = inputs type
		return fnFor(form.elements, el => el.matches(selector) && fn(el));
	}

	this.html = selector => form.querySelector(selector).innerHTML;
	this.text = (selector, text) => { form.querySelectorAll(selector).text(text); return self; } // Update all texts info in form
	this.render = (selector, data) => { // HTMLElement.prototype.render is implemented in Collection component
		data = data || i18n.getLang(); // Default data = current language
		return fnEach(selector, el => el.render(data)); // Render each element
	}

	this.hide = selector => { form.querySelectorAll(selector).hide(); return self; }
	this.show = selector => { form.querySelectorAll(selector).show(); return self; }
	this.toggle = (selector, force) => force ? self.show(selector) : self.hide(selector);
	this.disabled = (force, selector) => fnUpdate(selector, el => el.setDisabled(force));
	this.readonly = (force, selector) => fnUpdate(selector, el => el.setReadonly(force));
	this.eachInput = (selector, fn) => fnUpdate(selector, fn);

	// Value property
	const fnNumber = (el, value) => {
		el.value = value || EMPTY; // Show formatted value and style
		el.classList.toggle(opts.negativeNumClass, el.value.startsWith("-"));
	}
	function fnValue(el, value) {
		if ((el.tagName == "SELECT") && !value)
			el.selectedIndex = 0;
		else
			el.value = value || EMPTY; // String
		return self;
	}
	function fnSetValue(el, value) {
		if (el.type =="date") // input type = date
			el.value = value ? value.substring(0, 10) : EMPTY;
		else if (fnContains(el, opts.floatFormatClass))
			fnNumber(el, i18n.isoFloat(value));
		else if (fnContains(el, opts.integerFormatClass))
			fnNumber(el, i18n.isoInt(value));
		else if (fnContains(el, opts.boolClass))
			el.value = i18n.boolval(value);
		else if (el.type === "checkbox") // Array type
			el.checked = value && value.includes(el.value);
		else if (el.type === "radio")
			el.checked = (el.value == value);
		else
			fnValue(el, value)
		return fnSetInputOk(el);
	}
	this.setValue = (el, value) => el ? fnSetValue(el, value) : self;
	this.setval = (selector, value) => self.setValue(self.getInput(selector), value);
	this.setData = (data, selector) => fnUpdate(selector, el => fnSetValue(el, data[el.name]));

	function fnParseValue(el) {
		if (fnContains(el, opts.floatFormatClass))
			return i18n.toFloat(el.value); // Float
		if (fnContains(el, opts.integerFormatClass))
			return i18n.toInt(el.value); // Integer
		if (fnContains(el, opts.numberFormatClass))
			return el.value ? +el.value : null; // Number type directly
		return el.value && el.value.trim(); // String trimed by default
	}
	this.getValue = el => el && fnParseValue(el);
	this.getval = selector => self.getInput(selector).value;
	this.valueOf = selector => self.getValue(self.getInput(selector));
	this.getData = selector => { // View to JSON
		const data = {}; // Results container
		fnUpdate(selector, el => {
			if (!el.name)
				return; // No value to save
			if ((el.type === "checkbox") && el.checked) {
				data[el.name] = data[el.name] || [];
				data[el.name].push(el.value); // Array type
			}
			else
				data[el.name] = fnParseValue(el);
		});
		return data;
	}

	this.copy = (el1, el2) => fnValue(self.getInput(el1), self.getval(el2));
	this.reset = selector => fnUpdate(selector, el => fnValue(el)); // reset inputs value (hidden to)
	this.restart = selector => { const el = self.getInput(selector); el.focus(); return fnValue(el); } // remove value + focus

	// Inputs helpers
	this.setTable = (selector, opts) => new Table(form.querySelector(selector), opts); // table
	this.stringify = (selector, data) => self.setval(selector, JSON.stringify(data));
	this.saveTable = (selector, table) => self.stringify(selector, table.getData());
	this.setDatalist = (selector, opts) => new Datalist(form.querySelector(selector), opts); // select / optgroup
	this.setAutocomplete = (selector, opts) => new Autocomplete(self.getInput(selector), opts); // Input type text / search
	this.setAcItems = (selector, fnSource, fnSelect, fnReset) => {
		return self.setAutocomplete(selector, {
			minLength: 4,
			source: fnSource,
			render: item => item.label,
			select: item => item.value,
			afterSelect: fnSelect,
			onReset: fnReset
		});
	}

	this.setDateRange = (f1, f2) => {
		f1 = isstr(f1) ? self.getInput(f1) : f1;
		f2 = isstr(f2) ? self.getInput(f2) : f2;
		f1.addEventListener("blur", ev => f2.setAttribute("min", f1.value));
		return fnEvent(f2, "blur", ev => f1.setAttribute("max", f2.value));
	}

	this.toggleOptions = function(selector, flags) {
		const select = self.getInput(selector); // Get select element
		const option = select.options[select.selectedIndex]; //get current option
		select.options.forEach((option, i) => option.toggle(flags.mask(i)));
		if (option && option.isHidden()) // is current option hidden?
			select.selectedIndex = select.options.findIndex(el => !el.isHidden());
		return self;
	}
	this.getOptionText = function(selector) {
		const select = self.getInput(selector); // Get select element
		const option = select.options[select.selectedIndex]; //get current option
		return option?.innerHTML; //get current option text
	}

	// Events handlers
	const fnEvent = (el, name, fn) => {
		el.addEventListener(name, fn);
		return self;
	}
	this.change = fn => fnEvent(form, "change", fn);
	this.submit = fn => fnEvent(form, "submit", fn);
	this.beforeReset = fn => fnEvent(form, "reset", fn);
	this.afterReset = fn => fnEvent(form, "reset", ev => setTimeout(() => fn(ev), 1));
	this.setClick = (selector, fn) => fnEach(selector, el => el.addEventListener("click", fn))
	this.click = selector => { form.querySelector(selector).click(); return self; } // Fire event only for PF

	this.onChangeInput = (selector, fn) => {
		return fnEvent(self.getInput(selector), "change", fn);
	}
	this.onChangeFile = (selector, fn) => {
		const reader = new FileReader();
		return self.onChangeInput(selector, ev => {
			const el = ev.target; // file input elem
			let index = 0; // position
			let file = el.files[index];
			const fnRead = () => reader.readAsBinaryString(file); //reader.readAsText(file, "UTF-8");
			reader.onload = ev => { // event on load file
				fn(el, file, ev.target.result, index);
				file = el.files[++index];
				file && fnRead();
			}
			file ? fnRead() : fn(el);
		});
	}

	// Form Validator
	const fnSetTip = (el, msg) => {
		const block = el.closest(opts.groupSelector) || divNull; // label tag container
		block.getElementsByClassName(opts.tipErrorClass).text(msg);
		return self;
	}
	const fnSetInputOk = el => {
		el.classList.remove(opts.inputErrorClass);
		return fnSetTip(el, EMPTY);
	}
	const fnSetInputError = (el, tip) => {
		el.focus(); // set focus on error
		el.classList.add(opts.inputErrorClass);
		return fnSetTip(el, i18n.get(tip));
	}
	this.closeAlerts = () => {
		alerts.closeAlerts();
		return fnFor(form.elements, fnSetInputOk);
	}
	this.setOk = msg => {
		alerts.showOk(msg || opts.defaultMsgOk);
		return fnFor(form.elements, fnSetInputOk);
	}
	this.setError = (el, msg, tip) => {
		el = isstr(el) ? self.getInput(el) : el;
		fnSetInputError(el, tip); // Set input error
		return self.showError(msg); // Show error message
	}
	this.setErrors = (messages, selector) => {
		if (isstr(messages)) // simple message text
			return self.showError(messages);
		// Style error inputs and set focus on first error
		selector = selector || INPUTS; // Default = inputs type
		messages = messages || i18n.getMsgs(); // default messages
		const fnToggleError = (el, tip) => tip ? fnSetInputError(el, tip) : fnSetInputOk(el);
		form.elements.eachPrev(el => (el.isVisible(selector) && fnToggleError(el, messages[el.name])));
		return self.showError(messages.msgError || opts.defaultMsgError);
	}
	this.isValid = (fnValidate, selector) => {
		const data = self.closeAlerts().getData(selector);
		return fnValidate(data) ? data : !self.setErrors(i18n.getMsgs(), selector);
	}

	this.send = (url, opts) => {
		opts = opts || {}; // Settings
		/*const msg = i18n.get(opts.confirm);
		if (msg && !confirm(msg)) // confirm?
			return  Promise.reject(msg); // Confirm NO
		const data = self.isValid(opts.validate, opts.inputs);
		if (!data) // Is valid data?
			return  Promise.reject(i18n.getMsgs()); // Validation error*/
		const fd = new FormData(form); // Data container
		opts.headers = opts.headers || {}; // Headers container
		opts.headers["x-requested-with"] = "XMLHttpRequest"; // AJAX
		//opts.headers["user-agent"] = "Form component API AJAX"; // user description
		opts.headers["content-type"] = form.enctype || "application/x-www-form-urlencoded";
		opts.method = opts.method || form.method; //method-override
		//if (opts.method == "get") // Form get => prams in url
			//url += "?" + (new URLSearchParams(fd)).toString();
		//else
		opts.body = (form.enctype == "multipart/form-data") ? fd : new URLSearchParams(fd);
		//const insertar = opts.insert && !data[opts.pkName || "id"]; // insert or update
		//const fnSave = (insertar ? opts.insert : opts.update) || globalThis.void; // action
		return api.send(url || form.action, opts)
					//.then(info => { self.setOk(info); fnSave(data, info); })
					.catch(info => { self.setErrors(info); });
	}

	// Form initialization
	form.elements.forEach(el => {
		if (fnContains(el, opts.floatFormatClass)) {
			el.addEventListener("change", ev => fnNumber(el, i18n.fmtFloat(el.value)));
			return fnNumber(el, el.value && i18n.isoFloat(+el.value)); // iso format float
		}
		if (fnContains(el, opts.integerFormatClass)) {
			el.addEventListener("change", ev => fnNumber(el, i18n.fmtInt(el.value)));
			return fnNumber(el, el.value && i18n.isoInt(+el.value)); // iso format integer
		}
		if (fnContains(el, opts.boolClass))
			el.value = i18n.boolval(el.value); // Hack PF type
		else if (fnContains(el, opts.dateClass))
			el.type = "date"; // Hack PF type
		else if (fnContains(el, opts.checkAllClass))
			el.addEventListener("click", ev => {
				const fnCheck = input => (input.type == "checkbox") && (input.name == el.id);
				form.elements.forEach(input => { if (fnCheck(input)) input.checked = el.checked; });
			});
	});
	self.autofocus().beforeReset(ev => self.closeAlerts().autofocus());
}
