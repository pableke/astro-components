
import sb from "../lib/string-box.js";
import valid from "../lib/validator-box.js";
import i18n from "../i18n/langs.js";

function Test() {
	const self = this; //self instance

    this.filter = (data, params) => {
        return data.filter(test => (sb.ilike(test.nombre, params.nombre) || sb.ilike(test.titulo, params.titulo)));
    }
    this.filterByTerm = (data, term) => {
        return data.filter(test => (sb.ilike(test.nombre, term) || sb.ilike(test.titulo, term)));
    }
    this.autocomplete = (data, i) => {
        return "" + (i + 1) + ".- " + data.nombre + " / " + data.titulo;
    }

    this.format = function(data, output) {
        Object.assign(output, data);
        output.imp = i18n.isoFloat(data.imp);
        output.creado = i18n.isoDate(data.creado);
        return output;
    }
    this.render = function(data, output, i) {
        output.count = i + 1; // base 0 index
        return self.format(data, output);
    }
    this.parser = function(input, data) {
        data.imp = i18n.toFloat(input.imp);
        data.creado = input.creado;
        return data;
    }
    this.validate = function(data) {
        let ok = valid.reset().gt0("imp", data.imp); //required float
        ok &= valid.ge0("padre", data.padre); //optional number
        ok &= valid.geToday("creado", data.creado); //required iso date
        ok &= valid.size("nombre", data.nombre, 200); //required string
        ok &= valid.size("enlace", data.enlace, 200); //required string
        ok &= valid.max("titulo", data.titulo, 200); //optional string
        return ok || !i18n.setError("¡Error al validar los datos del formulario de test!");
    }
}

export default new Test();
