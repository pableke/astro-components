
import alerts from "../components/Alerts.js";
import Form from "../components/Form.js";
import tabs from "../components/Tabs.js";
import presto from "../model/Presto.js";
import uxxiec from "../model/Uxxiec.js";

document.addEventListener("DOMContentLoaded", () => {
    const partida = presto.getPartida();
    const partidas = presto.getPartidas();
    tabs.setActive(uxxiec.isUxxiec() ? 0 : 2);

    /*** FORMULARIO PARA EL DC 030 DE LAS GCR ***/
    const form030 = new Form("xeco-030");
    const acOrg030 = form030.setAutocomplete("#ac-org-030", {
        minLength: 4,
        source: () => form030.click("#find-org-030"),
        render: item => item.label,
        select: item => item.value,
        afterSelect: item => form030.setval("#idEco030", item.imp)
    });
    form030.setClick("#save-030", ev => {
        partida.setData(lineas.getCurrentItem());
        if (form030.isValid(partida.validate030)) {
            formPresto.stringify("#partidas-json", lineas); // save data to send to server
            tabs.backTab().showOk("Datos del documento 030 asociados correctamente."); // Back to presto view
        }
    });
    /*** FORMULARIO PARA EL DC 030 DE LAS GCR ***/

    /*** FORMULARIO PRINCIPAL ***/
    const formPresto = new Form("xeco-presto");
    const lineas = formPresto.setTable("#partidas-inc", {
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
                    .setval("#idEco030", row.idEco030).setval("#imp030", row.imp030).text("#memo-030", presto.getData("memo"));
            tabs.showTab(3);
        }
    });

    //****** partida a decrementar ******//
    let economicasDec, acOrgDec, acOrgInc;
    const fnAvisoFa = item => { //aviso para organicas afectadas en TCR o FCE
        const info = "La orgánica seleccionada es afectada, por lo que su solicitud solo se aceptará para determinado tipo de operaciones.";
        partida.isAfectada(item?.int) && (presto.isTcr() || presto.isFce()) && formPresto.showInfo(info);
        alerts.working(); // Hide loading indicator
    }
    const fnAutoloadInc = (partida, imp) => {
        partida.imp = imp || 0; //propone un importe
        lineas.render([ partida ]); //render partida unica
        formPresto.setval("#impDec", partida.imp);
    }

    window.autoloadL83 = (xhr, status, args) => {
        const partida = JSON.read(args?.data);
        if (partida)
            fnAutoloadInc(partida, economicasDec[0].imp);
        else if (acOrgDec.isItem())
            formPresto.showError("Aplicación AIP no encontrada en el sistema.");
    }
    window.autoloadAnt = (xhr, status, args) => {
        const partida = JSON.read(args?.data);
        if (partida) //hay partida?
            fnAutoloadInc(partida, Math.max(0, partida.ih));
        else if (acOrgDec.isItem())
            formPresto.showError("No se ha encontrado el anticipo en el sistema.");
    }

    const fnLoadEcoDec = args => {
        economicasDec = JSON.read(args?.economicas);
        if (JSON.size(economicasDec) > 0) // Load options from items
            formPresto.setSelect("#idEcoDec", economicasDec).setval("#idEcoDecPF", economicasDec[0].value).setval("#cd", economicasDec[0].imp);
        else
            formPresto.setSelect("#idEcoDec", [], "Seleccione una económica").setval("#idEcoDecPF").setval("#impDec").setval("#cd");
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
        if (!partidas.setData(lineas).validatePartida(partida)) // compruebo si la partida existía previamente
            return formPresto.setError("#acOrgInc", "¡Partida ya asociada a la solicitud!", "notAllowed");
        partida.imp030 = partida.imp = formPresto.valueOf("#impInc"); // Importe de la partida a añadir
        lineas.add(partida); // Add and remove PK autocalculated in extraeco.v_presto_partidas_inc
        acOrgInc.reload();
    }
    //****** tabla de partidas a incrementar ******//

    window.viewPresto = (xhr, status, args) => {
        fnLoadEcoDec(args); // carga las econonomicas a decrementar
        presto.setData(formPresto.setval("#partidas-json").setActions().getData()); // prepare inputs and load data before render
        formPresto.setMode().toggle(".firmable-only", presto.isFirmable()).toggle(".rechazable-only", presto.isRechazable());
        lineas.render(JSON.read(args?.data)); // Load partidas a incrementar
        tabs.showTab(1); // Muestra el tab
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
        partidas.setData(lineas); // Cargo las partidas para su validación
        if (formPresto.isValid(presto.validate)) { //todas las validaciones estan ok?
            partidas.setPrincipal(); //marco la primera como principal
            formPresto.stringify("#partidas-json", lineas); // save data to send to server
            return confirm("¿Confirma que desea firmar y enviar esta solicitud?");
        }
        return false;
    }
    /*** FORMULARIO PRINCIPAL ***/
});
