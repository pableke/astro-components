
import coll from "./Collection.js";
import i18n from "../i18n/langs.js";

const EMPTY = [];
const fnTrue = () => true;

export default function(table, opts) {
    opts = opts || {}; // default options
    opts.showClass = opts.showClass || "fadeIn";
    opts.sortClass = opts.sortClass || "sort";
    opts.sortAscClass = opts.sortAscClass || "sort-asc";
    opts.sortDescClass = opts.sortDescClass || "sort-desc";
    opts.sortNoneClass = opts.sortNoneClass || "sort-none";
    opts.rowActionClass = opts.rowActionClass || "row-action";
    opts.tableActionClass = opts.tableActionClass || "table-action";
    opts.msgConfirmRemove = opts.msgConfirmRemove || "remove";
    opts.msgConfirmReset = opts.msgConfirmReset || "removeAll";

    opts.beforeRender = opts.beforeRender || globalThis.void;
    opts.onRender = opts.onRender || globalThis.void;
    opts.onFooter = opts.onFooter || globalThis.void;
    opts.afterRender = opts.afterRender || globalThis.void;
    opts.onRemove = opts.onRemove || fnTrue;
    opts.onReset = opts.onReset || fnTrue;

	const self = this; //self instance
    const tBody = table.tBodies[0]; //body element
    const tplBody = tBody.innerHTML; //body template
    const tplEmpty = opts.msgEmptyTable ? '<tr><td class="no-data" colspan="99">' + i18n.get(opts.msgEmptyTable) + '</td></tr>' : "";
    const tplFoot = table.tFoot.innerHTML; //Footer template
    const RESUME = { columns: coll.size(tBody.rows[0]?.cells) }; //Table parameters
    const FOOTER = { columns: RESUME.columns }; //Footer output formated

    let _rows = EMPTY; // default = empty array
    let _index = -1; // current item position in data

    this.getResume = () => RESUME;
    this.getData = () => _rows;
    this.getIndex = () => _index;
    this.getItem = i => _rows[i ?? _index];
    this.isItem = () => (_index > -1) && (_index < _rows.length);
    this.getCurrentItem = () => _rows[_index];
    this.getLastItem = () => _rows.at(-1);
    this.getCurrentRow = () => tBody.children[_index];
    this.isEmpty = () => !_rows.length;
    this.size = () => _rows.length;

    this.getBody = () => tBody;
    this.setBody = data => { tBody.innerHTML = data || tplEmpty; return self; }

    this.clear = () => { _index = -1; return self; }
    this.set = (name, fn) => { opts[name] = fn; return self; }

	this.hide = selector => { table.querySelectorAll(selector).hide(); return self; }
	this.show = selector => { table.querySelectorAll(selector).show(); return self; }
	this.toggle = (selector, force) => force ? self.show(selector) : self.hide(selector);

    this.html = selector => table.querySelector(selector).innerHTML;
	this.text = (selector, text) => { table.querySelectorAll(selector).text(text); return self; } // Update all texts info in form

    function fnRender(data) {
        _index = -1; // clear previous selects
        _rows = data || []; // data to render on table
        FOOTER.size = RESUME.size = _rows.length;

        opts.beforeRender(RESUME); // Fired init. event
        tBody.innerHTML = RESUME.size ? coll.render(tplBody, _rows, opts.onRender, RESUME) : tplEmpty; // body
        table.tFoot.innerHTML = coll.format(tplFoot, opts.onFooter(RESUME, FOOTER) || FOOTER); // render formatted footer
        opts.afterRender(RESUME); // After body and footer is rendered

        tBody.show().classList.add(opts.showClass);
        table.tFoot.show().classList.add(opts.showClass);

        // Row listeners for change, find and remove items
        tBody.rows.forEach((tr, i) => {
            tr.onchange = ev => {
                _index = i; // current item
                const fnChange = opts["change-" + ev.target.name] || globalThis.void;
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
    this.push = row => { _rows.push(row); return fnRender(_rows); }  // Push data
    this.add = row => { delete row.id; return self.push(row); } // Force insert => remove PK
    this.insert = (row, id) => { row.id = id; return self.push(row); } // New row with PK
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
        const fnChange = opts["change-" + input.name] || globalThis.void;
        fnChange(input, self);
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

    // Init. table
    self.setActions(table);
    if (!tBody.rows.length)
        tBody.innerHTML = tplEmpty;
}
