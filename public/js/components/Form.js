
import ab from "../lib/array-box.js";
import i18n from "../i18n/langs.js";
import Autocomplete from "./Autocomplete.js";

const divNull = document.createElement("div");
const isstr = val => (typeof(val) === "string") || (val instanceof String);
const fnVisible = el => (el.offsetWidth || el.offsetHeight || el.getClientRects().length);

export default function(form, opts) {
    opts = opts || {}; // default options
	opts.checkAllClass = opts.checkAllClass || "ui-check-all";
	opts.floatFormatClass = opts.floatFormatClass || "ui-float";
	opts.integerFormatClass = opts.integerFormatClass || "ui-integer";
	opts.inputBlockClass = opts.inputBlockClass || "ui-block";
	opts.inputErrorClass = opts.inputErrorClass || "ui-error";
	opts.tipErrorClass = opts.tipErrorClass || "ui-tiperr";

	const self = this; //self instance
	const FOCUSABLED = "[tabindex]:not([type=hidden],[readonly],[disabled])";

	this.focus = el => { el && el.focus(); return self; }
	this.autofocus = () => self.focus(ab.find(form.elements, el => (el.matches(FOCUSABLED) && fnVisible(el))));
	this.getInput = name => ab.find(form.elements, el => (el.name == name));

	this.render = data => {
		ab.each(form.elements, el => {
			let value = data[el.name];
			if ((el.type === "checkbox") || (el.type === "radio"))
				el.checked = (el.value == value);
			else if (el.type =="date")
				el.value = value && value.substrng(0, 10);
			else if (el.classList.contains(opts.floatFormatClass))
				data[el.name] = i18n.isoFloat(value);
			else if (el.classList.contains(opts.integerFormatClass))
				data[el.name] = i18n.isoInt(value);
			else if (el.name)
				el.value = value || "";
		});
		return self;
	}
	this.parser = () => {
		const data = {};
		ab.each(form.elements, el => {
			if (el.classList.contains(opts.floatFormatClass))
				data[el.name] = i18n.toFloat(el.value);
			else if (el.classList.contains(opts.integerFormatClass))
				data[el.name] = i18n.toInt(el.value);
			else if (el.name)
				data[el.name] = el.value;
		});
		return data;
	}

	// Inputs helpers
	this.setAutocomplete = (name, opts) => {
		const block = form.getElementById(name);
		return new Autocomplete(block, opts);
	}
	this.setRangeDate = (f1, f2) => {
		f1 = self.getInput(f1);
		f2 = self.getInput(f2);
		f1.addEventListener("blur", ev => f2.setAttribute("min", f1.value));
		f2.addEventListener( "blur", ev => f1.setAttribute("max", f2.value));
		return self;
	}

	// Events handlers
	this.change = fn => form.addEventListener("change", fn);
	this.submit = fn => form.addEventListener("submit", fn);
	this.beforeReset = fn => form.addEventListener("reset", fn);
	this.afterReset = fn => form.addEventListener("reset", ev => setTimeout(() => fn(ev), 1));
	this.onChangeFile = (name, fn) => {
		const reader = new FileReader();
		const el = self.getInput(name);
		el.addEventListener("change", ev => {
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
		return self;
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
			el.focus();
		}
		else // el is not an error
			fnSetInputOk(el);
	}
	self.closeAlerts = () => {
		ab.each(form.elements, fnSetInputOk);
		window.alerts.closeAlerts();
		return self;
	}
	self.setOk = msg => {
		ab.each(form.elements, fnSetInputOk);
		window.alerts.showOk(msg);
		return self;
	}
	self.setErrors = messages => {
		if (isstr(messages)) // simple message text
			window.alerts.showError(messages);
		else { // Reverse iterator to focus first error
			ab.reverse(form.elements, el => fnSetInputError(el, messages[el.name]));
			window.alerts.showError(messages.msgError);
		}
		return self;
	}
	this.isValid = fnValidate => {
		const data = fnValidate(self.closeAlerts().parser(form));
		return data || !self.setErrors(i18n.getMsgs());
	}
	this.validate = opts => {
		const data = self.isValid(opts.validate);
		if (i18n.isError()) // Validate input data
			return Promise.reject(i18n.getMsgs()); // Call a reject promise
		const pk = data[opts.pkName || "id"]; // Get pk value
		const fnUpdate = (data, info) => self.setOk(info); // Default acction
		const fnSave = ((opts.insert && !pk) ? opts.insert : opts.update) || fnUpdate;
		return self.send(opts).then(info => { fnSave(data, info); }); // Lunch insert or update
	}

	// Form actions
	this.fetch = async function(opts) {
		window.loading(); //show loading..., and close loading...
		opts.headers = opts.headers || {};
		opts.headers["x-requested-with"] = "XMLHttpRequest";
		const res = await globalThis.fetch(opts.action, opts);
		const type = res.headers.get("content-type") || "";
		const promise = type.includes("application/json") ? res.json() : res.text();
		promise.finally(window.working); // always force to hide loadin div
		// Promises has implicit try ... catch, throw => run next catch, avoid intermediate then
		return res.ok ? promise : promise.then(data => Promise.reject(data));
	}
	this.send = opts => {
		opts = opts || {}; // Settings
		opts.action = opts.action || form.action; //action-override
		opts.method = opts.method || form.method; //method-override

		const fd = new FormData(form); // Data container
		if (opts.method == "get") // Form get => prams in url
			opts.action += "?" + (new URLSearchParams(fd)).toString();
		else
			opts.body = (form.enctype == "multipart/form-data") ? fd : new URLSearchParams(fd);
		//opts.headers = { "Content-Type": form.enctype || "application/x-www-form-urlencoded" };
		return self.fetch(opts).catch(data => { self.setErrors(data); throw data; });
	}
	this.setRequest = (selector, fn) => {
		const link = form.querySelector(selector);
		link.addEventListener("click", ev => {
			const msg = link.dataset.confirm;
			if (!msg || confirm(msg))
				self.send({ action: link.href, method: link.dataset.method }).then(fn);
			ev.preventDefault();
		});
		return self;
	}

	// Form initialization
	ab.each(form.elements, el => {
		if (el.classList.contains(opts.floatFormatClass))
			el.addEventListener("change", ev => { el.value = i18n.fmtFloat(el.value); });
		else if (el.classList.contains(opts.integerFormatClass))
			el.addEventListener("change", ev => { el.value = i18n.fmtInt(el.value); });
		else if (el.classList.contains(opts.checkAllClass))
			el.addEventListener("click", ev => {
				const fnCheck = input => (input.type == "checkbox") && (input.name == el.id);
				ab.each(form.elements, input => { if (fnCheck(input)) input.checked = el.checked; });
			});
	});
	self.autofocus().afterReset(ev => { self.closeAlerts().autofocus(); });
}
