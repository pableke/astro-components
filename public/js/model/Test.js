
import sb from "../lib/string-box.js";
import i18n from "../i18n/langs.js";

function Test() {
	const self = this; //self instance

    this.autocomplete = (data, i) => {
        return "" + (i + 1) + ".- " + data.nombre + " / " + data.titulo;
    }
    this.filter = (data, term) => {
        return data.filter(test => (sb.ilike(test.nombre, term) || sb.ilike(test.titulo, term)));
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
        return self;
    }
}

export default new Test();
