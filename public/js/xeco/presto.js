
import alerts from "../components/Alerts.js";
import Form from "../components/Form.js";
import Table from "../components/Table.js";
import tabs from "../components/Tabs.js";
import presto from "../model/Presto.js";
import uxxiec from "../model/Uxxiec.js";

document.addEventListener("DOMContentLoaded", () => {
    const partida = presto.getPartida();

    /*** Filtro + listado de solicitudes ***/
    const tabFilter = tabs.getTab(2);
	const fFilter = document.forms.find(form => (form.name == "xeco-filter"));
    const formFilter = new Form(fFilter);
    const msgEmptyPrestos = "No se han encontrado solicitudes para a la búsqueda seleccionada";
    let tSolicitudes = tabFilter.querySelector("table#solicitudes");
    let prestos = new Table(tSolicitudes, { msgEmptyTable: msgEmptyPrestos });
    tabs.setViewEvent(2, tab => formFilter.setFocus("#filtro-ej")).setActive(uxxiec.isUxxiec() ? 0 : 2);
    window.loadPrestos = (xhr, status, args) => {
        formFilter.setActions(); // Reload inputs actions
        tSolicitudes = tabFilter.querySelector("table#solicitudes");
        prestos = new Table(tSolicitudes, { msgEmptyTable: msgEmptyPrestos });
        window.showTab(xhr, status, args, 2);
    }
    window.updatePresto = (xhr, status, args) => window.showTab(xhr, status, args, 2) && prestos.hide(".firma-" + args.id).text(".estado-" + args.id, "Procesando...");
    /*** Filtro + listado de solicitudes ***/

    /*** FORMULARIO PARA EL DC 030 DE LAS GCR ***/
    const f030 = document.forms.find(form => (form.name == "xeco-030"));
    const form030 = new Form(f030);
    tabs.setViewEvent(3, tab => form030.setFocus("#acOrg030"));
    const acOrg030 = form030.setAutocomplete("#ac-org-030", {
        minLength: 4,
        source: () => form030.click("#find-org-030"),
        render: item => item.label,
        select: item => item.value,
        afterSelect: item => form030.setval("#idEco030", item.imp)
    });
    form030.setClick("#save-030", ev => {
        const row = lineas.getCurrentItem();
        const data = form030.isValid(partida.validate030);
        if (row && data) {
            const label = data.acOrg030.split(" - ");
            if (label) { // Update partida inc.
                row.idOrg030 = +data.idOrg030;
                [row.o030, row.dOrg030] = label;
                row.idEco030 = data.idEco030;
                row.imp030 = data.imp030;
                form030.setval("#partidas", JSON.stringify(lineas.getData())); // save data to send to server
                tabs.backTab().showOk("Datos del documento 030 asociados correctamente."); // Back to presto view
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
        onRender: partida.render,
        onFooter: partida.resume,
        afterRender: resume => {
            const readonly = resume.size > 0;
            formPresto.readonly(readonly, "#ejDec").readonly(readonly || presto.isDisableEjInc(), "#ejInc");
            lineas.toggle(".partida-min", !presto.isPartidaExt()).toggle(".partida-ext", presto.isPartidaExt());
        },
        "#doc030": () => { // load tab view 3
            const row = lineas.getCurrentItem();
            const readonly = !presto.isEditable() && !presto.isFirmable();
            acOrg030.setValue(row.idOrg030, row.o030 + " - " + row.dOrg030);
            form030.render(".info-080", partida.format(row, {})).readonly(readonly).toggle("#save-030", !readonly)
                    .setval("#idEco030", row.idEco030).setval("#imp030", row.imp030 ?? row.imp).text("#memo-030", presto.getData("memo"));
            tabs.showTab(3);
        }
    });

    //****** partida a decrementar ******//
    let economicasDec, acOrgDec, acOrgInc;
    const fnAvisoFa = item => { //aviso para organicas afectadas en TCR o FCE
        const info = "La orgánica seleccionada es afectada, por lo que su solicitud solo se aceptará para determinado tipo de operaciones.";
        presto.isAfectada(item?.int) && (presto.isTcr() || presto.isFce()) && formPresto.showInfo(info);
        alerts.working(); // Hide loading indicator
    }
    const fnAutoloadInc = (data, msg) => {
        const partida = JSON.read(data);
        if (partida) { //hay partida?
            partida.imp = 0; //tabla de fila/partida unica
            lineas.render([ partida ]); //render partidas
        }
        else if (acOrgDec.isItem())
            formPresto.showError(msg);
    }

    window.autoloadL83 = (xhr, status, args) => fnAutoloadInc(args?.data, "Aplicación AIP no encontrada en el sistema.");
    window.autoloadAnt = (xhr, status, args) => fnAutoloadInc(args?.data, "No se ha encontrado el anticipo en el sistema.");

    const fnLoadEcoDec = args => {
        economicasDec = JSON.read(args?.economicas);
        if (JSON.size(economicasDec) > 0) // Load options from items
            formPresto.setSelect("#idEcoDec", economicasDec).setval("#idEcoDecPF", economicasDec[0].value).setval("#cd", economicasDec[0].imp);
        else
            formPresto.setSelect("#idEcoDec", [], "Seleccione una económica").setval("#idEcoDecPF").setval("#cd");
    }
    window.loadEconomicasDec = (xhr, status, args) => {
        fnLoadEcoDec(args); // carga las econonomicas a decrementar
        if (presto.isL83()) //L83 => busco su AIP
            window.autoloadL83(xhr, status, args);
        else if (presto.isAnt()) //ANT => cargo misma organica
            window.autoloadAnt(xhr, status, args);
        fnAvisoFa(acOrgDec.getCurrentItem()); //aviso para organicas afectadas en TCR o FCE
    }
    //****** partida a decrementar ******//

    /****** partida a incrementar ******/
    window.loadEconomicasInc = (xhr, status, args) => {
        const data = JSON.read(args?.data); // get items
        if (JSON.size(data) > 0) // Load options from items
            formPresto.setSelect("#idEcoInc", data).setval("#idEcoIncPF", data[0].value);
        else
            formPresto.setSelect("#idEcoInc", [], "Seleccione una económica").setval("#idEcoIncPF");
        fnAvisoFa(acOrgInc.getCurrentItem()); //aviso para organicas afectadas en TCR o FCE
    }
    /****** partida a incrementar ******/

    //****** tabla de partidas a incrementar ******//
    window.fnAddPartidaInc = () => formPresto.isValid(partida.validate);
    window.loadPartidaInc = (xhr, status, args) => {
        const partida = JSON.read(args.data);
        const row = lineas.getData().find(row => ((row.o == partida.o) && (row.e == partida.e)));
        if (row) // compruebo si la partida existía previamente
            return formPresto.setError("#acOrgInc", "¡Partida ya asociada a la solicitud!");
        partida.imp = formPresto.valueOf("#impInc"); // Importe de la partida a añadir
        lineas.add(partida); // Add and remove PK autocalculated in extraeco.v_presto_partidas_inc
        acOrgInc.reload();
    }
    //****** tabla de partidas a incrementar ******//

    window.viewPresto = (xhr, status, args) => {
        fnLoadEcoDec(args); // carga las econonomicas a decrementar
        presto.setData(formPresto.setActions().getData()); // prepare inputs and load data before render
        lineas.render(JSON.read(args?.data)); // Load partidas a incrementar
        tabs.setActions(fPresto).showTab(1); // Muestra el tab
    }
    window.createPresto = (xhr, status, args) => {
        acOrgDec = formPresto.setAutocomplete("#ac-org-dec", {
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
        acOrgInc = formPresto.setAutocomplete("#ac-org-inc", {
            minLength: 4,
            source: () => formPresto.click("#find-organica-inc"),
            render: item => item.label,
            select: item => item.value,
            afterSelect: item => { alerts.loading(); formPresto.setval("#faInc", item.int & 1).click("#find-economicas-inc"); },
            onReset: () => formPresto.setval("#faInc").setval("#impInc").click("#find-economicas-inc")
        });
        formPresto.onChangeInput("#idEcoDec", ev => {
            const el = ev.target; // current input
            formPresto.setval("#idEcoDecPF", el.value).setval("#cd", economicasDec[el.selectedIndex].imp);
            if (presto.isL83()) //L83 => busco su AIP
                formPresto.click("#autoload-l83");
            else if (presto.isAnt()) //ANT => cargo misma organica
                formPresto.click("#autoload-ant");
        });
        formPresto.onChangeInput("#impDec", ev => {
            const partidas = lineas.getData();
            if (presto.isAutoLoadImp() && partidas.length) {
                partidas[0].imp = formPresto.getValue(ev.target); //importe obligatorio
                lineas.render(partidas);
            }
        });
        formPresto.setSelect("#idEcoInc", [], "Seleccione una económica")
                .onChangeInput("#idEcoInc", ev => formPresto.setval("#idEcoIncPF", ev.target.value))
                .onChangeInput("#urgente", ev => formPresto.toggle(".grp-urgente", ev.target.value == "2"))
                .onChangeInput("#ejDec", ev => { formPresto.setval("#ejInc", ev.target.value); acOrgDec.reset(); })
                .onChangeInput("#ejInc", acOrgInc.reset);
        window.viewPresto(xhr, status, args);
    }
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
});
