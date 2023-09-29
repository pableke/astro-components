
const EMPTY = [];
const fnEmpty = () => EMPTY;
const fnParam = param => param;

const TR1 = "àáâãäåāăąÀÁÂÃÄÅĀĂĄÆßèéêëēĕėęěÈÉĒĔĖĘĚìíîïìĩīĭÌÍÎÏÌĨĪĬòóôõöōŏőøÒÓÔÕÖŌŎŐØùúûüũūŭůÙÚÛÜŨŪŬŮçÇñÑþÐŔŕÿÝ";
const TR2 = "aaaaaaaaaAAAAAAAAAABeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIoooooooooOOOOOOOOOuuuuuuuuUUUUUUUUcCnNdDRryY";

const fnSize = data => data ? data.length : 0; //string o array
const inRange = (num, min, max) => (min <= num) && (num <= max);
const insertAt = (str1, str2, i) => str1.substring(0, i) + str2 + str1.substring(i)
const replaceAt = (str1, str2, i) => str1.substring(0, i) + str2 + str1.substring(i + str2.length);

JSON.size = fnSize;
JSON.read = data => data && JSON.parse(data);
HTMLCollection.prototype.forEach = Array.prototype.forEach;

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
    const i = tr(str1).toLowerCase().indexOf(tr(str2).toLowerCase()); // Insensitive search
    return (i < 0) ? str1 : insertAt(insertAt(str1, open, i), "</b></u>", i + str2.length + open.length);
}

export default function(block, opts) {
    opts = opts || {};
	opts.delay = opts.delay || 400; //milliseconds between keystroke occurs and when a search is performed
	opts.minLength = opts.minLength || 3; //length to start
	opts.maxResults = opts.maxResults || 10; //max showed rows (default = 10)
    opts.activeClass = opts.activeClass || "active"; // name class
    opts.source = opts.source || fnEmpty; //empty source by default
    opts.render = opts.render || fnParam; //render label on autocomplete
    opts.select = opts.select || fnParam; //set value in id input
    opts.onChange = opts.onChange || fnParam; //handle change event

	const self = this; //self instance
    const inputValue = block.querySelector("[type=hidden]");
    const autocomplete = block.querySelector("[type=search]");
    const resultsHTML = block.querySelector("ul.results");

    let _searching, _time; // call and time indicator (reduce calls)
    let _results = EMPTY; // default = empty array
    let _index = -1 // current item position in results

    this.getInputValue = () => inputValue;
    this.getAutocomplete = () => autocomplete;
    this.find = selector => block.querySelector(selector);

    this.reset = () => {
        _index = -1;
        resultsHTML.innerHTML = "";
        return self;
    }
    this.render = data => {
        self.reset();
        inputValue.value = "";
        _results = data || EMPTY; // Force not unset var
        _results.slice(0, opts.maxResults).forEach((data, i) => {
            const label = wrap(opts.render(data, i, _results), autocomplete.value);
            resultsHTML.innerHTML += `<li class="option" data-index="${i}">${label}</li>`;
        });
        //resultsHTML.style.display = "block";
        return self;
    }

    function isItem(i) {
        return ((i > -1) && (i < fnSize(resultsHTML.children)))
    }
    function loadItem(i) {
        if (isItem(i)) {
            resultsHTML.children.forEach(li => li.classList.remove(opts.activeClass));
            const li = resultsHTML.children[i];
            li.classList.add(opts.activeClass);
            inputValue.value = opts.select(_results[i]);
            _index = i;
            return li;
        }
        return null; // item not found
    }
    function selectItem(i) {
        if (isItem(i)) {
            const li = resultsHTML.children[i];
            autocomplete.value = li ? li.innerText : "";
            inputValue.value = opts.select(_results[i]);
        }
        self.reset();
        return null; // item not found
    }
    function fnSearch() {
        _searching = true; // Avoid new searchs
        self.render(opts.source(autocomplete.value, self)); // Render results
        _searching = false; // restore sarches
    }

     // Event fired before char is writen in text
    autocomplete.onkeydown = ev => {
        const TAB = 9;
        const UP = 38;
        const DOWN = 40;
        const ENTER = 13;

        if (ev.keyCode == UP)
            loadItem(_index - 1);
        else if (ev.keyCode == DOWN)
            loadItem(_index + 1);
        else if ((ev.keyCode == TAB) || (ev.keyCode == ENTER))
            selectItem(_index);
    }
    autocomplete.onkeyup = ev => { // Event fired after char is writen in text
        if (fnSize(autocomplete.value) < opts.minLength)
            return self.reset();
        // Reduce server calls, only for backspace, alfanum or not is searching
        const search = (ev.keyCode == 8) || inRange(ev.keyCode, 46, 111) || inRange(ev.keyCode, 160, 223);
        if (search && !_searching) {
            clearTimeout(_time);
            _time = setTimeout(fnSearch, opts.delay);
        }
    }
    autocomplete.onchange = ev => opts.onChange(ev, self);
    autocomplete.onblur = ev => setTimeout(self.reset, 150);
    resultsHTML.onclick = ev => selectItem(+ev.target.dataset.index);
}
