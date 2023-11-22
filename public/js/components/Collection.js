
const RE_VAR = /@(\w+);/g;
const fnSize = data => data ? data.length : 0; //string o array
const fnParse = data => data && JSON.parse(data); //JSON parse
const format = (tpl, data) => tpl.replace(RE_VAR, (m, k) => data[k] ?? "");
const fnVisible = el => (el.offsetWidth || el.offsetHeight || el.getClientRects().length);

function Collection() {
	const self = this; //self instance
    
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

    // Extends Array prototype
    function fnEachPrev(fn) { self.eachPrev(this, fn); }
    Array.prototype.eachPrev = fnEachPrev;

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

// Mute JSON
JSON.size = fnSize;
JSON.read = fnParse;

// Extends HTMLElement prototype
HTMLElement.prototype.isVisible = function() { return fnVisible(this); }
HTMLElement.prototype.render = function(data) {
    const hide = this.dataset.hide || "hide"; // default hide class
    if (data) {
        this.dataset.template = this.dataset.template || this.innerHTML; // save current template
        this.innerHTML = format(this.dataset.template, data);
        this.classList.remove(hide);
    }
    else
        this.classList.add(hide);
    return this;
}

// Extends String prototype
String.prototype.format = function(fn) { return this.replace(RE_VAR, fn); }
String.prototype.render = function(data) { return format(this, data); }

export default new Collection();
