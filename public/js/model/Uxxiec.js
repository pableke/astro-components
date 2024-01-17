
import i18n from "../i18n/langs.js";

function Uxxiec() {
	const self = this; //self instance
    let nif, usuec, grupo; //user params

    this.getNif = () => nif;
    this.setNif = val => { nif = val; return self; }

    this.isUsuEc = () => usuec;
    this.setUsuEc = val => { usuec = val; return self; }
    this.setGrupo = val => { grupo = val; return self; }
    this.isUxxiec = () => usuec;
    this.setUxxiec = val => self.setUsuEc(val == "true");
    this.setData = data => self.setNif(data.nif).setUxxiec(data.usuec).setGrupo(data.grupo);

    this.isUae = () => (grupo == "2"); // UAE
    this.isOtri = () => ((grupo == "8") || (grupo == "286") || (grupo == "134") || (grupo == "284")); // OTRI / UITT / UCCT / Catedras
    //this.isUtec = () => (grupo == "6");
    //this.isGaca = () => (grupo == "54");
    //this.isEut = () => (grupo == "253");
    //this.isEstudiantes = () => (grupo == "9");
    //this.isContratacion = () => (grupo == "68");

    this.isDisabled = data => data.id;
    this.isEditable = data => !data.id;
    this.isRechazada = data => (data.estado == 2);
    this.isFirmable = data => ((data.estado == 5) && ((data.fmask & 64) == 64));
    this.isRechazable = data => (data.id && (self.isUae() || self.isFirmable(data)));
    this.isEjecutable = data => (self.isUae() && [1, 3, 4, 9, 10].includes(data.estado)); // Aceptada, Ejecutada, Notificada ó Erronea
	this.isEditableUae = data => (self.isEditable(data) || (self.isUae() && self.isFirmable(data)));
	this.isUrgente = data => (data.fMax && data.extra); //solicitud urgente?

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
        return i18n.reset().size("rechazo", data.rechazo) || i18n.reject("Debe indicar un motivo para el rechazo de la solicitud."); // Required string
    }
}

export default new Uxxiec();
