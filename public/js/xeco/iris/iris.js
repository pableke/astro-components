
import Form from "../../components/Form.js";
import Table from "../../components/Table.js";
import tabs from "../../components/Tabs.js";
import iris from "../../model/iris/Iris.js";

document.addEventListener("DOMContentLoaded", () => {
    const uxxiec = iris.getUxxiec();
    const perfil = iris.getPerfil();
    let acOrganica;

	/*** Filtro + listado de solicitudes ***/
    const tabFilter = tabs.getTab(2);
	const fFilter = document.forms.find(form => (form.name == "xeco-filter"));
    const formFilter = new Form(fFilter);
    const msgEmptyIris = "No se han encontrado solicitudes para a la búsqueda seleccionada";
    let tSolicitudes = tabFilter.querySelector("table#solicitudes");
    let tIris = new Table(tSolicitudes, { msgEmptyTable: msgEmptyIris });
    window.loadIris = (xhr, status, args) => {
        formFilter.setActions(); // Reload inputs actions
        tSolicitudes = tabFilter.querySelector("table#solicitudes");
        tIris = new Table(tSolicitudes, { msgEmptyTable: msgEmptyIris });
        window.showTab(xhr, status, args, 2);
    }
    window.updateIris = (xhr, status, args) => window.showTab(xhr, status, args, 2) && iris.hide(".firma-" + args.id).text(".estado-" + args.id, "Procesando...");
    /*** Filtro + listado de solicitudes ***/

	/*** FORMULARIO PRINCIPAL ***/
    const fIris = document.forms.find(form => (form.name == "xeco-iris"));
    const formIris = new Form(fIris);
    tabs.setValidEvent(3, tab => formIris.isValid(iris.validate));
    window.fnSavePerfil = () => {
		if (organicas.isEmpty())
			return !formIris.setError("#acOrganica", "Debe asociar al menos una orgánica a la comunicación.");
        formIris.setval("#presupuesto", JSON.stringify(organicas.getData()));
		return formIris.isValid(perfil.validate) && confirm("¿Confirma que desea firmar y enviar esta comunicación?");
	}

	//****** tabla de organicas ******//
	const organica = perfil.getOrganica();
	const tOrganicas = fIris.querySelector("#organicas");
    const organicas = new Table(tOrganicas, {
        msgEmptyTable: "No existen orgánicas asociadas a la comunicación.",
        //beforeRender: resume => { },
        onRender: organica.render,
        //onFooter: organica.resume,
        afterRender: resume => {
            perfil.refinanciar(organicas.getData());
            formIris.hide(".fin-info").show(".fin-" + perfil.getFinanciacion());
            fnPerfil();
        }
    });
    formIris.setClick("[href='#add-organica']", ev => {
        const org = acOrganica.getCurrentItem();
        org && organicas.add(org);
        acOrganica.reload();
    });
	//****** tabla de los conceptos a facturar ******//

    const fnPerfil = () => {
        const data = perfil.getData();
        if (formIris.getval("#nifInteresado"))
            formIris.text(".titulo", data.titulo).text("#colectivo", perfil.getColectivo()).show(".info-colectivo");
        else
            formIris.text(".titulo", "Nueva comunicación").text("#colectivo", "").hide(".info-colectivo");
        formIris.setval("#perfil", perfil.getPerfil())
                .toggleOptions("#actividad", data.actividad).toggleOptions("#tramite", data.tramite)
                .text("#responsables", organicas.getData().map(org => org.r).join(","));
        tabs.setMask(data.pasos);
    }

    window.viewIris = (xhr, status, args) => {
        const data = formIris.setActions().getData();
        iris.setData(data); // prepare inputs and load data before render
        organicas.render(JSON.read(args.data)); // Muestro las líneas asociadas a la solicitud
        window.loadRutas(formIris, JSON.read(args.rutas)); // Muestro las rutas asociadas a la solicitud
        formIris.setval("#actividad", perfil.getActividad()).setval("#tramite", perfil.getTramite())
                .toggle("#ac-organica", !data.id || !uxxiec.isUxxiec()).setMode(data.id)
                .toggle(".firmable-only", iris.isFirmable()).toggle(".rechazable-only", iris.isRechazable()).toggle(".editable-only", iris.isEditable());
        tabs.showTab(args.tab || 1); // Muestra el tab
	};
    window.createIris = (xhr, status, args) => {
        formIris.setAutocomplete("#ac-interesado", {
			delay: 500, //milliseconds between keystroke occurs and when a search is performed
			minLength: 5, //reduce matches
			source: () => formIris.click("#find-interesado"),
			render: item => (item.nif + " - " + item.nombre),
			select: item => item.nif,
			afterSelect: item => {
                perfil.setRolByNif(item.nif).setColectivo(item.ci);
                fIris.querySelector("#email").href = "mailto:" + item.email;
                fnPerfil();
            },
			onReset: () => {
                perfil.setRolP().setColectivo(null);
                fnPerfil();
            }
		});
        acOrganica = formIris.setAutocomplete("#ac-organica", {
            minLength: 4,
            source: () => formIris.click("#find-organica"),
            render: item => (item.o + " - " + item.dOrg),
            select: item => item.id,
            afterSelect: item => { !uxxiec.isUxxiec() && organicas.render([item]); }
            //onReset: () => { }
        });
        window.viewIris(xhr, status, args);
	}
    formIris.onChangeInput("#actividad", ev => { perfil.setActividad(ev.target.value); fnPerfil(); })
            .onChangeInput("#tramite", ev => { perfil.setTramite(ev.target.value); fnPerfil(); });
	/*** FORMULARIO PRINCIPAL ***/
});
