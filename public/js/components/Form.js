
import i18n from "../i18n/langs.js";
import Autocomplete from "./Autocomplete.js";

const divNull = document.createElement("div");
const isset = val => (typeof(val) !== "undefined") && (val !== null);
const isstr = val => (typeof(val) === "string") || (val instanceof String);
const fnVisible = el => (el.offsetWidth || el.offsetHeight || el.getClientRects().length);

HTMLCollection.prototype.find = Array.prototype.find;
HTMLCollection.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.findIndex = Array.prototype.findIndex;

export default function(form, opts) {
    opts = opts || {}; // default options
	opts.pkName = opts.pkName || "id"; // primary key name
	opts.hideClass = opts.hideClass || "hide"; // hidden class name
	opts.defaultMsgOk = opts.defaultMsgOk || "saveOk"; // default key for message ok
	opts.defaultMsgError = opts.defaultMsgError || "errForm"; // default key error
	opts.checkAllClass = opts.checkAllClass || "ui-check-all";
	opts.floatFormatClass = opts.floatFormatClass || "ui-float";
	opts.integerFormatClass = opts.integerFormatClass || "ui-integer";
	opts.inputBlockClass = opts.inputBlockClass || "ui-block";
	opts.inputErrorClass = opts.inputErrorClass || "ui-error";
	opts.tipErrorClass = opts.tipErrorClass || "ui-errtip";
	opts.updateOnlyClass = opts.updateOnlyClass || "update-only";
	opts.negativeNumClass = opts.negativeNumClass || "text-red";

	const self = this; //self instance
	const FOCUSABLED = "[tabindex]:not([type=hidden],[readonly],[disabled])";
	const updateOnly = document.getElementsByClassName(opts.updateOnlyClass);

	this.focus = el => { el && el.focus(); return self; }
	this.autofocus = () => self.focus(form.elements.find(el => (el.matches(FOCUSABLED) && fnVisible(el))));
	this.getInput = selector => form.elements.find(el => el.matches(selector)); // find an element

	function fnSetValue(el, value) {
		if (el.type =="date") // input type = date
			el.value = value && value.substrng(0, 10);
		else if (el.classList.contains(opts.floatFormatClass))
			data[el.name] = i18n.isoFloat(value); // Float format
		else if (el.classList.contains(opts.integerFormatClass))
			data[el.name] = i18n.isoInt(value); // Integer format
		else if (el.type === "checkbox") // Array type
			el.checked = value && value.includes(el.value);
		else if (el.type === "radio")
			el.checked = (el.value == value);
		else if (el.name)
			el.value = value || ""; // String
		return self;
	}
	this.setValue = (el, value) => fnSetValue(el.value, value); // input must exists
	this.setValues = data => { // update element value only if data exists
		form.elements.forEach(el => (isset(data[el.name]) && fnSetValue(el, data[el.name])));
		return self;
	}
	this.render = data => { // JSON to View
		form.elements.forEach(el => fnSetValue(el, data[el.name]));
		updateOnly.forEach(el => el.classList.toggle(opts.hideClass, !data[opts.pkName]));
		return self;
	}
	this.parse = () => { // View to JSON
		const data = {}; // Results container
		form.elements.forEach(el => {
			if (el.classList.contains(opts.floatFormatClass))
				data[el.name] = i18n.toFloat(el.value); // Float
			else if (el.classList.contains(opts.integerFormatClass))
				data[el.name] = i18n.toInt(el.value); // Integer
			if ((el.type === "checkbox") && el.checked) {
				data[el.name] = data[el.name] || [];
				data[el.name].push(el.value); // Array type
			}
			else if (el.name)
				data[el.name] = el.value; // String
		});
		return data;
	}

	// Inputs helpers
	this.setAutocomplete = (selector, opts) => {
		const block = form.querySelector(selector);
		return new Autocomplete(block, opts);
	}
	this.setDateRange = (f1, f2) => {
		f1 = self.getInput(f1);
		f2 = self.getInput(f2);
		f1.addEventListener("blur", ev => f2.setAttribute("min", f1.value));
		f2.addEventListener( "blur", ev => f1.setAttribute("max", f2.value));
		return self;
	}
	this.setSelectMask = function(selector, mask) {
		form.elements.forEach((el, i) => { //iterate over all selects
			if (el.options && el.matches(selector)) {
				const option = el.options[el.selectedIndex]; //get current option
				el.options.forEach(option => option.classList.toggle(opts.hideClass, !((mask >> i) & 1)));
				if (option && option.classList.contains(opts.hideClass)) // is current option hidden?
					el.selectedIndex = el.options.findIndex(el => !el.classList.contains(opts.hideClass));
			}
		});
		return self;
	}

	// Events handlers
	this.change = fn => form.addEventListener("change", fn);
	this.submit = fn => form.addEventListener("submit", fn);
	this.beforeReset = fn => form.addEventListener("reset", fn);
	this.afterReset = fn => form.addEventListener("reset", ev => setTimeout(() => fn(ev), 1));

	this.onChangeInput = (selector, fn) => {
		const el = self.getInput(selector);
		el.addEventListener("change", fn);
		return self;
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
		const tip = form.getElementById("tip-" + el.name) || divNull;
		tip.innerHTML = msg;
	}
	const fnSetInputOk = el => {
		el.classList.remove(opts.inputErrorClass);
		fnSetTip(el, "");
	}
	const fnSetInputError = (el, msg) => {
		if (msg) { // el has an error
			el.classList.add(opts.inputErrorClass);
			fnSetTip(el, msg);
		}
		else // el is not an error
			fnSetInputOk(el);
	}
	self.closeAlerts = () => {
		form.elements.forEach(fnSetInputOk);
		window.alerts.closeAlerts();
		return self;
	}
	self.setOk = msg => {
		form.elements.forEach(fnSetInputOk);
		window.alerts.showOk(msg || opts.defaultMsgOk);
		return self;
	}
	self.setErrors = messages => {
		if (isstr(messages)) // simple message text
			window.alerts.showError(messages);
		else { // Style error inputs and set focus on first error
			form.elements.forEach(el => fnSetInputError(el, messages[el.name]));
			self.focus(form.elements.find(el => el.classList.contains(opts.inputErrorClass)));
			window.alerts.showError(messages.msgError || opts.defaultMsgError);
		}
		return self;
	}
	this.validate = async () => {
		const data = self.closeAlerts().parse();
		if (opts.validate(data)) { // Form validation
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
		window.loading(); //show loading... div
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
		window.working(); // always force to hide loadin div
		return res.ok ? data : !self.setErrors(data);
	}
	this.setRequest = (selector, fn) => {
		form.querySelectorAll(selector).forEach(link => {
			link.onclick = async ev => {
				const msg = link.dataset.confirm;
				if (!msg || confirm(msg)) { // has confirmation?
					const data = await self.send({ action: link.href, method: link.dataset.method });
					data && fn(data, link); // callbak if no errors
				}
				ev.preventDefault();
			};
		});
		return self;
	}
	this.clone = msg => {
		window.alerts.showOk(msg || opts.defaultMsgOk); // show message
		updateOnly.forEach(el => el.classList.add(opts.hideClass));
		return self.setValue(self.getInput("[name='" + opts.pkName + "']"), "");
	}

	// Form initialization
	const fmtNumber = (el, value) => { // Show formatted value and style
		el.classList.toggle(opts.negativeNumClass, value && value.startsWith("-"));
		el.value = value; // value formatted
	}
	form.elements.forEach(el => {
		if (el.classList.contains(opts.floatFormatClass))
			el.addEventListener("change", ev => fmtNumber(el, i18n.fmtFloat(el.value)));
		else if (el.classList.contains(opts.integerFormatClass))
			el.addEventListener("change", ev => fmtNumber(el, i18n.fmtInt(el.value)));
		else if (el.classList.contains(opts.checkAllClass))
			el.addEventListener("click", ev => {
				const fnCheck = input => (input.type == "checkbox") && (input.name == el.id);
				form.elements.forEach(input => { if (fnCheck(input)) input.checked = el.checked; });
			});
	});
	self.autofocus().afterReset(ev => { self.closeAlerts().autofocus(); });
}
