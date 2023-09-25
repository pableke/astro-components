
const EMPTY = [];
const RE_VAR = /@(\w+);/g;

const fnVoid = () => {};
const fnTrue = () => true;
const format = (tpl, data) => tpl.replace(RE_VAR, (m, k) => data[k] ?? "");

export default function(table, opts) {
    opts = opts || {}; // default options
    opts.msgConfirmRemove = opts.msgConfirmRemove || "Remove current element?";
    opts.msgConfirmReset = opts.msgConfirmReset || "Remove all elements?";
    opts.msgEmptyTable = opts.msgEmptyTable || "Not found results";
    opts.beforeRender = opts.beforeRender || fnVoid;
    opts.onRender = opts.onRender || fnVoid;
    opts.afterRender = opts.afterRender || fnVoid;
    opts.onRemove = opts.onRemove || fnTrue;
    opts.onReset = opts.onReset || fnTrue;

	const self = this; //self instance
    const RESUME = {}; //sum and count
    const ROW_FMT = {}; //formatted data
    const tbody = table.tBodies[0]; //body element
    const tplBody = tbody.innerHTML; //body template
    const tplFoot = table.tFoot.innerHTML; //footer template

    let _rows = EMPTY; // default = empty array
    let _index = -1 // current item position in data

    function fnRender(data) {
        _rows = data || EMPTY;
        RESUME.size = _rows.length;

        opts.beforeRender(RESUME);
        if (RESUME.size) {
            tbody.innerHTML = "";
            _rows.forEach((row, i) => {
                opts.onRender(row, RESUME, ROW_FMT, i);
                tbody.innerHTML += format(tplBody, ROW_FMT);
            });
        }
        else
            tbody.innerHTML = '<tr><td class="no-data" colspan="99">' + opts.msgEmptyTable + '</td></tr>';
        opts.afterRender(RESUME);
        table.tFoot.innerHTML = format(tplFoot, RESUME);
        tbody.style.display = table.tFoot.style.display = "table-row-group";

        // Listeners for change, find and remove events
        tbody.querySelectorAll("tr").forEach((tr, i) => {
            tr.dataset.index = i; // add current index
            tr.onchange = ev => {
                _index = i; // current item
                const fnChange = opts["change-" + ev.target.name];
                fnChange(_rows[i], tr, ev.target, i);
            };
        });
        tbody.querySelectorAll("a[href^='#find']").forEach(link => {
            link.onclick = ev => {
                const tr = link.closest("tr");
                _index = +tr.dataset.index; // current item
                const name = link.getAttribute("href");
                const fnFind = opts[name.substring(1)];
                fnFind(_rows[_index], tr, link, _index);
            };
        });
        tbody.querySelectorAll("a[href='#remove']").forEach(link => {
            link.onclick = ev => {
                const tr = link.closest("tr");
                _index = +tr.dataset.index; // current item
                opts.remove();
            };
        });
        return self;
    }

    this.remove = () => {
        if (confirm(opts.msgConfirmRemove) && opts.onRemove(_rows[_index])) {
            _rows.splice(_index, 1); // Remove data row
            return fnRender(_rows); // Build table rows
        }
        return false;
    }
    this.reset = () => {
        return confirm(opts.msgConfirmReset) && opts.onReset(_rows) && fnRender(EMPTY);
    }

    this.render = fnRender;
    this.insert = (row, id) => { row.id = id; _rows.push(row); return fnRender(_rows); }
    this.update = row => { Object.assign(_rows[_index], row); return fnRender(_rows); }
    this.save = (row, id) => (id ? opts.insert(row, id) : opts.update(row)); // Insert or update

    function fnMove(i) {
        _index = (i < 0) ? 0 : Math.min(i, _rows.length - 1);
        return _rows[_index];
    }
    this.first = () => fnMove(0);
    this.prev = () => fnMove(_index - 1);
    this.next = () => fnMove(_index + 1);
    this.last = () => fnMove(_rows.length);
    this.goto = i => fnMove(i);

    table.tFoot.onchange = ev => {
        const input = ev.target;
        const fnChange = opts["change-" + input.name];
        fnChange(input.closest("tr"), input, RESUME, _rows);
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
                link.classList.remove("sort-asc");
                link.classList.remove("sort-desc");
                link.classList.add("sort-none");
            });
            link.classList.remove("sort-none");
            link.classList.add("sort-" + dir);

            // Sort data by function and build table
            const fnAsc = (a, b) => ((a[column] < b[column]) ? -1 : ((a[column] > b[column]) ? 1 : 0));
            const fnDesc = (a, b) => ((b[column] < a[column]) ? -1 : ((b[column] > a[column]) ? 1 : 0));
            let fnSort = opts["sort-" + column] || fnAsc; // Specific sort function
            fnSort = (dir == "desc") ? fnDesc : fnSort;
            fnRender(_rows.sort(fnSort));
        }
    });
}
