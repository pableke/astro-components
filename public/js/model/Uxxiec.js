
import i18n from "../i18n/langs.js";
import valid from "../i18n/validators.js";

function Uxxiec(presto) {
    this.render = (data, output) => {
        output.num = data.num;
        output.uxxi = data.uxxi;
        output.desc = data.desc;
        output.imp = i18n.isoFloat(data.imp) || "-";
        output.fUxxi = i18n.isoDate(data.fUxxi);
        return output;
    }

    this.validate = data => {
        return true;
    }
    this.validateReject = data => {
        return valid.reset().size("rechazo", data.rechazo) || i18n.reject("Debe indicar un motivo para el rechazo de la solicitud."); // Required string
    }
}

export default new Uxxiec();
