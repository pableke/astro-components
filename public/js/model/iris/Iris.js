
import perfil from "./Perfil.js";
import rutas from "./Rutas.js";
import gastos from "./Gastos.js";
import uxxiec from "../Uxxiec.js";
import i18n from "../../i18n/iris/langs.js";

function Iris() {
	const self = this; //self instance

    let data; // Current factura data type
    this.getData = () => data;
    this.setIris = iris => { data = iris; return self; }
    this.setData = data => {
		perfil.setPerfil(data.perfil); // Load perfil from string
        return self.setIris(data);
    }

    this.getUxxiec = () => uxxiec;
    this.getPerfil = () => perfil;
    this.getRutas = () => rutas;
    this.getGastos = () => gastos;

    this.isDisabled = () => data.id;
    this.isEditable = () => !data.id;
    this.isFirmable = () => uxxiec.isFirmable(data);
    this.isRechazable = () => uxxiec.isRechazable(data);
	this.isEditableUae = () => uxxiec.isEditableUae(data);
	this.isUrgente = () => uxxiec.isUrgente(data);

	this.getNumRutasOut = () => rutas.getRutasOut().length;
	this.getNochesPendientes = () => rutas.getNumNoches() - gastos.getNumNoches() - 1;
	this.isRutasPendientes = () => (perfil.isRutas() && (self.getNochesPendientes() || self.getNumRutasOut()));

    this.validate = function(data) {
        let ok = i18n.reset().size("objeto", data.objeto, "Debe seleccionar el objeto de la comisión"); // required string
        return ok || i18n.reject("errForm");
    }
    this.validateRutas = function(data) {
        const ok = self.validate(data);
        return rutas.validate() && ok;
    }
}

export default new Iris();
