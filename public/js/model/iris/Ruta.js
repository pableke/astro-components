
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
        let ok = valid.reset().size("origen", data.origen, "Debe seleccionar el origen de la etapa"); // autocomplete required string
        ok = valid.size("destino", data.destino, "Debe seleccionar el destino de la etapa") && ok; // select required number
        return ok;
    }
}

export default new Ruta();
