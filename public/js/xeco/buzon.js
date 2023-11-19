
import Form from "../components/Form.js";
import Table from "../components/Table.js";
import tabs from "../components/Tabs.js";
import buzon from "../model/Buzon.js";

document.addEventListener("DOMContentLoaded", () => { // on load view
	let justPagoRequired = false;

	const fBuzon = document.forms.find(form => (form.name == "xeco-buzon"));
	const formBuzon = new Form(fBuzon);
	const elTipo = formBuzon.getInput("#tipo");
	function updateBuzonOrganica() {
		const isIsu = buzon.isIsu(table.getCurrentItem());
		justPagoRequired = ((+elTipo.value == 2) && isIsu);
		formBuzon.toggle("#justPago", justPagoRequired).toggle("#check-jp", ((+elTipo.value == 2) && !isIsu));
	}
	function updateBuzonOtros() {
		justPagoRequired = +elTipo.value == 2;
		formBuzon.toggle("#justPago", justPagoRequired).hide("#check-jp");
	}

	const fOrganicas = document.forms.find(form => (form.name == "xeco-organicas"));
	const formOrganicas = new Form(fOrganicas);
	function fnSend(data, action) { // load data and send form to server
		formOrganicas.setval("#id-organica", data.org).setval("#cod-organica", data.oCod).setval("#id-ut", data.grp)
					.click(action).reset();
		return form.reset(); // autofocus
	}

	const tOrganicas = tabs.getTab(0).querySelector("#organcias");
	const table = new Table(tOrganicas);
	table.set("onRender", buzon.render)
		.set("msgEmptyTable", "No dispone de orgánicas recientes")
		.set("#report", () => fnSend(table.getCurrentItem(), "#report"))
		.set("onRemove", () => fnSend(table.getCurrentItem(), "#remove"))
		.render(JSON.read(tOrganicas.previousElementSibling.innerHTML));
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

	const fTablero = document.forms.find(form => (form.name == "xeco-tablero"));
	const form = new Form(fTablero);
	form.setAutocomplete("#ac-organica", {
		minLength: 4,
		source: () => form.click("#find-organica"),
		render: item => item.label,
		select: item => item.value,
		afterSelect: () => form.click("#find-unidades-tramit")
	});
	window.isOrganica = () => form.isValid(buzon.isValidOrganica);

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
		const utSelect = form.getInput("#tramit");
		const block = fTablero.querySelector("#unidades-tramit");
		block.classList.toggle("hide", JSON.size(utSelect.children) < 2);
	}
	window.reloadOrganicas = (xhr, status, args) => {
		const data = JSON.read(args?.data); // new data
		if (!data) return; // Nada que hacer
		if (data.msgError)
			formOrganicas.showError(data.msgError);
		else {
			table.render(data); // reload table
			form.reset().showOk("saveOk"); // clear inputs, autofocus and message
		}
	}
});
