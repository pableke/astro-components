
import alerts from "../components/Alerts.js";
import Form from "../components/Form.js";
import tabs from "../components/Tabs.js";
import uxxiec from "../model/Uxxiec.js";

document.addEventListener("DOMContentLoaded", () => {
    /*** Filtro + listado de solicitudes ***/
    const formFilter = new Form("xeco-filter");
    const OPTS_FILTER = { msgEmptyTable: "No se han encontrado solicitudes para a la búsqueda seleccionada" };
    let solicitudes = formFilter.setTable("#solicitudes", OPTS_FILTER);
    window.loadFiltro = (xhr, status, args) => {
        formFilter.setActions(); // Reload inputs actions
        solicitudes = formFilter.setTable("#solicitudes", OPTS_FILTER);
        window.showTab(xhr, status, args, 2);
    }
    window.updateList = (xhr, status, args) => {
        window.showTab(xhr, status, args, 2) && solicitudes.hide(".firma-" + args.id).text(".estado-" + args.id, "Procesando...");
    }

    window.fnIntegrar = link => confirm("¿Confirma que desea integrar esta solicitud en UXXI-EC?") && window.loading() && !link.classList.add("hide");
    window.fnFirmar = () => confirm("¿Confirma que desea firmar esta solicitud?") && window.loading();
    window.fnRemove = () => confirm("¿Confirmas que desea eliminar esta solicitud?") && window.loading();
    window.handleReport = (xhr, status, args) => window.showAlerts(xhr, status, args).redir(args?.url);
    /*** Filtro + listado de solicitudes ***/

    /*** FORMULARIO PARA EL RECHAZO/CANCELACIÓN DE SOLICITUDES ***/
    const formReject = new Form("xeco-reject");
    window.fnRechazar = () => formReject.isValid(uxxiec.validateReject) && confirm("¿Confirma que desea rechazar esta solicitud?");
    /*** FORMULARIO PARA EL RECHAZO/CANCELACIÓN DE SOLICITUDES ***/

    /*** FORMULARIO PARA LA CREACIÓN DEL EXPEDIENTE CON UXXI-EC ***/
    const tabUxxi = tabs.getTab(15);
    uxxiec.setData(tabUxxi.dataset);
    const formUxxi = new Form("xeco-uxxi");
	const tableUxxi = formUxxi.setTable("#docs-uxxi", {
        msgEmptyTable: "No se han encontrado documentos de UXXI-EC asociadas a la solicitud",
        onRender: uxxiec.render
    });

    const acUxxi = formUxxi.setAutocomplete("#ac-uxxi", {
		minLength: 4,
		source: () => formUxxi.click("#find-uxxi"),
		render: item => (item.num + " - " + item.uxxi + "<br>" + item.desc),
		select: item => item.id
	});
	formUxxi.setClick("a#add-uxxi", el => {
        const doc = acUxxi.getCurrentItem();
		doc && tableUxxi.add(doc); // Add and remove PK autocalculated in v_*_uxxiec
        acUxxi.reload(); // Reload autocomplete
	});
    window.loadUxxiec = (xhr, status, args) => (window.showTab(xhr, status, args, 15) && tableUxxi.render(JSON.read(args.data)));
    window.saveUxxiec = (xhr, status, args) => (alerts.loading() && formUxxi.stringify("#docs-json", tableUxxi));
    /*** FORMULARIO PARA LA CREACIÓN DEL EXPEDIENTE CON UXXI-EC ***/
});
