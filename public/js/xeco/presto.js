
import alerts from "../components/Alerts.js";
import Form from "../components/Form.js";
import Table from "../components/Table.js";
import tabs from "../components/Tabs.js";
import presto from "../model/Presto.js";

document.addEventListener("DOMContentLoaded", () => {
    /*** Filtro + listado de solicitudes ***/
    const tabFilter = tabs.getTab(2);
	const fFilter = document.forms.find(form => (form.name == "xeco-filter"));
    const formFilter = new Form(fFilter);
    const msgEmptyPrestos = "No se han encontrado solicitudes para a la búsqueda seleccionada";
    let tSolicitudes = tabFilter.querySelector("table#solicitudes");
    let prestos = new Table(tSolicitudes, { msgEmptyTable: msgEmptyPrestos });
    tabs.setViewEvent(2, tab => formFilter.setFocus("#filtro-ej")).showTab((tabFilter.dataset.usuec == "true") ? 0 : 2);
    window.updatePrestos = (xhr, status, args) => {
        formFilter.setActions(); // Reload inputs actions
        tSolicitudes = tabFilter.querySelector("table#solicitudes");
        prestos = new Table(tSolicitudes, { msgEmptyTable: msgEmptyPrestos });
        // Si todo ok => muestro el tab del listado acualizando el valor del estado y ocultando las acciones de firma
        window.showTab(xhr, status, args, 2) && prestos.hide(".firma-" + args.id).text(".estado-" + args.id, "Procesando...");
    }
    /*** Filtro + listado de solicitudes ***/

    /*** FORMULARIO PARA EL DC 030 DE LAS GCR ***/
    const f030 = document.forms.find(form => (form.name == "xeco-030"));
    const form030 = new Form(f030);
    tabs.setViewEvent(3, tab => form030.setFocus("#acOrg030"));
    form030.setAutocomplete("#ac-org-030", {
        minLength: 4,
        source: () => form030.click("#find-org-030"),
        render: item => item.label,
        select: item => item.value,
        afterSelect: item => form030.setval("#idEco030", item.imp)
    });
    form030.setClick("#save-030", ev => {
        const row = lineas.getCurrentItem();
        const data = form030.isValid(presto.validate030);
        if (row && data) {
            const label = data.acOrg030.split(" - ");
            if (label) { // Update partida inc.
                row.idOrg030 = +data.idOrg030;
                [row.o030, row.dOrg030] = label;
                row.idEco030 = data.idEco030;
                row.imp030 = data.imp030;
                form030.setval("#partidas", JSON.stringify(lineas.getData())); // save data to send to server
                tabs.showTab(1); // Back to presto view
            }
        }
    });
    /*** FORMULARIO PARA EL DC 030 DE LAS GCR ***/

    /*** FORMULARIO PRINCIPAL ***/
    const fPresto = document.forms.find(form => (form.name == "xeco-presto"));
    const formPresto = new Form(fPresto);
    tabs.setViewEvent(1, tab => formPresto.autofocus());
    const tPartidas = fPresto.querySelector("#partidas-tb");
    const lineas = new Table(tPartidas, {
        msgEmptyTable: "No existen partidas asociadas a la solicitud",
        beforeRender: resume => { resume.imp = 0; },
        onRender: presto.renderPartida,
        onFooter: presto.renderResume,
        afterRender: resume => {
            const readonly = resume.size > 0;
            formPresto.readonly(readonly, "#ejDec").readonly(readonly || presto.isDisableEjInc(), "#ejInc");
            lineas.toggle(".partida-min", !presto.isPartidaExt()).toggle(".partida-ext", presto.isPartidaExt()).toggle(".insert-only", presto.isEditable());
        },
        "#doc030": () => { // load tab view 3
            const row = lineas.getCurrentItem();
            const readonly = !presto.isEditable() && !presto.isFirmable();
            form030.render(".info-080", presto.formatPartida(row, {})).readonly(readonly).toggle(readonly, "#save-030")
                    .setval("#acOrg030", row.o030 + " - " + row.dOrg030).setval("#idEco030", row.idEco030).setval("#imp030", row.imp030 ?? row.imp)
                    .text("#memo-030", presto.getData("memo"));
            tabs.showTab(3);
        }
    });

    function initFormPresto(xhr, status, args) {
        presto.setData(formPresto.setActions().getData()); // prepare inputs and load data before render
        lineas.render(JSON.read(args?.data)); // Load partidas a incrementar
        tabs.setActions(fPresto).showTab(1); // Muestra el tab

        //****** partida a decrementar ******//
        let economicasDec;
        const fnLoadDC = index => {
            const dec = economicasDec[index];
            formPresto.setval("#cd", dec?.imp);
        }
        const fnAvisoFa = item => { //aviso para organicas afectadas en TCR o FCE
            const info = "La orgánica seleccionada es afectada, por lo que su solicitud solo se aceptará para determinado tipo de operaciones.";
            (item?.int & 1) && (presto.isTcr() || presto.isFce()) && formPresto.showInfo(info);
            alerts.working(); // Hide loading indicator
        }
        const fnAutoloadInc = (data, msg) => {
            const partida = JSON.read(data);
            if (partida) { //hay partida?
                partida.imp = 0; //tabla de fila/partida unica
                lineas.render([ partida ]); //render partidas
            }
            else
                formPresto.showError(msg);
        }

        window.autoloadL83 = (xhr, status, args) => fnAutoloadInc(args?.data, "Aplicación AIP no encontrada en el sistema.");
        window.autoloadAnt = (xhr, status, args) => fnAutoloadInc(args?.data, "No se ha encontrado el anticipo en el sistema.");
        window.loadCD = el => {
            if (presto.isL83()) //L83 => busco su AIP
                formPresto.click("#autoload-l83");
            else if (presto.isAnt()) //ANT => cargo misma organica
                formPresto.click("#autoload-ant");
            fnLoadDC(el.selectedIndex);
        }

        const acOrgDec = formPresto.setAutocomplete("#ac-org-dec", {
            minLength: 4,
            source: () => formPresto.click("#find-organica-dec"),
            render: item => item.label,
            select: item => item.value,
            afterSelect: item => {
                alerts.loading();
                presto.isAutoLoadInc() && lineas.render(); //autoload => clear table
                formPresto.setval("#faDec", item.int & 1).click("#find-economicas-dec");
            },
            onReset: () => {
                presto.isAutoLoadInc() && lineas.render(); //autoload => clear table
                formPresto.setval("#faDec").click("#find-economicas-dec");
            }
        });
        window.loadEconomicasDec = (xhr, status, args) => {
            economicasDec = JSON.read(args?.economicas) || [];
            if (presto.isL83()) //L83 => busco su AIP
                autoloadL83(xhr, status, args);
            else if (presto.isAnt()) //ANT => cargo misma organica
                autoloadAnt(xhr, status, args);
            fnLoadDC(0); // Cargo el importe del crédito disponible por defecto
            fnAvisoFa(acOrgDec.getCurrentItem()); //aviso para organicas afectadas en TCR o FCE
        }
        formPresto.onChangeInput("#impDec", ev => {
            const partidas = lineas.getData();
            if (presto.isAutoLoadImp() && partidas.length) {
                partidas[0].imp = formPresto.getValue(ev.target); //importe obligatorio
                lineas.render(partidas);
            }
        });
        //****** partida a decrementar ******//

        /****** partida a incrementar ******/
        const acOrgInc = formPresto.setAutocomplete("#ac-org-inc", {
            minLength: 4,
            source: () => formPresto.click("#find-organica-inc"),
            render: item => item.label,
            select: item => item.value,
            afterSelect: item => { alerts.loading(); formPresto.setval("#faInc", item.int & 1).click("#find-economicas-inc"); },
            onReset: () => formPresto.setval("#faInc").setval("#impInc").click("#find-economicas-inc")
        });
        window.loadEconomicasInc = (xhr, status, args) => {
            fnAvisoFa(acOrgInc.getCurrentItem()); //aviso para organicas afectadas en TCR o FCE
        }
        /****** partida a incrementar ******/

        formPresto.onChangeSelect("#urgente", el => formPresto.toggle(".grp-urgente", el.value == "2"))
                .onChangeInput("#ejDec", ev => { formPresto.setval("#ejInc", ev.target.value); acOrgDec.reset(); })
                .onChangeInput("#ejInc", acOrgInc.reset);

        //****** tabla de partidas a incrementar ******//
        window.fnAddPartidaInc = () => formPresto.isValid(presto.validatePartida);
        window.loadPartidaInc = (xhr, status, args) => {
            const partida = JSON.read(args.data);
            const row = lineas.getData().find(row => ((row.o == partida.o) && (row.e == partida.e)));
            if (row) // compruebo si la partida existía previamente
                return formPresto.setError("#acOrgInc", "¡Partida ya asociada a la solicitud!");
            partida.imp = formPresto.valueOf("#impInc"); // Importe de la partida a añadir
            delete partida.id; // remove PK autocalculada en extraeco.v_presto_partidas_inc
            lineas.push(partida);
            acOrgInc.reload();
        }
        //****** tabla de partidas a incrementar ******//
    }
    window.initFormPresto = initFormPresto;
    window.fnSend = () => {
        const resume = lineas.getResume();
        const partidas = lineas.getData();
        if (!partidas.length) // Todas las solicitudes tienen partidas a incrementar
            return !formPresto.setError("#acOrgDec", "Debe seleccionar al menos una partida a aumentar!");
        if (presto.isPartidaDec() && (resume.imp != formPresto.valueOf("#impDec"))) // Valido los importes a decrementar e incrementar
            return !formPresto.setError("#impDec", "¡Los importes a decrementar e incrementar no coinciden!");
        if (formPresto.isValid(presto.validate)) { //todas las validaciones estan ok?
            partidas.sort((a, b) => (b.imp - a.imp)); //orden por importe desc.
            partidas[0].mask = partidas[0].mask | 1; //marco la primera como principal
            formPresto.setval("#partidas", JSON.stringify(partidas)); // save data to send to server
            return confirm("¿Confirma que desea firmar y enviar esta solicitud?");
        }
        return false;
    }
    /*** FORMULARIO PRINCIPAL ***/

	const fReject = document.forms.find(form => (form.name == "xeco-reject"));
    const formReject = new Form(fReject);
    tabs.setViewEvent(11, tab => formReject.setFocus("#rechazo"));
    window.fnRechazar = () => formReject.isValid(presto.validateReject) && confirm("¿Confirma que desea rechazar esta solicitud?");

    /*** FORMULARIO PARA LA CREACIÓN DEL EXPEDIENTE CON UXXI-EC ***/
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
		if (doc) { // is doc selected?
			delete doc.id; // Force insert
			documentos.push(doc); // Save container
		}
        acUxxi.reload(); // Reload autocomplete
	});
    const tDocumentos = fUxxi.querySelector("table#documentos");
    const msgEmptyTable = "No se han encontrado documentos de UXXI-EC asociadas a la solicitud";
	const documentos = new Table(tDocumentos, { msgEmptyTable, onRender: presto.renderUxxiec });
    window.loadUxxiec = (xhr, status, args) => (window.showTab(xhr, status, args, 15) && documentos.render(args.response));
    window.saveUxxiec = (xhr, status, args) => (alerts.loading() && formUxxi.setval("#operaciones", JSON.stringify(documentos.getData())));
    tabs.setViewEvent(15, tab => formUxxi.setFocus("#uxxi"));
    /*** FORMULARIO PARA LA CREACIÓN DEL EXPEDIENTE CON UXXI-EC ***/
});

//gestion de informes y mensajes
window.fnFirmar = () => confirm("¿Confirma que desea firmar esta solicitud?") && window.loading();
window.fnIntegrar = () => confirm("¿Confirma que desea integrar esta solicitud en UXXI-EC?") && window.loading();
window.fnRemove = () => confirm("¿Confirmas que desea eliminar esta solicitud?") && window.loading();
window.handleReport = (xhr, status, args) => window.showAlerts(xhr, status, args).redir(args?.url);
