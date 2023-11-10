
import i18n from "../i18n/langs.js";
import valid from "../i18n/validators.js";

function Uxxiec() {
	const self = this; //self instance
    let nif, usuec, uae; //user params

    this.getNif = () => nif;
    this.setNif = val => { nif = val; return self; }

    this.isUsuEc = () => usuec;
    this.setUsuEc = val => { usuec = val; return self; }
    this.isUsuUae = () => uae;
    this.setUsuUae = val => { uae = val; return self; }

    this.isUxxiec = () => usuec;
    this.setUxxiec = val => self.setUsuEc(val == "true");
    this.isUae = () => uae;
    this.setUae = val => self.setUsuUae(val == "true");

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
