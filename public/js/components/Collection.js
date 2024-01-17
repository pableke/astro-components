
const RE_VAR = /@(\w+);/g;
const HIDE_CLASS = "hide";

const fnSize = data => data ? data.length : 0; //string o array
const fnParse = data => data && JSON.parse(data); //JSON parse
const isset = val => ((typeof(val) !== "undefined") && (val !== null));
const format = (tpl, data) => tpl.replace(RE_VAR, (m, k) => data[k] ?? "");

const fnHide = el => el.classList.add(HIDE_CLASS);
const fnShow = el => el.classList.remove(HIDE_CLASS);
const fnVisible = el => (el.offsetWidth || el.offsetHeight || el.getClientRects().length);

function Collection() {
	const self = this; //self instance

    this.isset = isset;
    this.size = fnSize;
    this.parse = fnParse;
    this.format = format;

    this.eachPrev = function(data, fn) {
        for (let i = fnSize(data) - 1; i > -1; i--)
            fn(data[i], i);
        return self;
    }

    this.render = (tpl, data, fnRender, resume) => {
        const status = {};
        resume = resume || {};
        fnRender = fnRender || fnVoid;

        let output = ""; // Initialize result
        status.size = resume.size = data.length;
        data.forEach((item, i) => { // render each item
            status.index = i;
            status.count = i + 1;
            fnRender(item, status, resume, data);
            output += format(tpl, status);
        });
        return output;
    }

    this.copy = function(output, data, keys) {
        if (keys)
            keys.forEach(key => { output[key] = data[key]; });
        else
            Object.assign(output, data);
        return output;
    }
    this.clone = function(data, keys) {
        return self.copy({}, data, keys);
    }
    this.clear = function(data, keys) {
        if (keys)
            keys.forEach(key => delete data[key]);
        else {
            for (let key in data)
                delete data[key];
        }
        return self;
    }

    // Extends Object
    Object.copy = self.copy;
    Object.clone = self.clone;
    Object.clear = self.clear;

    // Extends Array prototype
    function fnEachPrev(fn) { self.eachPrev(this, fn); }
    Array.prototype.eachPrev = fnEachPrev;
    Array.prototype.item = function(i) { return this[i % this.length]; }
    Array.prototype.last = function() { return this.at(-1); }

    // Extends HTMLCollection prototype
    function fnSetText(el, text) { el.innerHTML = text; }
    HTMLCollection.prototype.eachPrev = fnEachPrev;
    HTMLCollection.prototype.find = Array.prototype.find;
    HTMLCollection.prototype.filter = Array.prototype.filter;
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
    HTMLCollection.prototype.findIndex = Array.prototype.findIndex;
    HTMLCollection.prototype.hide = function() { this.forEach(fnHide); }
    HTMLCollection.prototype.show = function() { this.forEach(fnShow); }
    HTMLCollection.prototype.toggle = function(force) { this.forEach(force ? fnShow : fnHide); }
    HTMLCollection.prototype.text = function(text) { this.forEach(el => fnSetText(el, text)); }
    //HTMLCollection.prototype.mask = function(flags) { this.forEach((el, i) => el.toggle((flags >> i) & 1)); }

    // Extends NodeList prototype
    NodeList.prototype.eachPrev = fnEachPrev;
    NodeList.prototype.find = Array.prototype.find;
    NodeList.prototype.filter = Array.prototype.filter;
    NodeList.prototype.hide = function() { this.forEach(fnHide); }
    NodeList.prototype.show = function() { this.forEach(fnShow); }
    NodeList.prototype.toggle = function(force) { this.forEach(force ? fnShow : fnHide); }
    NodeList.prototype.text = function(text) { this.forEach(el => fnSetText(el, text)); }
    //NodeList.prototype.mask = function(flags) { this.forEach((el, i) => el.toggle((flags >> i) & 1)); }
}

// Client / Server global functions
globalThis.isset = isset;

// Mute JSON
JSON.size = fnSize;
JSON.read = fnParse;

// Extends HTMLElement prototype
HTMLElement.prototype.show = function() { fnShow(this); return this }
HTMLElement.prototype.hide = function() { fnHide(this); return this }
HTMLElement.prototype.toggle = function(force) { return force ? this.show() : this.hide(); }
HTMLElement.prototype.isHidden = function() { return this.classList.contains(HIDE_CLASS); } // has class hide
HTMLElement.prototype.isVisible = function(selector) {
    return fnVisible(this) && (selector ? this.matches(selector) : true);
}
HTMLElement.prototype.render = function(data) {
    this.dataset.template = this.dataset.template || this.innerHTML; // save current template
    this.innerHTML = format(this.dataset.template, data); // display new data
    return this;
}

HTMLElement.prototype.setDisabled = function(force) { // Update attribute and style
    this.classList.toggle("disabled", this.toggleAttribute("disabled", force));
    return this;
}
HTMLElement.prototype.setReadonly = function(force) { // Update attribute and style
    // The attribute readonly is not supported or relevant to <select> or input types file, checkbox, radio, range...
    if ([ "file", "checkbox", "radio", "range" ].includes(this.type))
        return this.setDisabled(force); // Force disabled attribute
    this.classList.toggle("readonly", this.toggleAttribute("readonly", force));
    return this;
}

// Extends String prototype
String.prototype.format = function(fn) { return this.replace(RE_VAR, fn); }
String.prototype.render = function(data) { return format(this, data); }

export default new Collection();
