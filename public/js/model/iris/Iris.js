
import perfil from "./Perfil.js";
import uxxiec from "../Uxxiec.js";
import i18n from "../../i18n/iris/langs.js";
import valid from "../../i18n/validators.js";

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

    this.isEditableP0 = () => !data.id;
    this.isEditable = () => (data.estado == 6);
    this.isRechazada = () => (data.estado == 2);
    this.isFirmable = () => ((data.estado == 5) && ((data.fmask & 64) == 64));
    this.isRechazable = () => (data.id && (uxxiec.isUae() || self.isFirmable()));
	this.isEditableUae = () => self.isEditable() || (uxxiec.isUae() && self.isFirmable());

    this.validate = function(data) {
        let ok = valid.reset().size("objeto", data.objeto, "Debe seleccionar el objeto de la comisión"); // required string
        return ok ||i18n.reject("errForm");
    }
}

export default new Iris();
