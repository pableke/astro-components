
import Form from "../components/Form.js";
import tabs from "../components/Tabs.js";
import pf from "../components/Primefaces.js";

import factura from "../model/Factura.js";
import uxxiec from "../model/Uxxiec.js";
import i18n from "../i18n/langs.js";
import fiscal from "../data/fiscal.js"

document.addEventListener("DOMContentLoaded", () => {
	const linea = factura.getLinea();

	const fnCalcIva = iva => {
		const resume = lineas.getResume();
		const impIva = resume.imp * (iva / 100);
		lineas.text("#imp-iva", i18n.isoFloat(impIva) + " €").text("#imp-total", i18n.isoFloat(resume.imp + impIva) + " €");
	}
	const updateSujeto = sujeto => {
		factura.setSujeto(sujeto);
		formFact.toggle(".grupo-exento", factura.isExento());
	}
	const updateView = subtipo => {
		const item = acTercero.getCurrentItem(); // tercero seleccionado
		factura.setSubtipo(subtipo || factura.getSubtipo()); // actualizo el nuevo subtipo
		if (!item) return; // primer acceso

		let keyEco = "cp"; // por defecto = carta de pago
		if (factura.isFactura()) { // tipo de solicitud = factura
			keyEco = "c" + item.imp; //caracter => persona fisica=1, persona juridica=2, est. publico=3
			keyEco += (item.int & 256) ? "ep" : "no"; // Establecimiento permanente
			const ep_es = (item.int & 128) || (item.int & 256); //Establecimiento permanente o Residente
			// Residente en la peninsula=es, ceuta-melillacanarias=np, comunitario=ue, resto del mundo=zz
			keyEco += ep_es ? ((item.int & 2048) ? "es" : "np") : ((item.int & 2) ? "ue" : "zz");
		}

		const data = fiscal[keyEco + factura.getSubtipo()] || fiscal.default;
        formFact.setData(data, ".ui-fiscal").toggle("#ac-recibo", factura.isRecibo()).toggle(".firma-gaca", factura.isFirmaGaca());
		updateSujeto(data.sujeto);
		fnCalcIva(data.iva);
	}
	const updateFace = face => {
		factura.setFace(face);
		formFact.text(".grupo-gestor > .label", factura.isPlataforma() ? "Nombre de la plataforma:" : "Órgano Gestor:")
				.toggle(".grupo-face", factura.isFace()).toggle(".grupo-gestor", factura.isFace() || factura.isPlataforma());
	}

	/*** FORMULARIO PRINCIPAL ***/
    const formFact = new Form("#xeco-fact");
	const delegaciones = pf.datalist(formFact, "#delegacion", "#idDelegacion", { emptyOption: "Seleccione una delegación" });
	const acTercero = formFact.setAutocomplete("#acTercero", {
		delay: 500, //milliseconds between keystroke occurs and when a search is performed
		minLength: 5, //reduce matches
		source: () => formFact.click("#find-tercero"),
		render: item => item.label,
		select: item => item.value,
		afterSelect: item => { formFact.loading().click("#find-delegaciones"); updateView(); },
		onReset: delegaciones.reset
	});
	const acOrganica = formFact.setAcItems("#acOrganica", () => formFact.click("#find-organica"));
	const acRecibo = formFact.setAcItems("#acRecibo", () => formFact.click("#find-recibo"));
	formFact.onChangeInput("#subtipo", ev => updateView(+ev.target.value))
			.onChangeInput("#sujeto", ev => updateSujeto(+ev.target.value))
			.onChangeInput("#face", ev => updateFace(+ev.target.value));

	const lineas = formFact.setTable("#lineas-fact", {
        msgEmptyTable: "No existen conceptos asociados a la solicitud",
        beforeRender: resume => { resume.imp = 0; factura.setIva(formFact.valueOf("#iva")); },
        onRender: linea.render,
        onFooter: linea.resume,
        afterRender: resume => {
			fnCalcIva(factura.getIva())
			formFact.setval("#iva", factura.getIva());
			lineas.toggle(".factura-only", factura.isFactura());
		},
		"change-iva": el => fnCalcIva(+el.value)
    });
	formFact.setClick("a#add-linea", ev => {
		const data = formFact.isValid(linea.validate, ".ui-linea");
		if (data) {
			lineas.push(data); // save container
			formFact.restart("#desc").setval("#imp").setval("#memo", lineas.getItem(0).desc);
		}
		ev.preventDefault();
	});

    window.loadDelegaciones = (xhr, status, args) => {
        if (window.showTab(xhr, status, args))
            delegaciones.setItems(JSON.read(args.delegaciones));
    }

	window.viewFactura = (xhr, status, args) => {
        if (!window.showTab(xhr, status, args))
            return false; // Server error
		const data = JSON.read(args.fact);
        factura.setData(data); // Load data-model before view
		formFact.setData(data).readonly(factura.isDisabled())
				.toggle(".insert-only", factura.isEditable()).toggle(".update-only", factura.isDisabled())
				.toggle(".firmable-only", factura.isFirmable()).toggle(".rechazable-only", factura.isRechazable())
				.toggle(".show-recibo", factura.isRecibo()).toggle(".show-factura", factura.isFactura())
				.toggle(".show-factura-uae", uxxiec.isUae() && factura.isFactura()).toggle(".show-uae", uxxiec.isUae())
				.toggle(".show-gestor", factura.isFace() || factura.isPlataforma()).toggle(".show-face", factura.isFace())
				.toggle(".firma-gaca", factura.isFirmaGaca());
		delegaciones.setItems(JSON.read(args.delegaciones)); // cargo las delegaciones
		lineas.render(JSON.read(args.data)); // Load conceptos and iva input
		formFact.readonly(!factura.isEditableUae(), ".editable-uae"); // disable iva input
		acTercero.setValue(data.idTer, data.nif + " - " + data.tercero);
        acOrganica.setValue(data.idOrg, data.org + " - " + data.descOrg);
        acRecibo.setValue(data.idRecibo, data.acRecibo);
		updateSujeto(data.sujeto); // update sujeto inputs group
		updateFace(data.face); // update face inputs group
        tabs.render(".load-data", data).showTab(1);
	}
	window.fnSend = () => {
		factura.setLineas(lineas);
		if (formFact.isValid(factura.validate)) {
			formFact.saveTable("#lineas-json", lineas);
			return confirm("¿Confirma que desea firmar y enviar esta solicitud?");
		}
		return false;
	}
	/*** FORMULARIO PRINCIPAL ***/
});
