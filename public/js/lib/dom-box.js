
import ab from "./array-box.js";
import sb from "./string-box.js";
import nb from "./number-box.js";
import api from "./api-box.js";
import i18n from "./i18n-box.js";

function DomBox() {
	const self = this; //self instance
	const EMPTY = ""; //empty string
	const HIDE = "hide"; //hide class

	const fnSelf = () => self; //function void
	const isElement = node => (node.nodeType == 1);
	const isstr = val => (typeof(val) === "string") || (val instanceof String);
	const fnQuery = selector => isstr(selector) ? document.querySelector(selector) : selector;
	const fnQueryAll = selector => isstr(selector) ? document.querySelectorAll(selector) : selector;

	this.qs = (el, selector) => el.querySelector(selector);
	this.get = (selector, el) => self.qs(el || document, selector);
	this.getAll = (selector, el) => (el || document).querySelectorAll(selector);
	this.closest = (selector, el) => el && el.closest(selector);

	this.isOk = i18n.isOk;
	this.isError = i18n.isError;
	this.loading = this.working = fnSelf;

	this.each = function(list, fn) {
		if (list) // Is DOMElement, selector or NodeList
			isElement(list) ? fn(list) : ab.each(fnQueryAll(list), fn);
		return self;
	}
	this.reverse = function(list, fn) {
		if (list) // Is DOMElement, selector or NodeList
			isElement(list) ? fn(list) : ab.reverse(fnQueryAll(list), fn);
		return self;
	}

	this.apply = (selector, list, fn) => fnSelf(ab.each(list, (el, i) => el.matches(selector) && fn(el, i)));
	//this.applyReverse = (selector, list, fn) => fnSelf(ab.reverse(list, (el, i) => el.matches(selector) && fn(el, i)));
	this.indexOf = (el, list) => ab.findIndex(list || el.parentNode.children, elem => (el == elem));
	this.findIndex = (selector, list) => ab.findIndex(list, el => el.matches(selector));
	this.find = (selector, list) => ab.find(list, el => el.matches(selector));

	this.prev = (el, selector) => {
		for (el = el?.previousElementSibling; el; el = el.previousElementSibling) {
			if (el.matches(selector))
				return el;
		}
		return el;
	}
	this.next = (el, selector) => {
		for (el = el?.nextElementSibling; el; el = el.nextElementSibling) {
			if (el.matches(selector))
				return el;
		}
		return el;
	}
	this.sibling = (el, selector) => self.prev(el, selector) || self.next(el, selector);
	this.eachChild = (el, selector, fn) => self.apply(selector, el.children, fn);

	// Styles
	const fnHide = el => el.classList.add(HIDE);
	const fnShow = el => el.classList.remove(HIDE);
	//const isHide = el => el.classList.contains(HIDE);
	const fnToggle = (el, name, force) => el.classList.toggle(name, force);
	const fnVisible = el => (el.offsetWidth || el.offsetHeight || el.getClientRects().length);

	this.visible = el => el && fnVisible(el);
	this.show = list => self.each(list, fnShow);
	this.hide = list => self.each(list, fnHide);
	this.addClass = (list, name) => self.each(list, el => el.classList.add(name));
	this.removeClass = (list, name) => self.each(list, el => el.classList.remove(name));
	this.toggle = (list, name, force) => self.each(list, el => fnToggle(el, name, force));
	this.toggleHide = (list, force) => self.toggle(list, HIDE, force);
	this.hasClass = (el, name) => el && el.classList.contains(name);

	// Format and parse contents
	const TEMPLATES = {}; //container
	function fnContents(el, value) { fnToggle(el, HIDE, !value); return self; }
	function fnSetHtml(el, value) { el.innerHTML = value; return fnContents(el, value); }
	function fnTpl(el) {
		el.id = el.id || ("_" + sb.rand()); // force unique id for element
		const key = el.dataset.tpl || el.id; // tpl asociated
		TEMPLATES[key] = TEMPLATES[key] || el.innerHTML; // save tpl
		return TEMPLATES[key];
	}

	this.getInnerHtml = el => el && el.innerHTML; //text
	this.getHtml = el => self.getInnerHtml(fnQuery(el)); //find element
	this.setInnerHtml = (el, value) => (el ? fnSetHtml(el, value) : self);
	this.setHtml = (el, value) => self.setInnerHtml(fnQuery(el), value); //find element
	this.html = (list, value) => self.each(list, el => fnSetHtml(el, value));
	this.format = (selector, data) => self.each(selector, el => fnSetHtml(el, sb.format(fnTpl(el), data)));
	this.render = (selector, data, fnRender) => self.each(selector, el => fnSetHtml(el, sb.render(fnTpl(el), data, fnRender)));

	// Forms and inputs
	const INPUTS = "input,select,textarea";
	const FIELDS = "input[name]:not([type=file]),select[name],textarea[name]";
	const fnSetValue = (el, value) => {
		if ((el.type === "checkbox") || (el.type === "radio"))
			el.checked = (el.value == value);
		else
			el.value = value;
		return self;
	}

	this.fetch = function(opts) {
		self.loading(); //show loading..., and close loading...
		return api.ajax.fetch(opts).finally(self.working);
	}
	// Promises has implicit try ... catch, throw => run next catch, avoid intermediate then
	this.ajax = (action, opts) => {
		const aux = Object.assign({ action }, opts); // Extra options
		return self.fetch(aux).catch(msg => { self.showError(msg); throw msg; });
	}
	this.send = (form, opts) => {
		opts = opts || {}; // Settings
		opts.action = opts.action || form.action; //action-override
		opts.method = opts.method || form.method; //method-override

		const fd = new FormData(form); // Data container
		if (opts.method == "get") // Form get => prams in url
			opts.action += "?" + (new URLSearchParams(fd)).toString();
		else
			opts.body = (form.enctype == "multipart/form-data") ? fd : new URLSearchParams(fd);
		//opts.headers = { "Content-Type": form.enctype || "application/x-www-form-urlencoded" };
		return self.fetch(opts).catch(data => { self.setErrors(form, data); throw data; });
	}
	this.request = (form, selector, fn) => {
		const link = self.get(selector, form); // Action link
		return fnAddEvent(link, "click", ev => !self.send(form, { action: link.href }).then(fn));
	}

	this.inputs = el => self.getAll(INPUTS, el);
	this.getForm = selector => self.find(selector, document.forms);
	this.setChecked = (list, value) => self.each(list, input => { input.checked = value; });
	this.setReadonly = (list, value) => self.each(list, input => { input.readOnly = value; });
	this.setDisabled = (list, value) => self.each(list, input => { input.disabled = value; });
	this.getValue = input => input && input.value;
	this.setValue = (input, value) => input ? fnSetValue(input, value || EMPTY) : self;
	this.putValue = (selector, value) => self.setValue(fnQuery(selector), value);
	this.getInput = (form, selector) => form && self.find(selector, form.elements);
	this.getInputVal = (form, name) => self.getValue(self.getInput(form, "[name='" + name + "']"));
	this.setInputVal = (form, name, value) => self.setValue(self.getInput(form, "[name='" + name + "']"), value);
	this.setVal = (name, value) => self.each(document.forms, form => self.setInputVal(form, name, value));
	this.setValues = (form, data) => {
		for (let key in data) // update key names only
			self.setInputVal(form, key, data[key]);
		return self;
	}

	this.getAttr = (input, name) => input ? input.getAttribute(name) : null;
	this.setAttr = (input, name, value) => input ? fnSelf(input.setAttribute(name, value)) : self;
	this.putAttr = (selector, name, value) => self.setAttr(fnQuery(selector), name, value);
	this.getInputAttr = (form, name) => self.getAttr(self.getInput(form, "[" + name + "]"), name);
	this.setInputAttr = (form, name, value) => self.setAttr(self.getInput(form, "[" + name + "]"), name, value);
	this.setRangeDate = (form, f1, f2) => {
		f1 = self.getInput(form, f1);
		f2 = self.getInput(form, f2);
		fnAddEvent(f1, "blur", ev => f2.setAttribute("min", f1.value));
		return fnAddEvent(f2, "blur", ev => f1.setAttribute("max", f2.value));
	}
	this.onChangeInputs = (form, name, fn) => self.apply(name, form.elements, el => fnEvent(el, ON_CHANGE, fn));
	this.onChangeSelect = (form, name, fn) => self.apply(name, form.elements, el => { fn(el); fnEvent(el, ON_CHANGE, fn); });
	this.onChangeFields = (name, fn) => self.each(document.forms, form => self.onChangeInputs(form, name, fn));
	this.onChangeFile = (form, name, fn) => {
		const reader = new FileReader();
		const el = self.getInput(form, name);

		return fnAddEvent(el, ON_CHANGE, ev => {
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

	this.focus = el => fnSelf(el && el.focus());
	this.putFocus = el => self.focus(fnQuery(el));
	this.setFocus = el => self.autofocus(self.inputs(el));
	this.autofocus = function(inputs) {
		const fnFocus = el => (fnVisible(el) && el.matches("[tabindex]:not([type=hidden],[readonly],[disabled])"));
		return self.focus(ab.find(fnQueryAll(inputs || INPUTS), fnFocus)); // Set focus on first visible input
	}

	this.load = (form, data) => {
		return data ? self.apply(FIELDS, form.elements, el => fnSetValue(el, data[el.name] || EMPTY))
					: self.apply(FIELDS, form.elements, el => fnSetValue(el, EMPTY));
	}
	this.toObject = (form, data) => {
		data = data || {}; // Fields container
		self.apply(FIELDS, form.elements, el => { data[el.name] = el.value; });
		return data;
	}
	this.checkbin = (form, name, value) => {
		const group = form.querySelectorAll("[name='" + name + "']");
		const check = self.find("#" + name, form.elements);

		function fnCheck() {
			let result = 0; // mask
			self.each(group, (el, i) => { result |= +el.checked << i; });
			check.checked = (+check.value == result);
			return self;
		}

		if (!check.dataset.procesed) {
			self.click(group, fnCheck).click(check, ev => self.setChecked(group, check.checked));
			check.dataset.procesed = true; // Only one click listener
		}
		const fn = Array.isArray(value)
				? (el => { el.checked = value.indexOf(el.value) > -1; }) 
				: (el => { el.checked = (value & el.value); });
		self.each(group, fn);
		return fnCheck();
	}

	// Events
	const ON_CHANGE = "change";
	const fnOnclick = (el, fn) => { el.onclick = ev => fn(ev, el); }
	const fnEvent = (el, name, fn, opts) => fnSelf(el.addEventListener(name, ev => fn(ev, el) || ev.preventDefault(), opts));
	const fnAddEvent = (el, name, fn, opts) => (el ? fnEvent(el, name, fn, opts) : self);

	this.event = (el, name, fn) => fnAddEvent(fnQuery(el), name, fn);
	this.events = (list, name, fn) => self.each(list, el => fnEvent(el, name, fn));
	this.unbind = (list, name, fn) => self.each(list, el => el.removeEventListener(name, fn));
	this.fire = (el, name, detail) => self.trigger(fnQuery(el), name, detail);
	this.trigger = (el, name, detail) => {
		el && el.dispatchEvent(detail ? new CustomEvent(name, { detail }) : new Event(name));
		return self;
	}

	this.ready = fn => fnEvent(document, "DOMContentLoaded", fn);
	this.click = (list, fn) => self.each(list, el => fnEvent(el, "click", fn));
	this.setClick = (list, fn) => self.each(list, el => fnOnclick(el, fn));
	this.setAction = (form, selector, fn) => self.apply(selector, form.elements, el => fnOnclick(el, fn));
	this.change = (list, fn) => self.each(list, el => fnEvent(el, ON_CHANGE, fn));
	this.keyup = (list, fn) => self.each(list, el => fnEvent(el, "keyup", fn));
	this.keydown = (list, fn) => self.each(list, el => fnEvent(el, "keydown", fn));
}

export default new DomBox();
