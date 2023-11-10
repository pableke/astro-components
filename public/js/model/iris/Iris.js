
import i18n from "../../i18n/iris/langs.js";
import valid from "../../i18n/validators.js";
import uxxiec from "../Uxxiec.js";

function Ruta(irse) {
	const self = this; //self instance
}

function Gasto(irse) {
	const self = this; //self instance
}

function Iris() {
	const self = this; //self instance
    const ruta = new Ruta(self);
    const gasto = new Gasto(self);

    let data; // Current factura data type
    this.getData = () => data;
    this.setData = input => { data = input; return self; }
    this.getRuta = () => ruta;
    this.getGasto = () => gasto;

    this.isEditable = () => !data.id;
    this.isFirmable = () => (data.estado == 5);
	this.isEditableUae = () => self.isEditable() || (uxxiec.isUae() && self.isFirmable());
}

export default new Iris();
