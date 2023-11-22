
import Autocomplete from "./Autocomplete.js";
import alerts from "./Alerts.js";
import i18n from "../i18n/langs.js";

const divNull = document.createElement("div");
const isset = val => (typeof(val) !== "undefined") && (val !== null);
const isstr = val => (typeof(val) === "string") || (val instanceof String);

String.isset = isset;
String.isstr = isstr;

export default function(form, opts) {
    opts = opts || {}; // default options
	opts.pkName = opts.pkName || "id"; // primary key name
	opts.hideClass = opts.hideClass || "hide"; // hidden class name
	opts.defaultMsgOk = opts.defaultMsgOk || "saveOk"; // default key for message ok
	opts.defaultMsgError = opts.defaultMsgError || "errForm"; // default key error
	//opts.inputBlockClass = opts.inputBlockClass || "ui-block"; // Inputs block styles
	opts.dateClass = opts.dateClass || "ui-date"; // Date type
	opts.boolClass = opts.boolClass || "ui-bool"; // Boolean type
	opts.checkAllClass = opts.checkAllClass || "ui-check-all"; // Check all related checkboxes
	opts.floatFormatClass = opts.floatFormatClass || "ui-float"; // Float i18n
	opts.integerFormatClass = opts.integerFormatClass || "ui-integer"; // Integer i18n
	opts.numberFormatClass = opts.numberFormatClass || "ui-number"; // Number type
	opts.inputErrorClass = opts.inputErrorClass || "ui-error"; // Input error styles
	//opts.tipErrorClass = opts.tipErrorClass || "ui-errtip"; // Tip error style
	opts.insertOnlyClass = opts.insertOnlyClass || "insert-only"; // Elements for insert
	opts.updateOnlyClass = opts.updateOnlyClass || "update-only"; // Elements for update
	opts.negativeNumClass = opts.negativeNumClass || "text-red"; // Negative numbers styles

	const self = this; //self instance
	const INPUTS = "input,select,textarea";
	const FOCUSABLED = "[tabindex]:not([type=hidden],[readonly],[disabled])";

	this.focus = el => { el && el.focus(); return self; }
	this.setFocus = selector => self.focus(self.getInput(selector));
	this.autofocus = () => self.focus(form.elements.find(el => (el.matches(FOCUSABLED) && el.isVisible())));
	this.getInput = selector => form.elements.find(el => el.matches(selector)); // find an element
	this.getInputs = selector => form.elements.filter(el => el.matches(selector)); // filter elements

	// Alerts helpers
	this.showOk = msg => { alerts.showOk(msg); return self; } // Encapsule showOk message
	this.showInfo = msg => { alerts.showInfo(msg); return self; } // Encapsule showInfo message
	this.showWarn = msg => { alerts.showWarn(msg); return self; } // Encapsule showWarn message
	this.showError = msg => { alerts.showError(msg); return self; } // Encapsule showError message
	this.showAlerts = data => { alerts.showAlerts(data); return self; } // Encapsule showAlerts message

	// Actions to update form view (inputs, texts, ...)
	const fnFor = (list, fn) => { list.forEach(fn); return self; }
	const fnEach = (selector, fn) => fnFor(form.querySelectorAll(selector), fn);
	const fnSetText = (el, text) => { el.innerHTML = text; return self; }
    this.html = selector => form.querySelector(selector).innerHTML;
	this.text = (selector, text) => fnEach(selector, el => fnSetText(el, text)); // Update all texts info in form
	this.render = (selector, data) => { // HTMLElement.prototype.render is implemented in Table component
		data = data || i18n.getLang(); // Default data = current language
		return fnEach(selector, el => el.render(data)); // Render each element
	}

	const fnHide = el => el.classList.add(opts.hideClass);
	const fnShow = el => el.classList.remove(opts.hideClass);
	this.show = selector => fnEach(selector, fnShow);
	this.hide = selector => fnEach(selector, fnHide);
	this.toggle = (selector, force) => force ? self.show(selector) : self.hide(selector);
	this.disabled = (force, selector) => fnFor(self.getInputs(selector || INPUTS), el => el.toggleAttribute("disabled", force)); // Update attribute only
	this.readonly = (force, selector) => fnFor(self.getInputs(selector || INPUTS), el => el.classList.toggle("readonly", el.toggleAttribute("readonly", force))); // Update attribute and style

	this.setInsertMode = () => {
		fnFor(form.getElementsByClassName(opts.insertOnlyClass), fnShow);
		return fnFor(form.getElementsByClassName(opts.updateOnlyClass), fnHide);
	}
	this.setUpdateMode = () => {
		fnFor(form.getElementsByClassName(opts.insertOnlyClass), fnHide);
		return fnFor(form.getElementsByClassName(opts.updateOnlyClass), fnShow);
	}
	this.setMode = id => {
		id = id || self.getval("[name='" + opts.pkName + "']");
		return id ? self.setUpdateMode() : self.setInsertMode();
	}

	// Value property
	const fnNumber = (el, value) => {
		el.value = value || ""; // Show formatted value and style
		el.classList.toggle(opts.negativeNumClass, el.value.startsWith("-"));
	}
	function fnValue(el, value) {
		if ((el.tagName == "SELECT") && !value)
			el.selectedIndex = 0;
		else
			el.value = value || ""; // String
		return self;
	}
	function fnSetValue(el, value) {
		if (el.type =="date") // input type = date
			el.value = value ? value.substring(0, 10) : "";
		else if (el.classList.contains(opts.floatFormatClass))
			fnNumber(el, i18n.isoFloat(value));
		else if (el.classList.contains(opts.integerFormatClass))
			fnNumber(el, i18n.isoInt(value));
		else if (el.classList.contains(opts.boolClass))
			el.value = i18n.boolval(value);
		else if (el.type === "checkbox") // Array type
			el.checked = value && value.includes(el.value);
		else if (el.type === "radio")
			el.checked = (el.value == value);
		else
			fnValue(el, value)
		return self;
	}
	this.setValue = (el, value) => el ? fnSetValue(el, value) : self;
	this.setval = (selector, value) => self.setValue(self.getInput(selector), value);
	this.setValues = data => fnFor(form.elements, el => (isset(data[el.name]) && fnSetValue(el, data[el.name]))); // update element value only if data exists
	this.setData = data => { // JSON to View
		fnFor(form.elements, el => fnSetValue(el, data[el.name]));
		return self.setMode(data[opts.pkName]);
	}

	function fnParseValue(el) {
		if (el.classList.contains(opts.floatFormatClass))
			return i18n.toFloat(el.value); // Float
		if (el.classList.contains(opts.integerFormatClass))
			return i18n.toInt(el.value); // Integer
		if (el.classList.contains(opts.numberFormatClass))
			return el.value ? +el.value : null; // Number type directly
		return el.value && el.value.trim(); // String trimed by default
	}
	this.getValue = el => el && fnParseValue(el);
	this.getval = selector => self.getInput(selector).value;
	this.valueOf = selector => self.getValue(self.getInput(selector));
	this.getData = data => { // View to JSON
		data = data || {}; // Results container
		form.elements.forEach(el => {
			if ((el.type === "checkbox") && el.checked) {
				data[el.name] = data[el.name] || [];
				data[el.name].push(el.value); // Array type
			}
			else if (el.name)
				data[el.name] = fnParseValue(el);
		});
		return data;
	}

	this.copy = (el1, el2) => fnValue(self.getInput(el1), self.getval(el2));
	this.reset = () => { form.elements.forEach(el => fnValue(el)); return self.autofocus(); } // clear inputs (hidden to) and autofocus
	this.restart = selector => { const el = self.getInput(selector); el.value = ""; el.focus(); return self; } // remove value + focus

	// Inputs helpers
	this.setAutocomplete = (selector, opts) => {
		const block = form.querySelector(selector);
		return block && new Autocomplete(block, opts);
	}
	this.setDateRange = (f1, f2) => {
		f1 = self.getInput(f1);
		f2 = self.getInput(f2);
		f1.addEventListener("blur", ev => f2.setAttribute("min", f1.value));
		return fnEvent(f2, "blur", ev => f1.setAttribute("max", f2.value));
	}

	this.setSelect = function(selector, items, emptyOption) {
		const select = self.getInput(selector); // Get select element
		emptyOption = emptyOption ? `<option>${emptyOption}</option>` : ""; // Text for empty first option
		const fnItem = item => `<option value="${item.value}">${item.label}</option>`; // Item list
		return fnSetText(select, emptyOption + items.map(fnItem).join("")); // Render items
	}
	this.setOptions = function(selector, values, keys, emptyOption) {
		const select = self.getInput(selector); // Get select element
		emptyOption = emptyOption ? `<option>${emptyOption}</option>` : ""; // Text for empty first option
		const fnKeys = (val, i) => `<option value="${keys[i]}">${val}</option>`; // Default options template
		const fnDefault = (val, i) => `<option value="${i+1}">${val}</option>`; // 1, 2, 3... Number array
		return fnSetText(select, emptyOption + values.map(keys ? fnKeys : fnDefault).join(""));
	}
	this.toggleOptions = function(selector, flags) {
		const select = form.elements.find(el => (el.options && el.matches(selector)));
		const option = select.options[select.selectedIndex]; //get current option
		select.options.forEach((option, i) => option.classList.toggle(opts.hideClass, !flags.mask(i)));
		if (option && option.classList.contains(opts.hideClass)) // is current option hidden?
			select.selectedIndex = select.options.findIndex(el => !el.classList.contains(opts.hideClass));
		return self;
	}
	this.getOptionText = function(selector) {
		const select = self.getInput(selector); // Get select element
		const option = select.options[select.selectedIndex]; //get current option
		return option && option.innerHTML; //get current option text
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
	this.click = selector => { form.querySelector(selector).click(); return self; } // Fire event

	this.onChangeInput = (selector, fn) => {
		const el = self.getInput(selector);
		return fnEvent(el, "change", fn);
	}
	this.onChangeSelect = (selector, fn) => {
		const el = self.getInput(selector);
		fn(el); // call function + register listener
		return fnEvent(el, "change", ev => fn(el));
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
	const fnSetTip = (el, msg) => fnSetText(form.querySelector("#tip-" + el.name) || divNull, msg);
	const fnSetInputOk = el => { el.classList.remove(opts.inputErrorClass); fnSetTip(el, ""); }
	const fnSetInputError = (el, tip) => { el.classList.add(opts.inputErrorClass); el.focus(); fnSetTip(el, i18n.get(tip)); }
	const fnToggleError = (el, tip) => { tip ? fnSetInputError(el, tip) : fnSetInputOk(el); }
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
		return self.showError(msg);
	}
	this.setErrors = messages => {
		if (isstr(messages)) // simple message text
			alerts.showError(messages);
		else { // Style error inputs and set focus on first error
			form.elements.eachPrev(el => fnToggleError(el, messages[el.name]));
			alerts.showError(messages.msgError || opts.defaultMsgError);
		}
		return self;
	}
	this.isValid = fnValidate => {
		const data = self.closeAlerts().getData();
		return fnValidate(data) ? data : !self.setErrors(i18n.getMsgs());
	}
	this.validate = async fnValidate => {
		const data = self.isValid(fnValidate);
		if (data) { // Is valid data?
			const insertar = (opts.insert && !data[opts.pkName]); // insert or update
			const fnUpdate = (data, info) => self.setOk(info); // Default acction
			const fnSave = (insertar ? opts.insert : opts.update) || fnUpdate; // action
			const info = await self.send(opts); // get server response
			return info && fnSave(data, info);
		}
		return false; // Validation error
	}

	// Form actions
	this.send = async opts => {
		alerts.loading(); //show loading... div
		const fd = new FormData(form); // Data container

		opts = opts || {}; // Settings
		opts.headers = opts.headers || {};
		opts.headers["x-requested-with"] = "XMLHttpRequest";
		opts.action = opts.action || form.action; //action-override
		opts.method = opts.method || form.method; //method-override
		if (opts.method == "get") // Form get => prams in url
			opts.action += "?" + (new URLSearchParams(fd)).toString();
		else
			opts.body = (form.enctype == "multipart/form-data") ? fd : new URLSearchParams(fd);
		//opts.headers = { "Content-Type": form.enctype || "application/x-www-form-urlencoded" };

		const res = await globalThis.fetch(opts.action, opts);
		const type = res.headers.get("content-type") || "";
		const data = await (type.includes("application/json") ? res.json() : res.text());
		alerts.working(); // always force to hide loadin div
		return res.ok ? data : !self.setErrors(data);
	}
	this.setRequest = (selector, fn) => {
		return fnEach(selector, link => {
			link.onclick = async ev => {
				const msg = link.dataset.confirm;
				if (!msg || confirm(i18n.get(msg))) { // has confirmation?
					const data = await self.send({ action: link.href, method: link.dataset.method });
					data && fn(data, link); // callbak if no errors
				}
				ev.preventDefault();
			};
		});
	}
	this.clone = msg => {
		self.setInsertMode() // inserting mode
		alerts.showOk(msg || opts.defaultMsgOk); // show message
		return fnValue(self.getInput("[name='" + opts.pkName + "']")); // input must exists
	}
	this.setActions = () => {
		return fnFor(form.elements, el => {
			if (el.classList.contains(opts.floatFormatClass)) {
				el.addEventListener("change", ev => fnNumber(el, i18n.fmtFloat(el.value)));
				return fnNumber(el, el.value && i18n.isoFloat(+el.value)); // iso format float
			}
			if (el.classList.contains(opts.integerFormatClass)) {
				el.addEventListener("change", ev => fnNumber(el, i18n.fmtInt(el.value)));
				return fnNumber(el, el.value && i18n.isoInt(+el.value)); // iso format integer
			}
			if (el.classList.contains(opts.boolClass))
				el.value = i18n.boolval(el.value); // Hack PF type
			else if (el.classList.contains(opts.dateClass))
				el.type = "date"; // Hack PF type
			else if (el.classList.contains(opts.checkAllClass))
				el.addEventListener("click", ev => {
					const fnCheck = input => (input.type == "checkbox") && (input.name == el.id);
					form.elements.forEach(input => { if (fnCheck(input)) input.checked = el.checked; });
				});
		});
	}

	// Form initialization
	self.setActions().autofocus().beforeReset(ev => { self.closeAlerts().autofocus(); });
}
