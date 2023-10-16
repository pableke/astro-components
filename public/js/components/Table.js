
import i18n from "../i18n/langs.js";

const EMPTY = [];
const RE_VAR = /@(\w+);/g;

const fnVoid = () => {};
const fnTrue = () => true;
const format = (tpl, data) => tpl.replace(RE_VAR, (m, k) => data[k] ?? "");

HTMLCollection.prototype.forEach = Array.prototype.forEach;
JSON.render = (tpl, data, fnRender) => {
    fnRender = fnRender || fnVoid;
    const status = { size: data.length };
    let output = ""; // Initialize result
    data.forEach((item, i) => { // render each item
        status.index = i;
        status.count = i + 1;
        fnRender(item, status, i, data)
        output += format(tpl, status);
    });
    return output;
}
JSON.entries = function(tpl, data) {
	let output = ""; //result buffer
	for (const k in data)
		output += tpl.replace("@value;", k).replace("@label;", data[k]);
	return output;
}

export default function(table, opts) {
    opts = opts || {}; // default options
    opts.hideClass = opts.hideClass || "hide";
    opts.showClass = opts.showClass || "fadeIn";
    opts.sortClass = opts.sortClass || "sort";
    opts.sortAscClass = opts.sortAscClass || "sort-asc";
    opts.sortDescClass = opts.sortDescClass || "sort-desc";
    opts.sortNoneClass = opts.sortNoneClass || "sort-none";
    opts.rowActionClass = opts.rowActionClass || "row-action";
    opts.tableActionClass = opts.tableActionClass || "table-action";
    opts.msgConfirmRemove = opts.msgConfirmRemove || "remove";
    opts.msgConfirmReset = opts.msgConfirmReset || "removeAll";
    opts.msgEmptyTable = opts.msgEmptyTable || "noResults";
    opts.beforeRender = opts.beforeRender || fnVoid;
    opts.onRender = opts.onRender || fnVoid;
    opts.afterRender = opts.afterRender || fnVoid;
    opts.onRemove = opts.onRemove || fnTrue;
    opts.onReset = opts.onReset || fnTrue;

	const self = this; //self instance
    const RESUME = {}; //sum and count
    const tbody = table.tBodies[0]; //body element
    const tplBody = tbody.innerHTML; //body template
    const tplFoot = table.tFoot.innerHTML; //footer template

    let _rows = EMPTY; // default = empty array
    let _index = -1 // current item position in data

    this.getResume = () => RESUME;
    this.getData = () => _rows;
    this.getIndex = () => _index;
    this.getItem = i => _rows[i ?? _index];
    this.getCurrentItem = () => _rows[_index];
    this.getCurrentRow = () => tbody.children[_index];

    this.clear = () => { _index = -1; return self; }
    this.set = (name, fn) => { opts[name] = fn; return self; }
	this.html = selector => table.querySelector(selector).innerHTML;

    function fnRender(data) {
        _rows = data || EMPTY;
        RESUME.size = _rows.length;

        opts.beforeRender(RESUME);
        tbody.innerHTML = RESUME.size
                                ? JSON.render(tplBody, _rows, (row, fmt, i) => opts.onRender(row, fmt, RESUME, i))
                                : '<tr><td class="no-data" colspan="99">' + i18n.get(opts.msgEmptyTable) + '</td></tr>';
        const fmt = opts.afterRender(RESUME); // get formatted resume
        table.tFoot.innerHTML = format(tplFoot, fmt || RESUME); // render resume

        tbody.classList.remove(opts.hideClass);
        tbody.classList.add(opts.showClass);
        table.tFoot.classList.remove(opts.hideClass);
        table.tFoot.classList.add(opts.showClass);

        // Row listeners for change, find and remove items
        tbody.children.forEach((tr, i) => {
            tr.onchange = ev => {
                _index = i; // current item
                const fnChange = opts["change-" + ev.target.name];
                fnChange(ev.target, self);
            };
            tr.getElementsByClassName(opts.rowActionClass).forEach(link => {
                link.onclick = ev => {
                    _index = i; // current item
                    ev.preventDefault(); // avoid navigation
                    const href = link.getAttribute("href");
                    if (href == "#remove") // Remove action
                        return self.remove(); // Remove row
                    opts[href](link, self); // Call action
                };
            });
        });
        return self;
    }

    this.remove = () => {
        if (confirm(i18n.get(opts.msgConfirmRemove)) && opts.onRemove(self)) {
            _rows.splice(_index, 1); // Remove data row
            return fnRender(_rows); // Build table rows
        }
        return false;
    }
    this.reset = () => {
        return confirm(i18n.get(opts.msgConfirmReset)) && opts.onReset(self) && fnRender(EMPTY);
    }

    this.render = fnRender;
    this.insert = (row, id) => { row.id = id; _rows.push(row); return fnRender(_rows); }
    this.update = row => { Object.assign(_rows[_index], row); return fnRender(_rows); }
    this.save = (row, id) => (id ? opts.insert(row, id) : opts.update(row)); // Insert or update

    function fnMove(i) {
        _index = (i < 0) ? 0 : Math.min(i, _rows.length - 1);
        return _rows[_index];
    }
    this.firstItem = () => fnMove(0);
    this.prevItem = () => fnMove(_index - 1);
    this.nextItem = () => fnMove(_index + 1);
    this.lastItem = () => fnMove(_rows.length);

    table.tFoot.onchange = ev => {
        const input = ev.target; // element changed
        const fnChange = opts["change-" + input.name] || fnVoid;
        table.tFoot.innerHTML = format(tplFoot, fnChange(input, self) || RESUME);
    }

    // Orderable columns system
    const links = table.tHead.getElementsByClassName(opts.sortClass);
    links.forEach(link => {
        link.onclick = ev => {
            const dir = link.classList.contains(opts.sortAscClass) ? opts.sortDescClass : opts.sortAscClass; // Toggle sort direction
            const column = link.getAttribute("href").substring(1); // Column name

            // Update all sort icons
            links.forEach(link => { // Reset all orderable columns
                link.classList.remove(opts.sortAscClass, opts.sortDescClass);
                link.classList.add(opts.sortNoneClass);
            });
            link.classList.remove(opts.sortNoneClass);
            link.classList.add(dir);

            // Sort data by function and rebuild table
            const fnAsc = (a, b) => ((a[column] < b[column]) ? -1 : ((a[column] > b[column]) ? 1 : 0)); // Default sort
            const fnAux = opts["sort-" + column] || fnAsc; // Load specific sort function
            const fnSort = (dir == opts.sortDescClass) ? ((a, b) => fnAux(b, a)) : fnAux; // Set direction
            fnRender(_rows.sort(fnSort)); // render sorted table
        }
    });

    this.setActions = el => { // Table acctions over data
        el.getElementsByClassName(opts.tableActionClass).forEach(link => {
            link.addEventListener("click", ev => { // Handle click event
                ev.preventDefault(); // avoid navigation
                const href = link.getAttribute("href");
                if (href == "#first")
                    return self.firstItem();
                if (href == "#prev")
                    return self.prevItem();
                if (href == "#next")
                    return self.nextItem();
                if (href == "#last")
                    return self.lastItem();
                if (href == "#remove")
                    return self.remove();
                const fnAction = opts[href];
                if (fnAction)
                    return fnAction(link, self);
            });
        });
        return self;
    }
    self.setActions(table);
}
