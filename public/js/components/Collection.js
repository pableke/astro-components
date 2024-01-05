
const RE_VAR = /@(\w+);/g;
const fnSize = data => data ? data.length : 0; //string o array
const fnParse = data => data && JSON.parse(data); //JSON parse
const isset = val => ((typeof(val) !== "undefined") && (val !== null));
const format = (tpl, data) => tpl.replace(RE_VAR, (m, k) => data[k] ?? "");
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
    this.entries = function(tpl, data) {
        let output = ""; //result buffer
        for (const k in data)
            output += tpl.replace("@value;", k).replace("@label;", data[k]);
        return output;
    }
    this.params = function(data) {
        const results = [];
        for (const name in data)
            results.push({ name, value: data[name] });
        return results;
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
    HTMLCollection.prototype.eachPrev = fnEachPrev;
    HTMLCollection.prototype.find = Array.prototype.find;
    HTMLCollection.prototype.filter = Array.prototype.filter;
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
    HTMLCollection.prototype.findIndex = Array.prototype.findIndex;

    // Extends NodeList prototype
    NodeList.prototype.eachPrev = fnEachPrev;
    NodeList.prototype.find = Array.prototype.find;
    NodeList.prototype.filter = Array.prototype.filter;
}

// Client / Server global functions
globalThis.isset = isset;

// Mute JSON
JSON.size = fnSize;
JSON.read = fnParse;

// Extends HTMLElement prototype
HTMLElement.prototype.isVisible = function() { return fnVisible(this); }
HTMLElement.prototype.isSet = function(selector) {
    return fnVisible(this) && this.matches(selector);
}
HTMLElement.prototype.render = function(data) {
    this.dataset.template = this.dataset.template || this.innerHTML; // save current template
    this.innerHTML = format(this.dataset.template, data);
    return this;
}

// Extends String prototype
String.prototype.format = function(fn) { return this.replace(RE_VAR, fn); }
String.prototype.render = function(data) { return format(this, data); }

export default new Collection();
