
import pf from "../components/Primefaces.js";
import Form from "../components/Form.js";
import tabs from "../components/Tabs.js";
import buzon from "../model/Buzon.js";

document.addEventListener("DOMContentLoaded", () => { // on load view
	var justPagoRequired = false;

	const formBuzon = new Form("#xeco-buzon");
	const elTipo = formBuzon.getInput("#tipo");

	function updateBuzonOrganica() {
		const isIsu = buzon.setTipoPago(+elTipo.value).isIsu(table.getCurrentItem());
		justPagoRequired = buzon.isPagoCesionario() && isIsu;
		formBuzon.toggle("#justPago", justPagoRequired).toggle("#check-jp", buzon.isPagoCesionario() && !isIsu);
	}
	function updateBuzonOtros() {
		buzon.setTipoPago(+elTipo.value);
		justPagoRequired = buzon.isPagoCesionario();
		formBuzon.toggle("#justPago", justPagoRequired).hide("#check-jp");
	}

	const formOrganicas = new Form("#xeco-organicas");
	const table = formOrganicas.setTable("#organcias");

	const fnSend = action => {
		const data = table.getCurrentItem(); // load data and send form to server
		pf.send(action, { org: data.org, cod: data.oCod, ut: data.grp });
		return formOrganicas.reset(); // autofocus
	}

	table.set("onRender", buzon.render)
		.set("msgEmptyTable", "No dispone de orgánicas recientes")
		.set("#report", () => fnSend("report"))
		.set("onRemove", () => fnSend("remove"))
		.render(JSON.read(formOrganicas.html("#organcias-json")));
	table.set("#buzon", () => {
		const data = table.getCurrentItem();
		formBuzon.setval("#buzon-id-org", data.org).setval("#buzon-cod-org", data.oCod)
				.setval("#tramit-all", data.grp).readonly(true, "#tramit-all")
				.text("#org-desc", data.oCod + " / " + data.oDesc);
		elTipo.onchange = updateBuzonOrganica;
		updateBuzonOrganica();
		tabs.showTab(1);
	});
	table.set("#buzon-otros", () => {
		formBuzon.setval("#buzon-id-org", "").setval("#buzon-cod-org", "").readonly(false, "#tramit-all")
				.text("#org-desc", table.html("#otras"));
		elTipo.onchange = updateBuzonOtros;
		updateBuzonOtros();
		tabs.showTab(1);
	});

	formOrganicas.setAutocomplete("#organica", {
		minLength: 4,
		source: term => window.findOrganica([{name: "cod", value: term}]),
		render: item => item.label,
		select: item => item.value,
		afterSelect: item => window.setUnidadesTramit([{name: "org", value: item.value}])
	});
	window.isOrganica = () => formOrganicas.isValid(buzon.isValidOrganica);

	tabs.setShowEvent(2, tab => {
		const factura = formBuzon.getInput("#factura_input").files[0];
		const justPago = formBuzon.getInput("#justPago_input").files[0];
		if (!factura)
			return !formBuzon.showError("Debe seleccionar una factura.");
		if (justPagoRequired && !justPago)
			return !formBuzon.showError("Debe seleccionar Justificante de pago.");
		const fileNames = factura.name + (justPago ? (", " + justPago.name) : "");
		return formBuzon.text("#ut-desc", formBuzon.getOptionText("#tramit-all")).text("#file-name", fileNames);
	});

	window.loadUnidadesTramit = (xhr, status, args) => {
		const utSelect = formOrganicas.getInput("#tramit");
		formOrganicas.toggle("#unidades-tramit", JSON.size(utSelect.children) > 1);
	}
	window.reloadOrganicas = (xhr, status, args) => {
		if (window.showTab(xhr, status, args, 0)) {
			table.render(JSON.read(args.data)); // reload table
			formOrganicas.reset().showOk("saveOk"); // clear inputs, autofocus and message
		}
	}
});
