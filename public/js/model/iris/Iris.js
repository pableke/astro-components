
import perfil from "./Perfil.js";
import rutas from "./Rutas.js";
import gastos from "./Gastos.js";
import uxxiec from "../Uxxiec.js";
import i18n from "../../i18n/iris/langs.js";

function Iris() {
	const self = this; //self instance

    let data; // Current factura data type
    this.getData = () => data;
    this.setData = input => {
        data = input; // Load form data
		perfil.setPerfil(data.perfil); // Load perfil from string
        return self;
    }

    this.getUxxiec = () => uxxiec;
    this.getPerfil = () => perfil;
    this.getRutas = () => rutas;
    this.getGastos = () => gastos;

    this.isEditableP0 = () => !data.id;
    this.isEditable = () => (data.estado == 6);
    this.isRechazada = () => (data.estado == 2);
    this.isFirmable = () => ((data.estado == 5) && ((data.fmask & 64) == 64));
    this.isRechazable = () => (data.id && !self.isEditable() && (uxxiec.isUae() || self.isFirmable()));
	this.isEditableUae = () => self.isEditable() || (uxxiec.isUae() && self.isFirmable());

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
