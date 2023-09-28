
import Alerts from "./components/Alerts.js";
import Table from "./components/Table.js";
import tables from "./data/tables.js";

import Autocomplete from "./components/Autocomplete.js";
import autocompletes from "./data/autocompletes.js";

const initView = () => {
	// Loading div
	const _loading = document.body.firstChild;
	window.loading = () => _loading.classList.remove("hide", "fadeOut");
	window.working = () => _loading.classList.add("fadeOut");

	// Scroll body to top on click and toggle back-to-top arrow
	const _top = _loading.nextElementSibling;
	window.onscroll = function() { _top.classList.toggle("hide", this.scrollY < 80); }
	_top.addEventListener("click", ev => document.body.scrollIntoView({ behavior: "smooth" }));

	// Alerts instance
	window.alerts = new Alerts(_top.nextElementSibling); // Alerts messages is global

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
