
const EMPTY = [];
const fnEmpty = () => EMPTY;
const fnParam = param => param;

HTMLCollection.prototype.forEach = Array.prototype.forEach;
const TR1 = "àáâãäåāăąÀÁÂÃÄÅĀĂĄÆßèéêëēĕėęěÈÉĒĔĖĘĚìíîïìĩīĭÌÍÎÏÌĨĪĬòóôõöōŏőøÒÓÔÕÖŌŎŐØùúûüũūŭůÙÚÛÜŨŪŬŮçÇñÑþÐŔŕÿÝ";
const TR2 = "aaaaaaaaaAAAAAAAAAABeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIoooooooooOOOOOOOOOuuuuuuuuUUUUUUUUcCnNdDRryY";

const fnSize = str => str ? str.length : 0; //string o array
const inRange = (num, min, max) => (min <= num) && (num <= max);
const replaceAt = (str1, str2, i) => {
    return str1.substring(0, i) + str2 + str1.substring(i + str2.length);
}
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
    const i = tr(str1).toLowerCase().indexOf(tr(str2).toLowerCase()); // Insensitive search
    return (i < 0) ? str1 : (str1.substr(0, i) + "<u><b>" + str1.substr(i, str2.length) + "</b></u>" + str1.substr(i + str2.length));
}

export default function(block, opts) {
    opts = opts || {};
	opts.delay = opts.delay || 400; //milliseconds between keystroke occurs and when a search is performed
	opts.minLength = opts.minLength || 3; //length to start
	opts.maxResults = opts.maxResults || 10; //max showed rows (default = 10)
    opts.activeClass = opts.activeClass || "active"; // name class
    opts.source = opts.source || fnEmpty; //empty source by default
    opts.render = opts.render || fnParam; //render label on input

	const self = this; //self instance
    const inputValue = block.querySelector("[type=hidden]");
    const autocomplete = block.querySelector("[type=search]");
    const resultsHTML = block.querySelector("ul.results");

    let _searching, _time; // call and time indicator (reduce calls)
    let _results = EMPTY; // default = empty array
    let _index = -1 // current item position in results

    this.render = data => {
        clearItems();
        inputValue.value = "";
        _results = data || EMPTY; // Force not unset var
        _results.slice(0, opts.maxResults).forEach((data, i) => {
            const label = wrap(opts.render(data, i, _results), autocomplete.value);
            resultsHTML.innerHTML += `<li class="option">${label}</li>`;
        });
        //resultsHTML.style.display = "block";
        return self;
    }

    function clearItems() {
        _index = -1;
        resultsHTML.innerHTML = "";
    }
    function loadItem(i) {
        const size = fnSize(resultsHTML.children);
        if ((i < 0) || (i >= size))
            return null; // item not found
        resultsHTML.children.forEach(li => li.classList.remove(opts.activeClass));
        const li = resultsHTML.children[i];
        li.classList.add(opts.activeClass);
        inputValue.value = _results[i];
        _index = i;
        return li;
    }
    function selectItem(li) {
        autocomplete.value = li ? li.innerText : "";
        clearItems();
    }
    async function fnSearch() {
        _searching = true; // Avoid new searchs
        try {
            _results = await opts.source(autocomplete.value); // Source call
            self.render(_results); // Render UL in view
        }
        catch(ex) {
            console.log(ex);
        }
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
            selectItem(resultsHTML.children[_index]);
    }
    autocomplete.onkeyup = ev => { // Event fired after char is writen in text
        if (fnSize(autocomplete.value) < opts.minLength)
            return clearItems();
        // Reduce server calls, only for backspace, alfanum or not is searching
        let search = (ev.keyCode == 8) || inRange(ev.keyCode, 46, 111) || inRange(ev.keyCode, 160, 223);
        if (search && !_searching) {
            clearTimeout(_time);
            _time = setTimeout(fnSearch, opts.delay);
        }
    }
    autocomplete.onblur = ev => setTimeout(clearItems, 150);
    resultsHTML.onclick = ev => selectItem(ev.target);
}
