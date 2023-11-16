
import Table from "./components/Table.js";
import tables from "./data/test/tables.js";

import Autocomplete from "./components/Autocomplete.js";
import autocompletes from "./data/test/autocompletes.js";

const initView = () => {
	document.querySelectorAll(".autocomplete").forEach(el => {
		const ac = new Autocomplete(el, autocompletes[el.id]);
	});
	document.querySelectorAll("table.tb").forEach(tb => {
		const table = new Table(tb, tables[tb.id]);
		table.render(tables[tb.id].data);
	});
}

document.addEventListener("DOMContentLoaded", initView); // on load view
document.addEventListener("astro:after-swap", initView); // after view transition event
