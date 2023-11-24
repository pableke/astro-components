
import i18n from "../i18n/langs.js";
import valid from "../i18n/validators.js";
import uxxiec from "./Uxxiec.js";

function Linea(factura) {
	const self = this; //self instance

    this.format = (data, output) => {
        output.desc = data.desc;
        output.imp = i18n.isoFloat(data.imp);
        return output;
    }
    this.render = (data, output, resume) => {
        resume.imp += data.imp;
        output.remove = factura.isEditable() ? '<a href="#remove" class="fas fa-times action action-red row-action" title="Desasociar partida"></a>' : "";
        return self.format(data, output);
    }
    this.resume = (data, output) => {
        output.imp = i18n.isoFloat(data.imp);
        return output;
    }

    this.validate = function(data) {
        let ok = valid.reset().gt0("imp", data.imp); // float required
        ok = valid.size("desc", data.desc) && ok; // string required
        return ok || i18n.reject("El concepto indicado no es válido!"); // Main form message
    }
}

function Factura() {
	const self = this; //self instance
    const linea = new Linea(self);

    let data; // Current factura data type
    this.getData = name => (name ? data[name] : data);
    this.setData = input => { data = input; return self; }
    this.getLinea = () => linea;

    this.isEditable = () => !data.id;
    this.isFactura = () => (data.tipo == 1);
    this.isCartaPago = () => (data.tipo == 3);
    this.isRechazada = () => (data.estado == 2);
    this.isFirmable = () => ((data.estado == 5) && ((data.fmask & 64) == 64));
    this.isRechazable = () => (data.id && (uxxiec.isUae() || self.isFirmable()));
    this.isFirmaGaca = () => uxxiec.isUae() && self.isTtpp();
	this.isEditableUae = () => self.isEditable() || (uxxiec.isUae() && self.isFirmable());

    this.getSubtipo = () => data.subtipo;
    this.setSubtipo = val => { data.subtipo = val; return self; }
    this.isTtpp = () => (data.subtipo == 3);
    this.isTituloOficial = () => (data.subtipo == 4);
    this.isExtension = () => (data.subtipo == 9);
    this.isDeportes = () => (data.subtipo == 10);
    this.isRecibo = () => (self.isTtpp() || self.isTituloOficial() || self.isExtension());

    this.getIva = () => data.iva;
    this.setIva = imp => { data.iva = imp; return self; }

    this.isFace = () => (data.face == 1); //factura electronica FACe
    this.isPlataforma = () => (data.face == 2); //factura electronica Otras

    this.render = (data, output, resume) => {
        resume.imp += data.imp; // sum
        return output;
    }
    this.validate = function(data) {
        let ok = valid.reset().key("acTercero", data.idTercero, "Debe seleccionar un tercero válido"); // autocomplete required key
        ok = valid.key("acOrganica", data.idOrganica, "No ha seleccionado correctamente la orgánica") && ok; // autocomplete required key
		ok = (self.isRecibo()) ? valid.size("acRecibo", data.refreb, "Debe indicar un número de recibo válido") : ok; //subtipo = ttpp o extension
		/*if (self.isDeportes()) {
            ok = valid.size("extra", data.extra, "errRequired") ? ok : i18n.reject("Debe indicar un número de recibo válido"); // Required string
            ok = valid.leToday("fMax", data.fMax) ? ok : i18n.reject("Debe indicar la fecha del recibo asociado"); // Required date
        }*/
        ok = valid.size("memo", data.memo) ? ok : i18n.reject("Debe indicar las observaciones asociadas a la solicitud."); // Required string
        ok = self.isFace() ? (valid.size("#og", data.og) && valid.size("#oc", data.oc) && valid.size("#ut", data.ut)) : ok;
        return self.isPlataforma() ? valid.size("#og", data.og) : ok;
    }
}

export default new Factura();
