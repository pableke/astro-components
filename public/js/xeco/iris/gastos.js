
import gastos from "../../model/iris/Gastos.js";
import iris from "../../model/iris/Iris.js";
import i18n from "../../i18n/iris/langs.js";

const perfil = iris.getPerfil();
const gasto = gastos.getGasto();
var formIris, dietas; // Global IRIS form

export default function(form, data) {
    formIris = form;
    gastos.setData(data);
    /*dietas = dietas || formIris.setTable("#dietas", {
        msgEmptyTable: "No existen dietas asociadas a la comunicación.",
        beforeRender: resume => { resume.imp1 = resume.imp2 = 0; },
        onRender: gasto.render,
        onFooter: gasto.resume,
        afterRender: resume => formIris.stringify("#dietas-json", gastos)
    });
	dietas.render(gastos.getDietas());*/
    formIris.toggle(".rutas-pendientes", iris.isRutasPendientes()).toggle(".noches-pendientes", iris.getNochesPendientes()).toggle(".rutas-out", iris.getNumRutasOut())
            .toggle(".factura.upct", perfil.isFacturaUpct()).toggle(".doc-movilidad", perfil.isDocMovilidad());
    formIris.setDatalist("#grupo-factura-upct").setOptions(perfil.isIsu() ? i18n.get("gastosTiketIsu") : i18n.get("gastosTiket"));
}
