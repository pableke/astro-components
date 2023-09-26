
import sb from "../lib/string-box.js";
import i18n from "../i18n/langs.js";

const sysdate = (new Date()).toISOString(); // current date

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
        if (!data.nombre)
            i18n.setError("errRequired", "nombre");
        if (!data.titulo)
            i18n.setError("errRequired", "titulo");
        if (!data.imp || (data.imp < 0))
            i18n.setError("errGt0", "imp");
        if (!data.creado) // iso date validation (multiple errors)
            i18n.setError("errRequired", "creado"); // required
        else if (data.creado < sysdate.substring(0, 10))
            i18n.setError("errDateGt", "creado"); // not valid
        return i18n.isOk() || !i18n.setError("¡Error al validar los datos del formulario de test!");
    }
}

export default new Test();
