
import Form from "../components/Form.js";
import Table from "../components/Table.js";
import Tabs from "../components/Tabs.js";
import presto from "../model/Presto.js";

document.addEventListener("DOMContentLoaded", () => {
	const tabs = new Tabs(); // Tab instance
    const fPresto = document.forms.find(form => (form.name == "xeco-presto"));
    const formPresto = new Form(fPresto);
    presto.init(+fPresto.id.value, +formPresto.valueOf("#tipo"));

    const tPartidas = fPresto.querySelector("#partidas-tb");
	const lineas = new Table(tPartidas, {
        msgEmptyTable: "No existen partidas asociadas a la solicitud",
        beforeRender: resume => { resume.imp = 0;},
        onRender: presto.renderPartida,
        afterRender: resume => {
            if (resume.size > 0) // hay lineas?
                formPresto.disabled("#ej-dec").disabled("#ej-inc", presto.isDisableEjInc());
            tabs.setActions(lineas.getBody());
            return presto.renderResume(resume, {});
        }
    });
    lineas.render(JSON.read(tPartidas.previousElementSibling.innerHTML));

    //****** partida a decrementar ******//
    let economicasDec, dec;
    const fnLoadDC = index => {
        dec = economicasDec[index];
        formPresto.setval("#imp-cd", dec?.imp);
    }
    const fnAvisoFa = mask => { //aviso para organicas afectadas en TCR o FCE
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

    window.autoloadL83 = (xhr, status, args) => fnAutoloadInc(args.data, "Aplicación AIP no encontrada en el sistema.");
    window.autoloadAnt = (xhr, status, args) => fnAutoloadInc(args.data, "No se ha encontrado el anticipo en el sistema.");
    window.loadCD = el => {
        if (presto.isL83()) //L83 => busco su AIP
            formPresto.click("#autoload-l83");
        else if (presto.isAnt()) //ANT => cargo misma organica
            formPresto.click("#autoload-ant");
        fnLoadDC(el.selectedIndex);
    }
    window.loadEconomicasDec = (xhr, status, args) => {
        economicasDec = JSON.read(args.economicas) || [];
        if (args.data) {
            if (presto.isL83()) //L83 => busco su AIP
                autoloadL83(xhr, status, args);
            else if (presto.isAnt()) //ANT => cargo misma organica
                autoloadAnt(xhr, status, args);
        }
        fnLoadDC(0); // Cargo el importe del crédito disponible por defecto
    }

    const acOrgDec = formPresto.setAutocomplete("#ac-org-dec", {
		minLength: 4,
		source: () => { formPresto.click("#find-organica-dec"); },
		render: item => item.label,
		select: item => item.value,
		afterSelect: item => {
            fnAvisoFa(item.int); //aviso para organicas afectadas en TCR o FCE
            formPresto.setval("#fa-dec", presto.isoBool(item.int)).click("#find-economicas-dec");
        },
        onReset: () => {
            if (presto.isAutoLoadInc() && !presto.isAfc()) //autoload y no AFC
                lineas.render(); // clear table
            formPresto.setval("#fa-dec").click("#find-economicas-dec");
        }
	});
    formPresto.onChangeInput("#imp-dec", ev => {
        const partidas = lineas.getData();
        if (presto.isAutoLoadInc() && partidas.length) {
            partidas[0].imp = formPresto.getValue(ev.target); //importe obligatorio
            lineas.render(partidas);
        }
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
            formPresto.setval("#fa-inc", presto.isoBool(item.int)).click("#find-economicas-inc");
        },
        onReset: () => formPresto.setval("#fa-inc").setval("#imp-inc").click("#find-economicas-inc")
	});
    /****** partida a incrementar ******/

    formPresto.onChangeInput("#urgente", ev => formPresto.toggle(".grp-urgente", ev.target.value == "2"));
    formPresto.onChangeInput("#ej-dec", ev => { formPresto.setval("#ej-inc", ev.target.value); acOrgDec.reset(); });
    acOrgInc && formPresto.onChangeInput("#ej-inc", acOrgInc.reset);

    //****** tabla de partidas a incrementar ******//
    window.fnAddPartidaInc = () => formPresto.isValid(presto.validatePartida);
    window.loadPartidaInc = (xhr, status, args) => {
        const partida = JSON.read(args.data);
        partida.imp = formPresto.setFocus("#org-inc").valueOf("#imp-inc");
        lineas.push(partida);
        acOrgInc.reset();
    }
    //****** tabla de partidas a incrementar ******//

    window.fnSend = () => {
        const partidas = lineas.getData();
        if (!partidas.length) // Todas las solicitudes tienen partidas a incrementar
            return !formPresto.setError("#org-inc", "Debe seleccionar al menos una partida a aumentar!");
        if (dec && !presto.isAnt() && (RESUME.imp > dec.imp)) // los anticipos no validan el CD
            return !formPresto.setError("#imp-dec", "¡Importe máximo de la partida a disminuir excedido!");
        if (formPresto.isValid(presto.validatePresto)) { //todas las validaciones estan ok?
            partidas.sort((a, b) => (b.imp - a.imp)); //orden por importe desc.
            partidas[0].mask = partidas[0].mask | 1; //marco la primera como principal
            formPresto.setval("#partidas", JSON.stringify(partidas)); // save data to send to server
            return confirm("¿Confirma que desea firmar y enviar esta solicitud?");
        }
        return false;
    }
});
