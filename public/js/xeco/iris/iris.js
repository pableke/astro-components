
import Form from "../../components/Form.js";
import tabs from "../../components/Tabs.js";
import pf from "../../components/Primefaces.js";

import iris from "../../model/iris/Iris.js";
import i18n from "../../i18n/iris/langs.js";

import maps from "./maps.js";
import gastos from "./gastos.js";

document.addEventListener("DOMContentLoaded", () => {
    const uxxiec = iris.getUxxiec();
    const perfil = iris.getPerfil();

	/*** FORMULARIO PRINCIPAL ***/
    const formIris = new Form("#xeco-iris");
    window.fnSavePerfil = () => formIris.isValid(perfil.validate); // validate perfil paso=0
    window.fnSave = () => tabs.isValid(); // call tab validator paso=n

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

    formIris.onChangeInput("#actividad", ev => { perfil.setActividad(ev.target.value); fnPerfil(); })
            .onChangeInput("#tramite", ev => { perfil.setTramite(ev.target.value); fnPerfil(); });
    pf.multiNameInput(formIris, "#matricula-pf", "[name=matricula]");

    const fnDespMun = value => { formIris.toggle(".grupo-matricula-mun", value == "1"); };
    formIris.setDatalist("#desp-mun", { onChange: fnDespMun }).setOptions(i18n.get("despMun"));

    const fnDespMaps = value => { formIris.toggle(".grupo-matricula-maps", value == "1"); }
    formIris.setDatalist("#desp-maps", { emptyOption: i18n.get("selectOption"), onChange: fnDespMaps }).setOptions(i18n.get("despMun"));

    formIris.setAutocomplete("#acInteresado", {
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
    const acOrganica = formIris.setAutocomplete("#acOrganica", {
        minLength: 4,
        source: () => formIris.click("#find-organica"),
        render: item => (item.o + " - " + item.dOrg),
        select: item => item.id,
        afterSelect: item => { !uxxiec.isUxxiec() && organicas.render([item]); }
        //onReset: () => { }
    });

    //****** tabla de organicas ******//
    const organica = perfil.getOrganica();
	const organicas = formIris.setTable("#organicas", {
        msgEmptyTable: "No existen orgánicas asociadas a la comunicación.",
        //beforeRender: resume => { },
        onRender: organica.render,
        //onFooter: organica.resume,
        afterRender: resume => {
            perfil.refinanciar(organicas);
            formIris.saveTable("#organicas-json", organicas)
                    .hide(".fin-info").show(".fin-" + perfil.getFinanciacion());
            fnPerfil();
        }
    });
    formIris.setClick("[href='#add-organica']", ev => {
        const org = acOrganica.getCurrentItem();
        org && organicas.add(org);
        acOrganica.reload();
    });
	//****** tabla de organicas ******//

    window.viewIris = (xhr, status, args) => {
        if (!window.showTab(xhr, status, args))
            return false; // Server error => stop
        const data = JSON.read(args.iris);
        iris.setData(data); // Prepare inputs and load data before render
        organicas.render(JSON.read(args.data)); // Organicas asociadas a la solicitud
        formIris.toggle(".show-uxxiec", uxxiec.isUxxiec()).toggle("#ac-organica", !data.id || !uxxiec.isUxxiec())
                .setval("#actividad", perfil.getActividad()).setval("#tramite", perfil.getTramite())
                .toggle(".insert-only", iris.isEditable()).toggle(".update-only", iris.isDisabled())
                .toggle(".firmable-only", iris.isFirmable()).toggle(".rechazable-only", iris.isRechazable()).toggle(".editable-only", iris.isEditable())
                .toggle(".mun-only", perfil.isMUN()).readonly(!iris.isEditable(), ".ui-mun")
                .toggle(".oce-only", perfil.isColaboracion()).readonly(!iris.isEditable(), ".ui-oce")
                .toggle(".aut-only", perfil.isAUT()).readonly(!iris.isEditable(), ".ui-aut")
                .toggle(".act1dia-only", perfil.is1Dia()).readonly(!iris.isEditable(), ".ui-1dia");
        maps(formIris, JSON.read(args.rutas)); // Muestro las rutas asociadas a la solicitud
        gastos(formIris, JSON.read(args.gastos)); // Cargo las dietas asociadas a la solicitud
        tabs.render(".load-data", data).showTab(args.tab); // Render changes and show specific tab
	};
	/*** FORMULARIO PRINCIPAL ***/
});
