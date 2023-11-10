
import Form from "../components/Form.js";
import Table from "../components/Table.js";
import tabs from "../components/Tabs.js";
import factura from "../model/Factura.js";
import i18n from "../i18n/langs.js";

document.addEventListener("DOMContentLoaded", () => {
	const linea = factura.getLinea();
	var acTercero; // Autocomplete de terceros

	/*** Filtro + listado de solicitudes ***/
    const tabFilter = tabs.getTab(2);
	const fFilter = document.forms.find(form => (form.name == "xeco-filter"));
    const formFilter = new Form(fFilter);
    const msgEmptyFacturas = "No se han encontrado solicitudes para a la búsqueda seleccionada";
    let tSolicitudes = tabFilter.querySelector("table#solicitudes");
    let facturas = new Table(tSolicitudes, { msgEmptyTable: msgEmptyFacturas });
    tabs.setViewEvent(2, tab => formFilter.setFocus("#filtro-ej"));
    window.loadFacturas = (xhr, status, args) => {
        formFilter.setActions(); // Reload inputs actions
        tSolicitudes = tabFilter.querySelector("table#solicitudes");
        facturas = new Table(tSolicitudes, { msgEmptyTable: msgEmptyFacturas });
        window.showTab(xhr, status, args, 2);
    }
    window.updateFactura = (xhr, status, args) => window.showTab(xhr, status, args, 2) && facturas.hide(".firma-" + args.id).text(".estado-" + args.id, "Procesando...");
    /*** Filtro + listado de solicitudes ***/

	/*** FORMULARIO PRINCIPAL ***/
    const fFact = document.forms.find(form => (form.name == "xeco-fact"));
    const formFact = new Form(fFact);
    tabs.setViewEvent(1, tab => formFact.autofocus());

	//****** tabla de los conceptos a facturar ******//
	const fnCalcIva = iva => {
		const resume = lineas.getResume();
		const impIva = resume.imp * (iva / 100);
		lineas.text("#imp-iva", i18n.isoFloat(impIva) + " €").text("#imp-total", i18n.isoFloat(resume.imp + impIva) + " €");
	}
	const tLineas = fFact.querySelector("#conceptos");
    const lineas = new Table(tLineas, {
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
	//****** tabla de los conceptos a facturar ******//

	const resetDelegaciones = () => formFact.setSelect("#delegacion", [], "Seleccione una delegación").setval("#idDelegacion");
    window.loadDelegaciones = (xhr, status, args) => {
        const data = JSON.read(args?.delegaciones); // get items
        if (JSON.size(data) > 0) // Load options from items
			formFact.setSelect("#delegacion", data).setval("#idDelegacion", data[0].value);
        else
			resetDelegaciones();
    }

	window.viewFactura = (xhr, status, args) => {
		loadDelegaciones(xhr, status, args); // cargo las delegaciones
		formFact.onChangeSelect("#sujeto", el => formFact.toggle(".grupo-exento", el.value == 0));
		formFact.onChangeSelect("#face", el => {
			formFact.text("[for=og]", (el.value == 2) ? "Nombre de la plataforma:" : "Órgano Gestor:")
					.toggle(".grupo-face", el.value == 1).toggle(".grupo-gestor", el.value != 0);
		});
        factura.setData(formFact.setActions().getData()); // prepare inputs and load data before render
        lineas.render(JSON.read(args?.data)); // Muestro las líneas asociadas a la factura/CP
        tabs.setActions(fFact).showTab(1); // Muestra el tab
	};
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
			const data = formFact.isValid(linea.validate);
			if (data) {
				lineas.push(data); // save container
				formFact.restart("#desc").setval("#imp");
			}
			ev.preventDefault();
		});
		window.viewFactura(xhr, status, args);
	}
	window.fnSend = () => {
		if (lineas.isEmpty())
			return !formFact.setError("#desc", "Debe detallar los conceptos asociados a la solicitud.");
		formFact.setval("#lineas", JSON.stringify(lineas.getData()));
		return formFact.isValid(factura.validate) && confirm("¿Confirma que desea firmar y enviar esta solicitud?");
	}
	/*** FORMULARIO PRINCIPAL ***/

	/*** MAPA DE LA VISTA DEL FORMULARIO ***/
	function fnFiscal(eco, sujeto, exento, m349, iban, iva) {
		formFact.setval("#economica", eco).setval("#sujeto", sujeto).setval("#exento", exento)
				.setval("#m349", m349).setval("#iban", iban).setval("#iva", iva)
				.toggle(".grupo-exento", sujeto == 0);
	}
	const fnDefault = () => fnFiscal(null, 0, 0, 0);
	const fnCP13 = () => fnFiscal(null, 0, 0, 0, 10);
	const fn323003_010 = () => fnFiscal("323003", 0, 1, 0);
	const fn323003_106 = () => fnFiscal("323003", 1, 0, 6);
	const fnC2T14 = () => fnFiscal("131004", 0, 1, 0, 10);
	const fnC2UET14 = () => fnFiscal("131004", 1, 0, 6, 10);
	const fnC2ZZT14 = () => fnFiscal("131004", 1, 0, 0, 10);
	const fnC2T15 = () => fnFiscal("131200", 0, 1, 0, 10);
	const fnC2TUE15 = () => fnFiscal("131200", 1, 0, 6, 10);
	const fnC2T16 = () => fnFiscal("139000", 1, 0, 0, 10, 21);
	const fnC2UET16 = () => fnFiscal("139000", 1, 0, 6, 10);
	const fnC2T17 = () => fnFiscal("139001", 1, 0, 0, 10, 21);
	const fnC2UET17 = () => fnFiscal("139001", 1, 0, 6, 10);
	const fnC2T18 = () => fnFiscal("139002", 1, 0, 0, 10, 21);
	const fnC2UET18 = () => fnFiscal("139002", 1, 0, 6, 10);
	const fnC1T5 = () => fnFiscal("131600", 0, 0, 0, 10, 21);
	const fnC1UET5 = () => fnFiscal("131600", 1, 0, 6, 10);
	const fnC1ZZT5 = () => fnFiscal("131600", 1, 0, 0, 10);
	const fnC2T19 = () => fnFiscal("131600", 0, 5, 2, 10);
	const fnC2ZZT19 = () => fnFiscal("131600", 0, 2, 0, 10);
	const fnC1T1 = () => fnFiscal("132500", 0, 0, 0, 4, 21);
	const fnC2T1 = () => fnFiscal("132500", 1, 0, 6, 4, 21);
	const fnC1T20 = () => fnFiscal("132700", 0, 0, 0, 10, 21);
	const fnC1UET20 = () => fnFiscal("132700", 1, 0, 6, 10);
	const fnC1ZZT20 = () => fnFiscal("132700", 1, 0, 0, 10);
	const fnC1T21 = () => fnFiscal("132600", 0, 0, 0, 10, 4);
	const fn133001 = () => fnFiscal("133001", 0, 0, 0, 10, 4);
	const fnC2UET22 = () => fnFiscal("133001", 0, 5, 2, 10);
	const fnC2ZZT22 = () => fnFiscal("133001", 0, 2, 0, 10);
	const fnC2UET23 = () => fnFiscal("133001", 1, 0, 6, 10);
	const fnC2ZZT23 = () => fnFiscal("133001", 1, 0, 0, 10);
	const fnC1T6 = () => fnFiscal("154000", 0, 0, 0, 10, 21);
	const fnC2T2 = () => fnFiscal("155100", 0, 0, 0, 4, 21);
	const fnC2UET2 = () => fnFiscal("155100", 1, 0, 6, 4);
	const ECONOMICAS = {
		cp13: fnCP13, // Cartas de pago
		c1epes4: fn323003_010, c1noes4: fn323003_010, c1noue4: fn323003_010, c1nozz4: fn323003_010, c2epes4: fn323003_010, c2noes4: fn323003_010, c2noue4: fn323003_106, c2nozz4: fn323003_010, c3epes4: fn323003_010, c3noes4: fn323003_010, c3noue4: fn323003_106, c3nozz4: fn323003_010,
		c2epes14: fnC2T14, c2noes14: fnC2T14, c2noue14: fnC2UET14, c2nozz14: fnC2ZZT14, c3epes14: fnC2T14, c3noes14: fnC2T14, c3noue14: fnC2UET14, c3nozz14: fnC2ZZT14,
		c1epes3: fn323003_010, c1noes3: fn323003_010, c1noue3: fn323003_010, c1nozz3: fn323003_010, c2epes3: fn323003_010, c2noes3: fn323003_010, c2noue3: fn323003_106, c2nozz3: fn323003_010, c3epes3: fn323003_010, c3noes3: fn323003_010, c3noue3: fn323003_106, c3nozz3: fn323003_010,
		c2epes15: fnC2T15, c2noes15: fnC2T15, c2noue15: fnC2TUE15, c2nozz15: fnC2T15, c3epes15: fnC2T15, c3noes15: fnC2T15, c3noue15: fnC2TUE15, c3nozz15: fnC2T15,
		c1epes9: fn323003_010, c1noes9: fn323003_010, c1noue9: fn323003_010, c1nozz9: fn323003_010, c2epes9: fn323003_010, c2noes9: fn323003_010, c2noue9: fn323003_106, c2nozz9: fn323003_010, c3epes9: fn323003_010, c3noes9: fn323003_010, c3noue9: fn323003_106, c3nozz9: fn323003_010,
		c2epes16: fnC2T16, c2noes16: fnC2T16, c2noue16: fnC2UET16, c2nozz16: fnC2T16, c3epes16: fnC2T16, c3noes16: fnC2T16, c3noue16: fnC2UET16, c3nozz16: fnC2T16,
		c2epes17: fnC2T17, c2noes17: fnC2T17, c2noue17: fnC2UET17, c2nozz17: fnC2T17, c3epes17: fnC2T17, c3noes17: fnC2T17, c3noue17: fnC2UET17, c3nozz17: fnC2T17,
		c2epes18: fnC2T18, c2noes18: fnC2T18, c2noue18: fnC2UET18, c2nozz18: fnC2T18, c3epes18: fnC2T18, c3noes18: fnC2T18, c3noue18: fnC2UET18, c3nozz18: fnC2T18,
		c1epes5: fnC1T5, c1noes5: fnC1T5, c1noue5: fnC1T5, c1nozz5: fnC1T5, c2epes5: fnC1T5, c2noes5: fnC1T5, c2noue5: fnC1UET5, c2nozz5: fnC1ZZT5, c3epes5: fnC1T5, c3noes5: fnC1T5, c3noue5: fnC1UET5, c3nozz5: fnC1ZZT5,
		c1epes19: fnC1T5, c1noes19: fnC1T5, c1noue19: fnC1T5, c1nozz19: fnC1T5, c2epes19: fnC1T5, c2noes19: fnC1T5, c2noue19: fnC2T19, c2nozz19: fnC2ZZT19, c3epes19: fnC1T5, c3noes19: fnC1T5, c3noue19: fnC2T19, c3nozz19: fnC2ZZT19,
		c1epes1: fnC1T1, c1noes1: fnC1T1, c1noue1: fnC1T1, c1nozz1: fnC1T1, c2epes1: fnC1T1, c2noes1: fnC1T1, c2noue1: fnC2T1, c2nozz1: fnC1T1, c3epes1: fnC1T1, c3noes1: fnC1T1, c3noue1: fnC2T1, c3nozz1: fnC1T1,
		c1epes20: fnC1T20, c1noes20: fnC1T20, c1noue20: fnC1T20, c1nozz20: fnC1T20, c2epes20: fnC1T20, c2noes20: fnC1T20, c2noue20: fnC1UET20, c2nozz20: fnC1ZZT20, c3epes20: fnC1T20, c3noes20: fnC1T20, c3noue20: fnC1UET20, c3nozz20: fnC1ZZT20,
		c2epes21: fnC1T21, c2noes21: fnC1T21, c3epes21: fnC1T21, c3noes21: fnC1T21,
		c1epes22: fn133001, c1noes22: fn133001, c1noue22: fn133001, c1nozz22: fn133001, c2epes22: fn133001, c2noes22: fn133001, c2noue22: fnC2UET22, c2nozz22: fnC2ZZT22, c3epes22: fn133001, c3noes22: fn133001, c3noue22: fnC2UET22, c3nozz22: fnC2ZZT22,
		c1epes23: fn133001, c1noes23: fn133001, c1noue23: fn133001, c1nozz23: fn133001, c2epes23: fn133001, c2noes23: fn133001, c2noue23: fnC2UET23, c2nozz23: fnC2ZZT23, c3epes23: fn133001, c3noes23: fn133001, c3noue23: fnC2UET23, c3nozz23: fnC2ZZT23,
		c1epes6: fnC1T6, c1noes6: fnC1T6, c1noue6: fnC1T6, c1nozz6: fnC1T6, c2epes6: fnC1T6, c2noes6: fnC1T6, c2noue6: fnC1T6, c2nozz6: fnC1T6, c3epes6: fnC1T6, c3noes6: fnC1T6, c3noue6: fnC1T6, c3nozz6: fnC1T6,
		c2epes2: fnC2T2, c2noes2: fnC2T2, c2noue2: fnC2UET2, c2nozz2: fnC2T2, c3epes2: fnC2T2, c3noes2: fnC2T2, c3noue2: fnC2UET2, c3nozz2: fnC2T2
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

        formFact.toggle("#ac-recibo", factura.isRecibo()).toggle(".firma-gaca", factura.isFirmaGaca());
		const fn = ECONOMICAS[keyEco + factura.getSubtipo()] || fnDefault;
		//console.log("ECONOMICAS", keyEco + factura.getSubtipo());
		fn();
	}
});
