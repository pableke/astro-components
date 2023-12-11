
import i18n from "../i18n/langs/langs.js";
import valid from "../i18n/validators.js";

function Buzon() {
	const self = this; //self instance

	this.isIsu = data => data.oCod && data.oCod.startsWith("300518") && ((data.mask & 8) == 8);

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
        let ok = valid.reset().key("org-id", data["org-id"]); // id asociated to organica
        ok &= valid.key("organica", data["org-id"], "No ha seleccionado correctamente la orgánica"); // autocomplete required number
        ok &= valid.key("tramit", data.tramit, "Unidad tramitadora no encontrada"); // select required number
        return ok || i18n.reject("Orgánica / Unidad Tramitadora no seleccionada correctamente.");
    }
    this.validate = function(data) {
    	return self.isValidOrganica(data);
    	// extra validations......
    }
}

export default new Buzon();
