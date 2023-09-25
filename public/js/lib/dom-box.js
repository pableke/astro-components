
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

	this.toggleInfo = selector => {
		return self.click(selector, (ev, el) => {
			const names = sb.split(el.dataset.toggle, /\s+/);
			const target = self.getAll(el.dataset.target || (".info-" + el.id));
			self.eachChild(el, "i", child => ab.each(names, name => fnToggle(child, name)))
				.toggle(target, el.dataset.css || HIDE).setFocus(target[0]);
		});
	}

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

	/*this.table = function(table, data, opts) {
		if (!table) // table exists?
			return self; // guard statement

		opts = opts || {};
		opts.msgConfirmRemove = opts.msgConfirmRemove || "remove";
		opts.msgConfirmReset = opts.msgConfirmReset || "removeAll";
		opts.beforeRender = opts.beforeRender || fnSelf;
		opts.afterRender = opts.afterRender || fnSelf;
		opts.findIndex = opts.findIndex || fnSelf;
		opts.reset = opts.reset || fnSelf;

		const detail = { rows: data, size: 0, index: 0 }; // Event detail
		const tbody = table.tBodies[0]; // Data rows

		function fnMove(i) {
			i = nb.range(i, 0, detail.size - 1);
			detail.index = i; // Real index
			detail.data = data[i]; // Current data row
			return detail;
		}
		function fnEvent(row, el) {
			detail.row = row; // TR parent row
			detail.element = el; // Element to trigger event
			return fnMove(self.indexOf(row)); // Real index
		}
		function fnChange(ev, tr) {
			const fn = opts["change-" + ev.target.name];
			fn(fnEvent(tr, ev.target));
			fnFooter(); // Build footer only
		}
		function fnFooter() { // Render tFoot only
			opts.afterRender(detail);
			self.format(table.tFoot, detail)
				.change(table.tFoot.children, fnChange);
		}
		function fnRender() { // Render tBody and tFoot
			detail.size = ab.size(data);
			opts.beforeRender(detail);
			self.render(tbody, data, opts.onRender)
				.toggleHide(tbody, !detail.size).toggleHide(table.tBodies[1], detail.size);

			// Listeners for change, find and remove events
			const action = self.getAll("a[href^='#find']", tbody);
			const remove = self.getAll("a[href='#remove']", tbody);
			self.change(tbody.children, fnChange);
			self.click(remove, (ev, link) => {
				fnEvent(link.closest("tr"), link);
				table.remove();
			}).click(action, (ev, link) => {
				const name = link.getAttribute("href");
				const fnFind = opts[name.substring(1)];
				fnFind(fnEvent(link.closest("tr"), link));
			});
			fnFooter();
		}

		fnRender(); // Render table and add extra events
		table.render = fnRender; // Mutate table object 
		table.insert = function(row, id) { row.id = id; data.push(row); fnRender(); }
		table.update = function(row) { Object.assign(detail.data, row); fnRender(); }
		//table.save = function(row, id) { id ? table.insert(row, id) : table.update(row); } // Insert or update
		table.append = function(rows) { ab.append(data, rows); fnRender(); }

		table.first = () => fnMove(0);
		table.prev = () => fnMove(detail.index - 1);
		table.next = () => fnMove(detail.index + 1);
		table.last = () => fnMove(detail.size);
		table.find = fn => fnMove(data.findIndex(fn));

		table.remove = function() {
			self.closeAlerts(); // close prev. alerts
			if (i18n.confirm(opts.msgConfirmRemove) && opts.remove(detail)) {
				data.splice(detail.index, 1); // Remove data row
				fnRender(); // Build table rows
			}
		}
		table.reset = function() {
			self.closeAlerts(); // close prev. alerts
			if (i18n.confirm(opts.msgConfirmReset) && opts.reset(data)) {
				data.splice(0); // Remove data row
				fnRender(); // Build table rows
			}
		}

		// Orderable columns system
		const links = self.getAll(".sort", table.tHead);
		return self.setClick(links, ev => { // Replace sort events => not duplicate them
			const link = ev.target; // current link clicked
			const dir = self.hasClass(link, "sort-asc") ? "desc" : "asc"; // Toggle sort direction
			const column = link.getAttribute("href").substring(1); // Column name
			const fnSort = opts["sort-" + column] || ((a, b) => sb.cmpBy(a, b, column)); // Sort function
			// Update all sort icons
			self.removeClass(links, "sort-asc").removeClass(links, "sort-desc") // Remove prev order
				.addClass(links, "sort-none") // Reset all orderable columns
				.removeClass(link, "sort-none").addClass(link, "sort-" + dir); // Column to order table
			ab.sort(data, dir, fnSort); // Sort data by function
			fnRender(); // Build table rows
		});
	}*/

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

	this.isValid = (form, fnValidate) => {
		const data = fnValidate(self.closeAlerts().toObject(form));
		return data || !self.setErrors(form, i18n.getMsgs());
	}
	this.validate = (form, opts) => {
		const data = self.isValid(form, opts.validate);
		if (i18n.isError()) // Validate input data
			return Promise.reject(i18n.getMsgs()); // Call a reject promise
		const pk = data[opts.pkName || "id"]; // Get pk value
		const fnUpdate = (data, info) => self.setOk(form, info); // Default acction
		const fnSave = ((opts.insert && !pk) ? opts.insert : opts.update) || fnUpdate;
		return self.send(form, opts).then(info => { fnSave(data, info); }); // Lunch insert or update
	}

	this.mask = (list, mask, name) => self.each(list, (el, i) => fnToggle(el, name, nb.mask(mask, i))); //toggle class by mask
	this.view = (list, mask) => self.mask(list, ~mask, HIDE); //toggle hide class by mask
	this.getSelectHtml = select => select && self.getInnerHtml(select.options[select.selectedIndex]);
	this.select = function(list, mask) {
		return self.each(list, el => { //iterate over all selects
			const option = el.options[el.selectedIndex]; //get current option
			if (self.view(el.options, mask).hasClass(option, HIDE)) //option hidden => force change
				el.selectedIndex = self.findIndex(":not(.hide)", el.options);
		});
	}

	// Animations
	/*function fnAnimateClass(el, name, opts) {
		opts.once = true; // fired once
		opts.onstart(el); // before animation
		el.addEventListener("animationend", ev => {
			el.classList.remove(name);
			opts.onfinish(el, ev);
		}, opts);
		el.classList.add(name);
	}
	this.animate = function(list, keyframes, opts) {
		opts = Object.assign({ duration: 1000, onfinish: fnSelf }, opts);
		return self.each(list, el => el.animate(keyframes, opts).onfinish(opts.onfinish));
	}
	this.animateClass = function(list, name, opts) {
		opts = Object.assign({ onstart: fnSelf, onfinish: fnSelf }, opts);
		return self.each(list, el => fnAnimateClass(el, name, opts));
	}
	this.animateIn = function(list, name) {
		const opts = { onstart: fnShow, onfinish: fnSelf };
		return self.each(list, el => fnAnimateClass(el, name, opts));
	}
	this.animateOut = function(list, name) {
		const opts = { onstart: fnSelf, onfinish: fnHide };
		return self.each(list, el => { isHide(el) || fnAnimateClass(el, name, opts); });
	}
	this.animateToggle = function(list, nameIn, nameOut) {
		const optsIn = { onstart: fnShow, onfinish: fnSelf };
		const optsOut = { onstart: fnSelf, onfinish: fnHide };
		return self.each(list, el => (isHide(el) ? fnAnimateClass(el, nameIn, optsIn) : fnAnimateClass(el, nameOut, optsOut)));
	}
	this.fadeIn = list => self.animateIn(list, "fadeIn");
	this.fadeOut = list => self.animateOut(list, "fadeOut");
	this.fadeToggle = list => self.animateToggle(list, "fadeIn", "fadeOut");
	this.slideIn = list => self.animateIn(list, "slideIn");
	this.slideOut = list => self.animateOut(list, "slideOut");
	this.slideToggle = list => self.animateToggle(list, "slideIn", "slideOut");*/

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

	const fnLink = (el, fn) => self.ajax(el.href).then(fn);
	const fnConfirm = (el, fn) => i18n.confirm(el.dataset.confirm) && fn(el);
	this.confirm = (list, fn) => self.click(list, (ev, el) => fnConfirm(el, fn));
	this.link = (list, fn) => self.click(list, (ev, el) => fnConfirm(el, el => !fnLink(el, fn)));
	this.call = (list, fn) => self.click(list, (ev, el) => !fnLink(el, fn));

	this.submit = (form, fn) => fnAddEvent(form, "submit", fn);
	this.beforeReset = (form, fn) => fnAddEvent(form, "reset", fn);
	this.afterReset = (form, fn) => fnAddEvent(form, "reset", ev => setTimeout(() => fn(ev), 1));

	this.tabs = function(tabs, opts) {
		tabs = fnQueryAll(tabs); // Get all tabs
		opts = opts || {}; // default optios
		opts.classActive = opts.classActive || "active";

		let _tabIndex = self.findIndex("." + opts.classActive, tabs); //current index tab
		let _tabSize = tabs.length - 1; // max tabs size
		let _backTab = _tabIndex; // back to previous tab
		let _tabMask = ~0; // all 11111....

		self.getTab = id => self.find("#tab-" + id, tabs); // Find by id selector
		self.setTabMask = mask => { _tabMask = mask; return self; } // set mask for tabs

		function fnShowTab(i) { //show tab by index
			self.closeAlerts(); // always close alerts
			i = nb.range(i, 0, _tabSize); // Force range
			if (i == _tabIndex) // is current tab
				return self; // nothing to do
			const tab = tabs[i]; // get next tab
			const fn = opts["tab-" + i] || fnSelf; // Event handler
			if (fn(tab)) { // Validata change tab
				const progressbar = self.get("#progressbar");
				if (progressbar) { // progressbar is optional
					const step = "step-" + i; //go to a specific step on progressbar
					self.each(progressbar.children, li => self.toggle(li, opts.classActive, li.id <= step));
				}
				_backTab = _tabIndex; // save from
				_tabIndex = i; // set current index
				self.removeClass(tabs, opts.classActive).addClass(tab, opts.classActive) // set active tab
					.setFocus(tab); // Auto set focus and scroll
			}
			return self;
		}

		self.viewTab = id => fnShowTab(self.findIndex("#tab-" + id, tabs)); //find by id selector
		self.lastTab = () => fnShowTab(_tabSize);
		self.backTab = () => fnShowTab(_backTab);
		self.prevTab = () => { // Ignore 0's mask tab
			for (var i = _tabIndex - 1; !nb.mask(_tabMask, i) && (i > 0); i--);
			return fnShowTab(i); // Show calculated prev tab
		}
		self.nextTab = () => { // Ignore 0's mask tab
			for (var i = _tabIndex + 1; !nb.mask(_tabMask, i) && (i < _tabSize); i++);
			return fnShowTab(i); // Show calculated next tab
		}

		if (_tabSize > 0) { // Has view tabs?
			self.click("a[href='#back-tab']", () => !self.backTab())
			.click("a[href='#prev-tab']", (ev, el) => !self.setTabMask(+(el.dataset.mask ?? _tabMask)).prevTab())
			.click("a[href='#next-tab']", (ev, el) => !self.setTabMask(+(el.dataset.mask ?? _tabMask)).nextTab())
			.click("a[href='#last-tab']", ev => !self.lastTab())
			.click("a[href^='#tab-']", (ev, el) => !self.viewTab(sb.lastId(el.href)));
		}
		return self;
	}

	this.alerts = function(alerts, opts) {
		opts = opts || {};
		opts.classAlertText = opts.classAlertText || "alert-text";
		opts.classAlertClose = opts.classAlertClose || "alert-close";
		opts.classTipError = opts.classTipError || "ui-errtip";
		opts.classInputError = opts.classInputError || "ui-error";

		const texts = self.getAll("." + opts.classAlertText, alerts);
		const showAlert = el => { el.parentNode.classList.remove("hide", "fadeOut"); el.parentNode.classList.add("fadeIn"); return self; }
		const closeAlert = el => { el.parentNode.classList.replace("fadeIn", "fadeOut"); return self; }
		const setAlert = (el, txt) => txt ? showAlert(el).setInnerHtml(el, i18n.tr(txt)) : self;

		self.showOk = msg => setAlert(texts[0], msg); //green
		self.showInfo = msg => setAlert(texts[1], msg); //blue
		self.showWarn = msg => setAlert(texts[2], msg); //yellow
		self.showError = msg => setAlert(texts[3], msg); //red
		self.showAlerts = function(msgs) { //show posible multiple messages types
			return msgs ? self.showOk(msgs.msgOk).showInfo(msgs.msgInfo).showWarn(msgs.msgWarn).showError(msgs.msgError) : self;
		}

		const fnGetTiperr = el => self.sibling(el, "." + opts.classTipError); // tip error
		const fnClearError = el => {
			const tip = fnGetTiperr(el);
			self.setInnerHtml(tip, EMPTY).hide(tip).removeClass(el, opts.classInputError);
		}
		self.closeAlerts = function() { // Hide all alerts
			i18n.reset(); // Clear previos messages
			return self.each(texts, closeAlert).each(INPUTS, fnClearError);
		}
		self.setOk = (form, msg) => {
			return self.each(alerts.children, fnHide).each(form.elements, fnClearError).showOk(msg);
		}
		self.setErrors = (form, messages) => {
			if (isstr(messages)) // simple message text
				return self.showError(messages);
			self.reverse(form.elements, el => { // Reverse iterator
				const msg = messages[el.name]; // message to show
				if (msg) {
					const tip = fnGetTiperr(el);
					const partner = self.sibling(el, INPUTS); // Partner element
					self.setInnerHtml(tip, msg).show(tip)
						.addClass(el, opts.classInputError).addClass(partner, opts.classInputError)
						.focus(fnVisible(el) ? el : partner);
				}
			});
			return self.showError(messages.msgError);
		}

		// Show posible server messages and close click event
		const close = self.getAll("." + opts.classAlertClose, alerts);
		return self.each(texts, el => { el.firstChild && showAlert(el); })
					.click(close, (ev, el) => closeAlert(el));
	}
}

export default new DomBox();
