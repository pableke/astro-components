
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

	// Alerts instance and links toggle
	window.alerts = new Alerts(_top.nextElementSibling); // Alerts messages is global
	document.querySelectorAll("[href='#toggle']").forEach(link => { // Info links
		link.addEventListener("click", ev => {
			const toggle = link.dataset.css || "hide";
			const selector = link.dataset.target || (".info-" + link.id);
			document.querySelectorAll(selector).forEach(el => el.classList.toggle(toggle));

			const icon = link.getElementById("icon-" + link.id);
			if (icon && link.dataset.toggle) // change link icon class?
				link.dataset.toggle.split(/\s+/).forEach(name => icon.classList.toggle(name));

			const input = link.dataset.focus && document.querySelector(link.dataset.focus);
			input && input.focus(); // set focus on input
		});
	});
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
