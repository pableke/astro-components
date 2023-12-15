
import tabs from "../../components/Tabs.js";
import gastos from "../../model/iris/Gastos.js";
import iris from "../../model/iris/Iris.js";
import i18n from "../../i18n/iris/langs.js";

const tabDietas = tabs.getTab(6);
const perfil = iris.getPerfil();
var formIris, dietas; // Global IRIS form

window.loadGastos = (form, data) => {
    formIris = form;
    gastos.setData(data);
    formIris.setOptions(formIris.querySelector("#grupo-factura-upct"), perfil.isIsu() ? i18n.get("gastosTiketIsu") : i18n.get("gastosTiket"))
            .toggle(".factura.upct", perfil.isFacturaUpct()).toggle(".doc-movilidad", perfil.isDocMovilidad());
}
