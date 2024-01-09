
import i18n from "../i18n/langs.js";

function Buzon() {
	const self = this; //self instance
    var tipoPago;

	this.isIsu = data => data.oCod && data.oCod.startsWith("300518") && ((data.mask & 8) == 8);
    this.setTipoPago = tipo => { tipoPago = tipo; return self; }
    this.isPagoProveedor = () => (tipoPago == 1);
    this.isPagoCesionario = () => (tipoPago == 2);

	this.render = function(data, output) {
        output.oCod = data.oCod;
        output.oDesc = data.oDesc;
        output.utCod = data.utCod;
        output.utDesc = data.utDesc;
        output.cd = i18n.isoFloat(data.cd);
        output.remove = data.num ? "" : '<a href="#remove" class="action action-red row-action" title="Desvincular orgánica"><i class="fas fa-times"></i></a>';
        return output;
    }
    this.parse = function(input, data) {
        return data;
    }
    this.isValidOrganica = function(data) {
        let ok = i18n.reset().isKey("organica", data.idOrg, "No ha seleccionado correctamente la orgánica"); // autocomplete required number
        ok &= i18n.isKey("tramit", data.tramit, "Unidad tramitadora no encontrada"); // select required number
        return ok || i18n.reject("Orgánica / Unidad Tramitadora no seleccionada correctamente.");
    }
    this.validate = function(data) {
    	return self.isValidOrganica(data);
    	// extra validations......
    }
}

export default new Buzon();
