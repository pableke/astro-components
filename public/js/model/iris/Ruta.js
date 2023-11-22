
import i18n from "../../i18n/iris/langs.js";
import valid from "../../i18n/validators.js";

function Ruta() {
	const self = this; //self instance

    this.format = (data, output) => {
        output.origen = data.origen;
        output.destino = data.destino;
        output.km2 = i18n.isoFloat(data.km2);
        return output;
    }
    this.render = (data, output, resume) => {
        resume.km2 += data.km2;
        return self.format(data, output);
    }
    this.resume = (data, output) => {
        output.km2 = i18n.isoFloat(data.km2);
        return output;
    }

    this.validate = function(data) {
        let okOrigen = valid.reset().size("origen", data.origen); // autocomplete required string
        okOrigen = valid.isDate("f1", data.f1) && valid.isDate("h1", data.h1) && okOrigen;
        let ok = valid.size("destino", data.destino) && ok; // select required number
        ok = valid.isDate("f2", data.f2) && valid.isDate("h2", data.h2) && ok;
        if (!okOrigen)
            return i18n.reject("Debe seleccionar el origen de la etapa y la fecha de salida.");
        return ok || i18n.reject("Debe seleccionar el destino de la etapa y la fecha de llegada.");
    }
}

export default new Ruta();
