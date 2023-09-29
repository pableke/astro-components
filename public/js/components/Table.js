
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

export default function(table, opts) {
    opts = opts || {}; // default options
    opts.hideClass = opts.hideClass || "hide";
    opts.showClass = opts.showClass || "fadeIn";
    opts.navItemClass = opts.navItemClass || "nav-item";
    opts.navItemClass = opts.navItemClass || "nav-item";
    opts.msgConfirmRemove = opts.msgConfirmRemove || "Remove current element?";
    opts.msgConfirmReset = opts.msgConfirmReset || "Remove all elements?";
    opts.msgEmptyTable = opts.msgEmptyTable || "No results found";
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
    this.getRows = () => _rows;
    this.getIndex = () => _index;
    this.getItem = i => _rows[i ?? _index];
    this.getCurrentItem = () => _rows[_index];
    this.getCurrentRow = () => tbody.children[_index];

    function fnRender(data) {
        _rows = data || EMPTY;
        RESUME.size = _rows.length;

        opts.beforeRender(RESUME);
        tbody.innerHTML = RESUME.size
                                ? JSON.render(tplBody, _rows, (row, fmt, i) => opts.onRender(row, fmt, RESUME, i))
                                : '<tr><td class="no-data" colspan="99">' + opts.msgEmptyTable + '</td></tr>';
        const fmt = opts.afterRender(RESUME); // get formatted resume
        table.tFoot.innerHTML = format(tplFoot, fmt || RESUME); // render resume

        tbody.classList.remove(opts.hideClass);
        tbody.classList.add(opts.showClass);
        table.tFoot.classList.remove(opts.hideClass);
        table.tFoot.classList.add(opts.showClass);

        // Listeners for change, find and remove events
        tbody.children.forEach((tr, i) => {
            //tr.dataset.index = i; // add current index
            tr.onchange = ev => {
                _index = i; // current item
                const fnChange = opts["change-" + ev.target.name];
                fnChange(ev.target, self);
            };
            tr.querySelectorAll("a[href^='#find']").forEach(link => {
                link.onclick = ev => {
                    _index = i; // current item
                    const name = link.getAttribute("href");
                    const fnFind = opts[name.substring(1)];
                    fnFind(link, self); // call event
                };
            });
            tr.querySelectorAll("a[href='#remove']").forEach(link => {
                link.onclick = ev => {
                    _index = i; // current item
                    opts.remove(); // call event
                };
            });
        });
        return self;
    }

    this.remove = () => {
        if (confirm(opts.msgConfirmRemove) && opts.onRemove(self)) {
            _rows.splice(_index, 1); // Remove data row
            return fnRender(_rows); // Build table rows
        }
        return false;
    }
    this.reset = () => {
        return confirm(opts.msgConfirmReset) && opts.onReset(self) && fnRender(EMPTY);
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
    const links = table.tHead.querySelectorAll(".sort");
    links.forEach(link => {
        link.onclick = ev => {
            const dir = link.classList.contains("sort-asc") ? "desc" : "asc"; // Toggle sort direction
            const column = link.getAttribute("href").substring(1); // Column name

            // Update all sort icons
            links.forEach(link => {
                // Reset all orderable columns
                link.classList.remove("sort-asc", "sort-desc");
                link.classList.add("sort-none");
            });
            link.classList.remove("sort-none");
            link.classList.add("sort-" + dir);

            // Sort data by function and build table
            const fnAsc = (a, b) => ((a[column] < b[column]) ? -1 : ((a[column] > b[column]) ? 1 : 0));
            const fnSort = opts["sort-" + column] || fnAsc; // Specific sort function
            fnRender(_rows.sort((dir == "desc") ? ((a, b) => fnSort(b, a)) : fnSort));
        }
    });

    // Table items navigation
    document.getElementsByClassName(opts.navItemClass).forEach(link => {
        link.addEventListener("click", ev => { // Handle click event
            const href = link.getAttribute("href");
            if (href == "#first-item")
                return self.firstItem();
            if (href == "#prev-item")
                return self.prevItem();
            if (href == "#next-item")
                return self.nextItem();
            if (href == "#last-item")
                return self.lastItem();
            if (href == "#remove-item")
                return self.remove();
            ev.preventDefault();
        });
    });
}
