
import Form from "../../components/Form.js";
import Table from "../../components/Table.js";
import tabs from "../../components/Tabs.js";
import iris from "../../model/iris/Iris.js";
import i18n from "../../i18n/iris/langs.js";

document.addEventListener("DOMContentLoaded", () => {
    const uxxiec = iris.getUxxiec();
    const perfil = iris.getPerfil();
    let acOrganica;

	/*** FORMULARIO PRINCIPAL ***/
    const formIris = new Form("xeco-iris");
    window.fnSavePerfil = () => {
		if (organicas.isEmpty())
			return !formIris.setError("#acOrganica", "Debe asociar al menos una orgánica a la comunicación.");
        formIris.setval("#presupuesto", JSON.stringify(organicas.getData()));
		return formIris.isValid(perfil.validate);
	}

    formIris.onChangeInput("#actividad", ev => { perfil.setActividad(ev.target.value); fnPerfil(); })
            .onChangeInput("#tramite", ev => { perfil.setTramite(ev.target.value); fnPerfil(); })
            .setOptions("#desp-mun", i18n.get("despMun"))
            .onChangeInput("#desp-mun", ev => formIris.toggle(".grupo-matricula-mun", ev.target.value == "1"))
            .setOptions("#desp-maps", i18n.get("despMaps"), null, i18n.get("selectOption"))
            .onChangeInput("#desp-maps", ev => formIris.toggle(".grupo-matricula-maps", ev.target.value == "1"))
            .onChangeInput("[name=matricula]", ev => formIris.setval("#matricula-pf", ev.target.value));

	//****** tabla de organicas ******//
	const organica = perfil.getOrganica();
	const tOrganicas = formIris.querySelector("#organicas");
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
	//****** tabla de organicas ******//

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
        window.loadDietas(formIris, JSON.read(args.gastos)); // Cargo las dietas asociadas a la solicitud
        formIris.setval("#actividad", perfil.getActividad()).setval("#tramite", perfil.getTramite())
                .toggle("#ac-organica", !data.id || !uxxiec.isUxxiec()).setMode(data.id)
                .toggle(".firmable-only", iris.isFirmable()).toggle(".rechazable-only", iris.isRechazable()).toggle(".editable-only", iris.isEditable())
                .toggle(".mun-only", perfil.isMUN()).toggle(".colaboracion-only", perfil.isColaboracion())
                .toggle(".aut-only", perfil.isAUT()).toggle(".act1dia-only", perfil.is1Dia());
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
                formIris.querySelector("#email").href = "mailto:" + item.email;
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
	/*** FORMULARIO PRINCIPAL ***/
});
