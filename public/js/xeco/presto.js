
import alerts from "../components/Alerts.js";
import Form from "../components/Form.js";
import Table from "../components/Table.js";
import Tabs from "../components/Tabs.js";
import presto from "../model/Presto.js";

document.addEventListener("DOMContentLoaded", () => {
	const tabs = new Tabs(); // Tab instance
    tabs.setViewEvent(1, tab => formPresto.autofocus());
    tabs.setViewEvent(2, tab => formFilter.setFocus("#filtro-ej"));
    tabs.setViewEvent(3, tab => formPresto.setFocus("#org-030"));
    tabs.setViewEvent(11, tab => formReject.setFocus("#rechazo"));

	const fReject = document.forms.find(form => (form.name == "xeco-reject"));
    const formReject = new Form(fReject);
    window.fnRechazar = () => formReject.isValid(presto.validateReject) && confirm("¿Confirma que desea rechazar esta solicitud?");

    const fFilter = document.forms.find(form => (form.name == "xeco-filter"));
    const formFilter = new Form(fFilter);

    const fUxxi = document.forms.find(form => (form.name == "xeco-uxxi"));
    const formUxxi = new Form(fUxxi);
    const acUxxi = formUxxi.setAutocomplete("#ac-uxxi", {
		minLength: 4,
		source: () => { formUxxi.click("#find-uxxi"); },
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
	const documentos = new Table(tDocumentos, {
        msgEmptyTable: "No se han encontrado documentos de UXXI-EC asociadas a la solicitud",
        onRender: presto.renderUxxiec
    });
    tabs.setViewEvent(15, tab => {
        formUxxi.setFocus("#uxxi");
        documentos.render(JSON.read(tDocumentos.previousElementSibling.innerHTML));
    });

    const fPresto = document.forms.find(form => (form.name == "xeco-presto"));
    const formPresto = new Form(fPresto);
    presto.setData(formPresto.getData());

    const tSolicitudes = tabs.getTab(2).querySelector("table#solicitudes");
	const prestos = new Table(tSolicitudes, { msgEmptyTable: "No se han encontrado solicitudes para a la búsqueda seleccionada" });
    const tPartidas = fPresto.querySelector("#partidas-tb");
	const lineas = new Table(tPartidas, {
        msgEmptyTable: "No existen partidas asociadas a la solicitud",
        beforeRender: resume => { resume.imp = 0; },
        onRender: presto.renderPartida,
        afterRender: resume => {
            const readonly = resume.size > 0;
            formPresto.readonly("#ej-dec", readonly).readonly("#ej-inc", readonly || presto.isDisableEjInc());
            return presto.renderResume(resume, {});
        },
        "#doc030": () => { // load tab view 3
            const row = lineas.getCurrentItem();
            formPresto.render(".info-080", presto.formatPartida(row, {}))
                    .setval("#org-030", row.o030 + " - " + row.dOrg030).setval("#id-eco-030", row.idEco030).setval("#imp-030", row.imp030 ?? row.imp);
            tabs.showTab(3);
        }
    });
    lineas.render(JSON.read(tPartidas.previousElementSibling.innerHTML));

    //****** partida a decrementar ******//
    let economicasDec;
    const fnLoadDC = index => {
        const dec = economicasDec[index];
        formPresto.setval("#imp-cd", dec?.imp);
        alerts.working(); // Hide loading indicator
    }
    const fnAvisoFa = mask => { //aviso para organicas afectadas en TCR o FCE
        alerts.loading(); // Show loading indicator
        const info = "La orgánica seleccionada es afectada, por lo que su solicitud solo se aceptará para determinado tipo de operaciones.";
        (mask & 1) && (presto.isTcr() || presto.isFce()) && formPresto.showInfo(info);
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
    window.loadEconomicasDec = (xhr, status, args) => {
        alerts.closeAlerts(); // close previos alerts
        economicasDec = JSON.read(args?.economicas) || [];
        if (presto.isL83()) //L83 => busco su AIP
            autoloadL83(xhr, status, args);
        else if (presto.isAnt()) //ANT => cargo misma organica
            autoloadAnt(xhr, status, args);
        fnLoadDC(0); // Cargo el importe del crédito disponible por defecto
    }

    const acOrgDec = formPresto.setAutocomplete("#ac-org-dec", {
		minLength: 4,
		source: () => { formPresto.click("#find-organica-dec"); },
		render: item => item.label,
		select: item => item.value,
		afterSelect: item => {
            fnAvisoFa(item.int); //aviso para organicas afectadas en TCR o FCE
            presto.isAutoLoadInc() && lineas.render(); //autoload => clear table
            formPresto.setval("#fa-dec", presto.isAfectada(item.int)).click("#find-economicas-dec");
        },
        onReset: () => {
            presto.isAutoLoadInc() && lineas.render(); //autoload => clear table
            formPresto.setval("#fa-dec").click("#find-economicas-dec");
        }
	});
    formPresto.onChangeInput("#imp-dec", ev => {
        const partidas = lineas.getData();
        if (presto.isAutoLoadImp() && partidas.length) {
            partidas[0].imp = formPresto.getValue(ev.target); //importe obligatorio
            lineas.render(partidas);
        }
    });
    formPresto.setClick("#save-030", ev => {
        const row = lineas.getCurrentItem();
        const o030 = acOrg030.getCurrentItem();
        const label = o030?.label.split(" - ");
        if (label) {
            row.idOrg030 = +o030.value;
            [row.o030, row.dOrg030] = label;
            row.idEco030 = formPresto.valueOf("#id-eco-030");
            row.imp030 = formPresto.valueOf("#imp-030");
            formPresto.setval("#partidas", JSON.stringify(lineas.getData())); // save data to send to server
        }
        tabs.showTab(1); // Back to presto view
    });
    //****** partida a decrementar ******//

    /****** partida a incrementar ******/
    const acOrgInc = formPresto.setAutocomplete("#ac-org-inc", {
		minLength: 4,
		source: () => { formPresto.click("#find-organica-inc"); },
		render: item => item.label,
		select: item => item.value,
		afterSelect: item => {
            fnAvisoFa(item.int); //aviso para organicas afectadas en TCR o FCE
            formPresto.setval("#fa-inc", presto.isAfectada(item.int)).click("#find-economicas-inc");
        },
        onReset: () => formPresto.setval("#fa-inc").setval("#imp-inc").click("#find-economicas-inc")
	});
    const acOrg030 = formPresto.setAutocomplete("#ac-org-030", {
		minLength: 4,
		source: () => { formPresto.click("#find-org-030"); },
		render: item => item.label,
		select: item => item.value,
		afterSelect: item => formPresto.setval("#id-eco-030", item.imp)
	});
    /****** partida a incrementar ******/

    formPresto.onChangeInput("#urgente", ev => formPresto.toggle(".grp-urgente", ev.target.value == "2"));
    formPresto.onChangeInput("#ej-dec", ev => { formPresto.setval("#ej-inc", ev.target.value); acOrgDec.reset(); });
    acOrgInc && formPresto.onChangeInput("#ej-inc", acOrgInc.reset);

    //****** tabla de partidas a incrementar ******//
    window.fnAddPartidaInc = () => formPresto.isValid(presto.validatePartida);
    window.loadPartidaInc = (xhr, status, args) => {
        const partida = JSON.read(args.data);
        const row = lineas.getData().find(row => ((row.o == partida.o) && (row.e == partida.e)));
        if (row)
            return formPresto.setError("#org-inc", "¡Partida ya asociada a la solicitud!");
        partida.imp = formPresto.valueOf("#imp-inc");
        delete partida.id; // remove PK autocalculada en extraeco.v_presto_partidas_inc
        lineas.push(partida);
        acOrgInc.reload();
    }
    //****** tabla de partidas a incrementar ******//

    window.fnSend = () => {
        const resume = lineas.getResume();
        const partidas = lineas.getData();
        if (!partidas.length) // Todas las solicitudes tienen partidas a incrementar
            return !formPresto.setError("#org-dec", "Debe seleccionar al menos una partida a aumentar!");
        if (presto.isPartidaDec() && (resume.imp != formPresto.valueOf("#imp-dec"))) // Valido los importes a decrementar e incrementar
            return !formPresto.setError("#imp-dec", "¡Los importes a decrementar e incrementar no coinciden!");
        if (formPresto.isValid(presto.validate)) { //todas las validaciones estan ok?
            partidas.sort((a, b) => (b.imp - a.imp)); //orden por importe desc.
            partidas[0].mask = partidas[0].mask | 1; //marco la primera como principal
            formPresto.setval("#partidas", JSON.stringify(partidas)); // save data to send to server
            return confirm("¿Confirma que desea firmar y enviar esta solicitud?");
        }
        return false;
    }
});

//gestion de informes y mensajes
window.fnFirmar = () => confirm("¿Confirma que desea firmar esta solicitud?") && window.loading();
window.fnIntegrar = () => confirm("¿Confirma que desea integrar esta solicitud en UXXI-EC?") && window.loading();
window.fnRemove = () => confirm("¿Confirmas que desea eliminar esta solicitud?") && window.loading();
window.handleReport = (xhr, status, args) => window.showAlerts(xhr, status, args).redir(args?.url);
