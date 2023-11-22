
import alerts from "../components/Alerts.js";
import Form from "../components/Form.js";
import Table from "../components/Table.js";
import tabs from "../components/Tabs.js";
import uxxiec from "../model/Uxxiec.js";

document.addEventListener("DOMContentLoaded", () => {
    /*** Filtro + listado de solicitudes ***/
    window.fnIntegrar = link => confirm("¿Confirma que desea integrar esta solicitud en UXXI-EC?") && window.loading() && !link.classList.add("hide");
    window.fnFirmar = () => confirm("¿Confirma que desea firmar esta solicitud?") && window.loading();
    window.fnRemove = () => confirm("¿Confirmas que desea eliminar esta solicitud?") && window.loading();
    window.handleReport = (xhr, status, args) => window.showAlerts(xhr, status, args).redir(args?.url);
    /*** Filtro + listado de solicitudes ***/

    /*** FORMULARIO PARA EL RECHAZO/CANCELACIÓN DE SOLICITUDES ***/
	const fReject = document.forms.find(form => (form.name == "xeco-reject"));
    const formReject = new Form(fReject);
    window.fnRechazar = () => formReject.isValid(uxxiec.validateReject) && confirm("¿Confirma que desea rechazar esta solicitud?");
    /*** FORMULARIO PARA EL RECHAZO/CANCELACIÓN DE SOLICITUDES ***/

    /*** FORMULARIO PARA LA CREACIÓN DEL EXPEDIENTE CON UXXI-EC ***/
    const tabUxxi = tabs.getTab(15);
    uxxiec.setNif(tabUxxi.dataset.nif).setUxxiec(tabUxxi.dataset.usuec).setUae(tabUxxi.dataset.uae);
    const fUxxi = document.forms.find(form => (form.name == "xeco-uxxi"));
    const formUxxi = new Form(fUxxi);
    const acUxxi = formUxxi.setAutocomplete("#ac-uxxi", {
		minLength: 4,
		source: () => formUxxi.click("#find-uxxi"),
		render: item => (item.num + " - " + item.uxxi + "<br>" + item.desc),
		select: item => item.id
	});
	formUxxi.setClick("a#add-uxxi", el => {
        const doc = acUxxi.getCurrentItem();
		doc && documentos.add(doc); // Add and remove PK autocalculated in v_*_uxxiec
        acUxxi.reload(); // Reload autocomplete
	});
    const tDocumentos = fUxxi.querySelector("table#documentos");
    const msgEmptyTable = "No se han encontrado documentos de UXXI-EC asociadas a la solicitud";
	const documentos = new Table(tDocumentos, { msgEmptyTable, onRender: uxxiec.render });
    window.loadUxxiec = (xhr, status, args) => (window.showTab(xhr, status, args, 15) && documentos.render(JSON.read(args.data)));
    window.saveUxxiec = (xhr, status, args) => (alerts.loading() && formUxxi.setval("#operaciones", JSON.stringify(documentos.getData())));
    /*** FORMULARIO PARA LA CREACIÓN DEL EXPEDIENTE CON UXXI-EC ***/
});
