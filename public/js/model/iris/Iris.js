
import i18n from "../../i18n/iris/langs.js";
import valid from "../../i18n/validators.js";
import uxxiec from "../Uxxiec.js";

function Iris() {
	const self = this; //self instance

    let data; // Current factura data type
    this.getData = () => data;
    this.setData = input => { data = input; return self; }

    this.isEditableP0 = () => !data.id;
    this.isEditable = () => (data.estado == 6);
    this.isRechazada = () => (data.estado == 2);
    this.isFirmable = () => ((data.estado == 5) && ((data.fmask & 64) == 64));
    this.isCancelable = () => (uxxiec.isUae() && data.id && !self.isEditable() && !self.isFirmable() && !self.isRechazada());
	this.isEditableUae = () => self.isEditable() || (uxxiec.isUae() && self.isFirmable());

    this.validate = function(data) {
        let ok = valid.reset().size("objeto", data.objeto, "Debe seleccionar el objeto de la comisión"); // required string
        return ok;
    }
}

export default new Iris();
