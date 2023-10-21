
import i18n from "../i18n/langs.js";
import valid from "../i18n/validators.js";

function Presto() {
	const self = this; //self instance
    const NO_APLICA = "N/A"; //default table float

    let data; // Define current presto data type
    this.setData = input => { data = input; return self; }
    this.isTcr = () => (data.tipo == 1);
    this.isFce = () => (data.tipo == 6);
    this.isL83 = () => (data.tipo == 3);
    this.isGcr = () => (data.tipo == 4);
    this.isAnt = () => (data.tipo == 5);
    this.isAfc = () => (data.tipo == 8);

    this.isPartidaDec = () => (self.isTcr() || self.isL83() || self.isAnt() || self.isAfc());
    this.isDisableEjInc = () => (data.id || self.isTcr() || self.isFce());
    this.isAutoLoadImp = () => (self.isL83() || self.isAnt() || self.isAfc());
    this.isAutoLoadInc = () => (self.isL83() || self.isAnt());

    this.isAnticipada = partida => (partida.mask & 4);
    this.isImpExcedido = partida => ((self.isAnt() || (partida.e == "642")) && String.isset(partida.ih) && ((partida.ih + .01) < partida.imp));
    this.isoBool = mask => i18n.getItem("msgBool", mask & 1);

    this.renderPartida = (data, output, resume) => {
        output.ej = data.ej;
        output.o = data.o; output.dOrg = data.dOrg;
        output.e = data.e; output.dEco = data.dEco;
        output.imp = i18n.isoFloat(data.imp) || NO_APLICA;
        output.gg = i18n.isoFloat(data.gg) || NO_APLICA;
        output.ing = i18n.isoFloat(data.ing) || NO_APLICA;
        output.ch = i18n.isoFloat(data.ch) || NO_APLICA;
        output.mh = i18n.isoFloat(data.mh) || NO_APLICA;
        output.ih = i18n.isoFloat(data.ih) || NO_APLICA;
        output.fUxxi = i18n.isoDate(data.fUxxi);
        output.fa = self.isoBool(data.omask);
        output.excedido = self.isImpExcedido(data) ? '<span class="textwarn textbig" title="La cantidad solicitada excede el margen registrado por el Buzón de Ingresos">&#9888;</span>' : "";
        output.anticipada = self.isAnticipada(data) ? '<span class="textbig" title="Este contrato ha gozado de anticipo en algún momento">&#65;</span>' : "";
        output.doc030 = isGcr ? '<a href="#tab-3" class="fas fa-wallet action tab-action"></a>' : "";
        resume.imp += data.imp; // sum
        return output;
    }
    this.renderResume = (data, output) => {
        output.imp = i18n.isoFloat(data.imp);
        output.size = data.size;
        return output;
    }

    this.validatePresto = data => {
        let ok = valid.reset().key("org-dec", data["org-dec-id"]); // autocomplete required key
        ok = valid.key("org-dec", data["org-dec-id"], "No ha seleccionado correctamente la orgánica") && ok;
        ok = valid.key("eco-dec", data["eco-dec"], "Debe seleccionar una económica") && ok; // select required number
        if (!ok)
            i18n.setError("No ha seleccionada correctamente la partida que disminuye.");

        const cd = data["imp-cd"] ?? 0;
        const imp = data["imp-dec"] ?? 0; // los importes pueden ser nulos segun el tipo de presto
        ok = (imp > cd) ? !i18n.setError("El importe de la partida que disminuye supera el crédito disponible", "imp-dec") : ok;
        ok = valid.size("memoria", data.memoria) ? ok : i18n.reject("Debe asociar una memoria justificativa a la solicitud."); // Required string
        if (data.urgente == "2") { // Solicitud urgente
            ok = valid.size("extra", data.extra) ? ok : i18n.reject("Debe indicar un motivo para la urgencia de esta solicitud."); // Required string
            ok = valid.geToday("fMax", data.fMax) ? ok : i18n.reject("Debe indicar una fecha maxima de resolución para esta solicitud."); // Required date
        }
        return ok;
    }
    this.validatePartida = data => {
        let ok = valid.reset().key("org-inc", data["org-inc-id"]); // autocomplete required key
        ok = valid.key("org-inc", data["org-inc-id"], "No ha seleccionado correctamente la orgánica") && ok;
        ok = valid.key("eco-inc", data["eco-inc"], "Debe seleccionar una económica") && ok; // select required number
        ok = valid.gt0("imp-inc", data["imp-inc"]) && ok; // float number > 0
        return ok || i18n.reject("No ha seleccionada correctamente la partida a incrementar.");
    }
}

export default new Presto();
