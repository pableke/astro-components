
const EMPTY = [];
const fnVoid = () => {}
const fnEmpty = () => EMPTY;
const fnParam = param => param;

const TR1 = "àáâãäåāăąÀÁÂÃÄÅĀĂĄÆßèéêëēĕėęěÈÉĒĔĖĘĚìíîïìĩīĭÌÍÎÏÌĨĪĬòóôõöōŏőøÒÓÔÕÖŌŎŐØùúûüũūŭůÙÚÛÜŨŪŬŮçÇñÑþÐŔŕÿÝ";
const TR2 = "aaaaaaaaaAAAAAAAAAABeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIoooooooooOOOOOOOOOuuuuuuuuUUUUUUUUcCnNdDRryY";

const fnSize = data => data ? data.length : 0; //string o array
const inRange = (num, min, max) => (min <= num) && (num <= max);
const insertAt = (str1, str2, i) => str1.substring(0, i) + str2 + str1.substring(i)
const replaceAt = (str1, str2, i) => str1.substring(0, i) + str2 + str1.substring(i + str2.length);

JSON.size = fnSize; // Mute JSON
JSON.read = data => data && JSON.parse(data);
HTMLCollection.prototype.forEach = Array.prototype.forEach; // Extends HTMLCollection prototype
String.iIndexOf = (str1, str2) => tr(str1).toLowerCase().indexOf(tr(str2).toLowerCase()); // Mute String class with insensitive index
String.ilike = (str1, str2) => (String.iIndexOf(str1, str2) > -1); // Mute String class with an insensitive search
globalThis.loadItems = fnVoid; // Hack PF (only for CV-UAE)

function tr(str) {
    var output = str || "";
    const size = fnSize(str);
    for (let i = 0; i < size; i++) {
        let j = TR1.indexOf(str.charAt(i)); // is char remplazable
        output = (j < 0) ? output : replaceAt(output, TR2.charAt(j), i);
    }
    return output;
}
function wrap(str1, str2) {
    const open = "<u><b>"; // open tag indicator
    const i = String.iIndexOf(str1, str2); // Use extended insensitive search
    return (i < 0) ? str1 : insertAt(insertAt(str1, open, i), "</b></u>", i + str2.length + open.length);
}

export default function(block, opts) {
    opts = opts || {};
	opts.delay = opts.delay || 400; //milliseconds between keystroke occurs and when a search is performed
	opts.minLength = opts.minLength || 3; //length to start
	opts.maxResults = opts.maxResults || 10; //max showed rows (default = 10)
    opts.optionClass = opts.optionClass || "option"; // child name class
    opts.activeClass = opts.activeClass || "active"; // active option class
    opts.resultsClass = opts.resultsClass || "results"; // results list
	opts.autocompleteClass = opts.autocompleteClass || "ui-autocomplete"; // Autocomplete type
    opts.source = opts.source || fnEmpty; //empty source by default
    opts.render = opts.render || fnParam; //render label on autocomplete
    opts.select = opts.select || fnParam; //set value in id input
    opts.afterSelect = opts.afterSelect || fnVoid; //fired after an item is selected
    opts.onReset = opts.onReset || fnVoid; //fired when no value selected

	const self = this; //self instance
    const resultsHTML = block.querySelector("ul." + opts.resultsClass);
    const autocomplete = block.querySelector("input." + opts.autocompleteClass);
    const inputValue = autocomplete.nextElementSibling;
    autocomplete.type = "search"; // Force type

    let _searching, _time; // call and time indicator (reduce calls)
    let _results = EMPTY; // default = empty array
    let _index = -1 // current item position in results

    this.getData = () => _results;
    this.getIndex = () => _index;
    this.getItem = i => _results[i ?? _index];
    this.getCurrentItem = () => _results[_index];
    this.getCurrentOption = () => resultsHTML.children[_index];

    this.getInputValue = () => inputValue;
    this.getAutocomplete = () => autocomplete;

    const isChildren = i => inRange(i, 0, fnSize(resultsHTML.children) - 1);
    const removeList = () => { _index = -1; resultsHTML.innerHTML = ""; return self; }
    const fnClear = () => { inputValue.value = ""; return removeList(); }

    function activeItem(i) {
        _index = isChildren(i) ? i : _index; // current item
        resultsHTML.children.forEach((li, i) => li.classList.toggle(opts.activeClass, i == _index));
    }
    function selectItem(li, i) {
        if (li && isChildren(i)) {
            _index = i;
            autocomplete.value = li.innerText;
            inputValue.value = opts.select(_results[i], self);
            opts.afterSelect(_results[i], self);
            removeList();
        }
    }
    function fnSearch() {
        _searching = true; // Avoid new searchs
        globalThis.loadItems = (xhr, status, args) => { // NOT use
            self.render(JSON.read(args?.data)); // specific for PF
            globalThis.loadItems = fnVoid;
        }
        self.render(opts.source(autocomplete.value, self)); // Render results
        _searching = false; // restore sarches
    }

    this.reset = () => {
        autocomplete.value = "";
        opts.onReset(self);
        return fnClear();
    }
    this.render = data => {
        fnClear(); // clear previous results
        _results = data || EMPTY; // Force not unset var
        _results.slice(0, opts.maxResults).forEach((data, i) => {
            const label = wrap(opts.render(data, i, _results), autocomplete.value);
            resultsHTML.innerHTML += `<li class="${opts.optionClass}">${label}</li>`;
        });
        resultsHTML.children.forEach((li, i) => {
            li.onclick = ev => selectItem(li, i);
        });
        return self;
    }

     // Event fired before char is writen in text
    autocomplete.onkeydown = ev => {
        const TAB = 9;
        const UP = 38;
        const DOWN = 40;
        const ENTER = 13;

        if (ev.keyCode == UP)
            activeItem(_index - 1);
        else if (ev.keyCode == DOWN)
            activeItem(_index + 1);
        else if ((ev.keyCode == TAB) || (ev.keyCode == ENTER))
            selectItem(self.getCurrentOption(), _index);
    }
    autocomplete.onkeyup = ev => { // Event fired after char is writen in text
        if (fnSize(autocomplete.value) < opts.minLength)
            return fnClear();
        // Reduce server calls, only for backspace, alfanum or not is searching
        const search = (ev.keyCode == 8) || inRange(ev.keyCode, 46, 111) || inRange(ev.keyCode, 160, 223);
        if (search && !_searching) {
            clearTimeout(_time); // Clear previous searches
            _time = setTimeout(fnSearch, opts.delay);
        }
    }
    autocomplete.onblur = ev => {
        setTimeout(() => {
            if (!autocomplete.value)
                return self.reset();
            if (!inputValue.value)
                opts.onReset(self);
            removeList();
        }, 150);
    }
}
