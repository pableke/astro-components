
import i18n from "../i18n/langs.js";
import valid from "../i18n/validators.js";

function Partida(presto) {
	const self = this; //self instance
    const NO_APLICA = "N/A"; //default table float

    this.isAnticipada = partida => (partida.mask & 4);
    this.isImpExcedido = partida => ((presto.isAnt() || (partida.e == "642")) && String.isset(partida.ih) && ((partida.ih + .01) < partida.imp));
    this.isAfectada = mask => (mask & 1); // Es afectada? Si/No

    this.format = (data, output) => {
        output.ej = data.ej;
        output.o = data.o; output.dOrg = data.dOrg;
        output.e = data.e; output.dEco = data.dEco;
        output.imp = i18n.isoFloat(data.imp) || NO_APLICA;
        output.gg = i18n.isoFloat(data.gg) || NO_APLICA;
        output.ing = i18n.isoFloat(data.ing) || NO_APLICA;
        output.ch = i18n.isoFloat(data.ch) || NO_APLICA;
        output.mh = i18n.isoFloat(data.mh) || NO_APLICA;
        output.ih = i18n.isoFloat(data.ih) || NO_APLICA;
        output.fa = self.isAfectada(data.omask);
        return output;
    }
    this.render = (data, output, resume) => {
        resume.imp += data.imp; // sum
        output.excedido = self.isImpExcedido(data) ? '<span class="text-warn text-xl" title="La cantidad solicitada excede el margen registrado por el Buzón de Ingresos">&#9888;</span>' : "";
        output.anticipada = self.isAnticipada(data) ? '<span class="text-xl" title="Este contrato ha gozado de anticipo en algún momento">&#65;</span>' : "";
        output.doc030 = presto.isGcr() ? '<a href="#doc030" class="fal fa-money-bill-alt action action-green row-action"></a>' : "";
        return self.format(data, output);
    }
    this.resume = (data, output) => {
        output.imp = i18n.isoFloat(data.imp);
        return output;
    }

    this.validate = data => {
        let ok = valid.reset().key("acOrgInc", data.idOrgInc, "No ha seleccionado correctamente la orgánica"); // autocomplete required key
        ok = valid.key("idEcoInc", data.idEcoInc, "Debe seleccionar una económica") && ok; // select required number
        ok = valid.gt0("impInc", data.impInc) && ok; // float number > 0
        return ok || i18n.reject("No ha seleccionada correctamente la partida a incrementar.");
    }
    this.validate030 = data => {
        let ok = valid.reset().key("acOrg030", data.idOrg030, "No ha seleccionado correctamente la orgánica"); // autocomplete required key
        ok = valid.key("idEco030", data.idEco030, "Debe seleccionar una económica") && ok; // select required number
        ok = valid.gt0("imp030", data.imp030) && ok; // float number > 0
        return ok || i18n.reject("No ha seleccionada correctamente la aplicación para el DC 030.");
    }
}

function Presto() {
	const self = this; //self instance
    const partida = new Partida(self);
    const ESTADOS = [ "Sin Enviar", "Aceptada", "Rechazada", "Ejecutada", "Notificada", "Enviada", "Sin Enviar" ];
    const TIPOS = [
            "-", "Transferencia de Crédito", "Fondo de Cobertura GENCOM", "Liquidación de Contrato de Art. 83 LOU", "Generación de Crédito FA", 
		"Anticipos sobre Recaudación A83, TTPP y Cátedras", "Fondo de Cobertura", "Generación de Crédito GENCOM", "Ampliación FC"
    ];

    let data; // Current presto data type
    this.getData = name => (name ? data[name] : data);
    this.setData = input => { data = input; return self; }
    this.isTcr = () => (data.tipo == 1);
    this.isFce = () => (data.tipo == 6);
    this.isL83 = () => (data.tipo == 3);
    this.isGcr = () => (data.tipo == 4);
    this.isAnt = () => (data.tipo == 5);
    this.isAfc = () => (data.tipo == 8);
    this.getEstado = () => ESTADOS[data.estado];
    this.getTipo = () => TIPOS[data.tipo];
    this.getCodigo = () => data.codigo || "";

    this.isEditable = () => !data.id;
    this.isFirmable = () => (data.estado == 5);
    this.isPartidaDec = () => (self.isTcr() || self.isL83() || self.isAnt() || self.isAfc());
    this.isPartidaExt = () => (self.isGcr() || self.isAnt());
    this.isDisableEjInc = () => (data.id || self.isTcr() || self.isFce());
    this.isAutoLoadImp = () => (self.isL83() || self.isAnt() || self.isAfc());
    this.isAutoLoadInc = () => (self.isL83() || self.isAnt());

    this.isAnticipada = data => partida.isAnticipada(data);
    this.isImpExcedido = data => partida.isImpExcedido(data);
    this.isAfectada = mask => partida.isAfectada(mask);

    this.render = (data, output) => {
        output.ej = data.ej;
        return output;
    }
    this.renderUxxiec = (data, output) => {
        output.num = data.num;
        output.uxxi = data.uxxi;
        output.desc = data.desc;
        output.imp = i18n.isoFloat(data.imp) || "-";
        output.fUxxi = i18n.isoDate(data.fUxxi);
        return output;
    }
    this.validate = data => {
        let ok = valid.reset().key("acOrgDec", data.idOrgDec, "Debe seleccionar la orgánica que disminuye"); // autocomplete required key
        ok = valid.key("idEcoDec", data.idEcoDec, "Debe seleccionar la económica que disminuye") && ok; // select required number
        ok || i18n.setError("No ha seleccionada correctamente la partida que disminuye."); // Main form message

        const imp = data.impDec ?? 0; // los importes pueden ser nulos segun el tipo de presto
        const cd = self.isAnt() ? imp : (data.cd ?? 0); // los anticipos no validan el CD
        ok = (imp > cd) ? i18n.setError("Error al validar el importe", "impDec").reject("El importe de la partida que disminuye supera el crédito disponible") : ok;
        ok = valid.size("memo", data.memo) ? ok : i18n.reject("Debe asociar una memoria justificativa a la solicitud."); // Required string
        if (data.urgente == "2") { // Solicitud urgente
            ok = valid.size("extra", data.extra) ? ok : i18n.reject("Debe indicar un motivo para la urgencia de esta solicitud."); // Required string
            ok = valid.geToday("fMax", data.fMax) ? ok : i18n.reject("Debe indicar una fecha maxima de resolución para esta solicitud."); // Required date
        }
        return ok;
    }
    this.validateReject = data => {
        return valid.reset().size("rechazo", data.rechazo) || i18n.reject("Debe indicar un motivo para el rechazo de la solicitud."); // Required string
    }

    this.formatPartida = partida.format;
    this.renderPartida = partida.render;
    this.renderResume = partida.resume;
    this.validatePartida = partida.validate;
    this.validate030 = partida.validate030;
}

export default new Presto();
