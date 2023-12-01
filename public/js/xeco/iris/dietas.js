
import tabs from "../../components/Tabs.js";
import iris from "../../model/iris/Iris.js";

const tabDietas = tabs.getTab(6);
var formIris, dietas; // Global IRIS form

window.loadDietas = (form, data) => {
    console.log("🚀 ~ file: dietas.js:9 ~ data:", data)
    formIris = form;
    /*dietas = dietas || formIris.setTable("#rutas-maps", {
        msgEmptyTable: "No existen etapas asociadas a la comunicación."
    });*/
}
