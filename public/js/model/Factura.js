
import i18n from "../i18n/langs.js";
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
        let ok = i18n.reset().gt0("imp", data.imp); // float required
        ok = i18n.size("desc", data.desc) && ok; // string required
        return ok || i18n.reject("El concepto indicado no es válido!"); // Main form message
    }
}

function Lineas(factura) {
	const self = this; //self instance
    const linea = new Linea(factura);

    let data; // Current presto data type
    this.getData = () => data;
    this.setLineas = lineas => {
        data = lineas;
        return self;
    }
    this.setData = table => {
        return self.setLineas(table.getData());
    }

    this.getLinea = () => linea;
    this.size = () => JSON.size(data);
    this.isEmpty = () => !self.size();

    this.validate = () => { // Todas las solicitudes tienen partidas a incrementar
        return data.length || !i18n.setInputError("desc", "errRequired", "Debe detallar los conceptos asociados a la solicitud.");
    }
}

function Factura() {
	const self = this; //self instance
    const lineas = new Lineas(self);

    let data; // Current factura data type
    this.getData = name => (name ? data[name] : data);
    this.setFactura = factura => { data = factura; return self; }
    this.setData = input => {
        input.titulo = (input.tipo == 1) ? "Solicitud de emisión de factura" : "Solicitud de emisión de carta de pago";
        return self.setFactura(input);
    }

    this.getLineas = () => lineas;
    this.setLineas = table => { lineas.setData(table); return self; }
    this.getLinea = lineas.getLinea;

    this.isFactura = () => (data.tipo == 1);
    this.isCartaPago = () => (data.tipo == 3);

    this.isDisabled = () => data.id;
    this.isEditable = () => !data.id;
    this.isFirmable = () => uxxiec.isFirmable(data);
    this.isRechazable = () => uxxiec.isRechazable(data);
	this.isEditableUae = () => uxxiec.isEditableUae(data);
    this.isFirmaGaca = () => uxxiec.isUae() && self.isTtpp();

    this.getSubtipo = () => data.subtipo;
    this.setSubtipo = val => { data.subtipo = val; return self; }
    this.isTtpp = () => (data.subtipo == 3);
    this.isTituloOficial = () => (data.subtipo == 4);
    this.isExtension = () => (data.subtipo == 9);
    this.isDeportes = () => (data.subtipo == 10);
    this.isRecibo = () => (self.isTtpp() || self.isTituloOficial() || self.isExtension());
    this.setSujeto = val => { data.sujeto = val; return self; }
    this.isExento = () => !data.sujeto;

    this.getIva = () => data.iva;
    this.setIva = imp => { data.iva = imp; return self; }

    this.isFace = () => (data.face == 1); //factura electronica FACe
    this.isPlataforma = () => (data.face == 2); //factura electronica Otras
    this.setFace = val => { data.face = val; return self; }

    this.render = (data, output, resume) => {
        resume.imp += data.imp; // sum
        return output;
    }
    this.validate = function(data) {
        let ok = i18n.reset().isKey("acTercero", data.idTercero, "Debe seleccionar un tercero válido"); // autocomplete required key
        ok = i18n.isKey("acOrganica", data.idOrganica, "No ha seleccionado correctamente la orgánica") && ok; // autocomplete required key
		ok = (self.isRecibo()) ? i18n.size("acRecibo", data.acRecibo, "Debe indicar un número de recibo válido") : ok; //subtipo = ttpp o extension
		/*if (self.isDeportes()) {
            ok = i18n.size("extra", data.extra, "errRequired") ? ok : i18n.reject("Debe indicar un número de recibo válido"); // Required string
            ok = i18n.leToday("fMax", data.fMax) ? ok : i18n.reject("Debe indicar la fecha del recibo asociado"); // Required date
        }*/
        ok = i18n.size("memo", data.memo) ? ok : i18n.reject("Debe indicar las observaciones asociadas a la solicitud."); // Required string
        ok = self.isFace() ? (i18n.size("og", data.og) && i18n.size("oc", data.oc) && i18n.size("ut", data.ut)) : ok;
        ok = self.isPlataforma() ? i18n.size("og", data.og) : ok;
        return lineas.validate() && ok;
    }
}

export default new Factura();
