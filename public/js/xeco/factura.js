
import Form from "../components/Form.js";
import tabs from "../components/Tabs.js";
import factura from "../model/Factura.js";
import i18n from "../i18n/langs.js";
import fiscal from "../data/fiscal.js"

document.addEventListener("DOMContentLoaded", () => {
	const linea = factura.getLinea();
	var acTercero; // Autocomplete de terceros

	const fnCalcIva = iva => {
		const resume = lineas.getResume();
		const impIva = resume.imp * (iva / 100);
		lineas.text("#imp-iva", i18n.isoFloat(impIva) + " €").text("#imp-total", i18n.isoFloat(resume.imp + impIva) + " €");
	}
	const updateView = subtipo => {
		const item = acTercero.getCurrentItem(); // tercero seleccionado
		factura.setSubtipo(subtipo || formFact.valueOf("#subtipo")); // actualizo el nuevo subtipo
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
        formFact.setValues(data, ".ui-fiscal").toggle(".grupo-exento", data.sujeto == 0)
				.toggle("#ac-recibo", factura.isRecibo()).toggle(".firma-gaca", factura.isFirmaGaca());
		fnCalcIva(data.iva);
	}

	/*** FORMULARIO PRINCIPAL ***/
    const formFact = new Form("xeco-fact");
    const lineas = formFact.setTable("#lineas-fact", {
        msgEmptyTable: "No existen conceptos asociados a la solicitud",
        beforeRender: resume => { resume.imp = 0; factura.setIva(formFact.valueOf("#iva")); },
        onRender: linea.render,
        onFooter: linea.resume,
        afterRender: resume => {
			fnCalcIva(factura.getIva())
			formFact.setval("#iva", factura.getIva()).readonly(!factura.isEditableUae(), "#iva");
			lineas.toggle(".factura-only", factura.isFactura());
		},
		"change-iva": el => fnCalcIva(+el.value)
    });

	const resetDelegaciones = () => formFact.setSelect("#delegacion", [], "Seleccione una delegación").setval("#idDelegacion");
    window.loadDelegaciones = (xhr, status, args) => {
        const data = JSON.read(args?.delegaciones); // get items
        if (JSON.size(data) > 0) // Load options from items
			formFact.setSelect("#delegacion", data).setval("#idDelegacion", data[0].value);
        else
			resetDelegaciones();
    }

	window.viewFactura = (xhr, status, args) => {
		window.loadDelegaciones(xhr, status, args); // cargo las delegaciones
        factura.setData(formFact.setval("#lineas-json").setActions().getData()); // prepare inputs and load data before render
		formFact.setMode().toggle(".firmable-only", factura.isFirmable()).toggle(".rechazable-only", factura.isRechazable());
		formFact.onChangeSelect("#sujeto", el => formFact.toggle(".grupo-exento", el.value == 0));
		formFact.onChangeSelect("#face", el => {
			factura.setFace(+el.value);
			formFact.text("[for=og]", factura.isPlataforma() ? "Nombre de la plataforma:" : "Órgano Gestor:")
					.toggle(".grupo-face", factura.isFace()).toggle(".grupo-gestor", el.value != 0);
		});
        lineas.render(JSON.read(args?.data)); // Load conceptos
        tabs.showTab(1); // Muestra el tab
	}
    window.createFactura = (xhr, status, args) => {
		acTercero = formFact.setAutocomplete("#ac-tercero", {
			delay: 500, //milliseconds between keystroke occurs and when a search is performed
			minLength: 5, //reduce matches
			source: () => formFact.click("#find-tercero"),
			render: item => item.label,
			select: item => item.value,
			afterSelect: item => { formFact.click("#find-delegaciones"); updateView(); },
			onReset: resetDelegaciones
		});
		formFact.setAutocomplete("#ac-organica", {
			minLength: 4,
			source: () => formFact.click("#find-organica"),
			render: item => item.label,
			select: item => item.value,
			afterSelect: item => { },
			onReset: () => { }
		});
		formFact.setAutocomplete("#ac-recibo", {
			minLength: 4,
			source: () => formFact.click("#find-recibo"),
			render: item => item.label,
			select: item => item.value,
			afterSelect: item => { },
			onReset: () => { }
		});
		formFact.onChangeInput("#delegacion", ev => formFact.setval("#idDelegacion", ev.target.value))
				.onChangeInput("#subtipo", el => updateView(el.value));
		formFact.setClick("a#add-linea", ev => {
			const data = formFact.isValid(linea.validate, ".ui-linea");
			if (data) {
				lineas.push(data); // save container
				formFact.restart("#desc").setval("#imp").setval("#memo", lineas.getItem(0).desc);
			}
			ev.preventDefault();
		});
        window.viewFactura(xhr, status, args);
	}
	window.fnSend = () => {
		factura.setLineas(lineas);
		if (formFact.isValid(factura.validate)) {
			formFact.stringify("#lineas-json", lineas);
			return confirm("¿Confirma que desea firmar y enviar esta solicitud?");
		}
		return false;
	}
	/*** FORMULARIO PRINCIPAL ***/
});
