
import uxxiec from "./Uxxiec.js";
import i18n from "../i18n/presto/langs.js";

function Partida(presto) {
	const self = this; //self instance
    const NO_APLICA = "N/A"; //default table float
    const ERR_ORGANICA = "No ha seleccionado correctamente la orgánica";

    let data; // Current presto data type
    this.getData = () => data;
    this.setData = partida => { data = partida; return self; }

    this.isAnticipada = partida => (partida.mask & 4);
    this.isImpExcedido = partida => ((presto.isAnt() || (partida.e == "642")) && Number.isNumber(partida.ih) && ((partida.ih + .01) < partida.imp));
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
        output.fa = i18n.boolval(self.isAfectada(data.omask));
        return output;
    }
    this.render = (data, output, resume) => {
        resume.imp += data.imp; // sum
        output.excedido = self.isImpExcedido(data) ? '<span class="text-warn text-xl" title="La cantidad solicitada excede el margen registrado por el Buzón de Ingresos">&#9888;</span>' : "";
        output.anticipada = self.isAnticipada(data) ? '<span class="text-xl" title="Este contrato ha gozado de anticipo en algún momento">&#65;</span>' : "";
        output.doc030 = presto.isGcr() ? '<a href="#doc030" class="fal fa-money-bill-alt action action-green row-action" title="Asociar los datos del documento 030"></a>' : "";
        output.remove = (presto.isEditable() && !presto.isAfc()) ? '<a href="#remove" class="fas fa-times action action-red row-action" title="Desasociar partida"></a>' : "";
        return self.format(data, output);
    }
    this.resume = (data, output) => {
        output.imp = i18n.isoFloat(data.imp);
        return output;
    }

    this.validate = data => {
        let ok = i18n.reset().isKey("acOrgInc", data.idOrgInc, ERR_ORGANICA); // autocomplete required key
        ok = i18n.isKey("idEcoInc", data.idEcoInc, "Debe seleccionar una económica") && ok; // select required number
        ok = i18n.gt0("impInc", data.impInc) && ok; // float number > 0
        return ok || i18n.reject("No ha seleccionada correctamente la partida a incrementar.");
    }
    this.validate030 = data030 => {
        if (!data) // Debo cargar previamente la partida seleccionada
            return i18n.reject("No se ha encontrado la partida asociada al documento 080.");
        let ok = i18n.reset().isKey("acOrg030", data030.idOrg030, ERR_ORGANICA); // autocomplete required key
        ok = i18n.isKey("idEco030", data030.idEco030, "Debe seleccionar una económica") && ok; // select required number
        ok = i18n.gt0("imp030", data030.imp030) && ok; // float number > 0
        const label = data030.acOrg030?.split(" - "); // Code separator
        ok = label ? ok : !i18n.setError(ERR_ORGANICA, "acOrg030");
        if (!ok)
            return i18n.reject("No ha seleccionada correctamente la aplicación para el DC 030.");
        if (data.imp < data030.imp030)
            return !i18n.setInputError("imp030", "errExceeded", "El importe del documento 030 excede al del 080.");
        // If ok => update partida a incrementar
        data.idOrg030 = +data030.idOrg030;
        [ data.o030, data.dOrg030 ] = label;
        data.idEco030 = data030.idEco030;
        data.imp030 = data030.imp030;
        return true;
    }
}

function Partidas(presto) {
	const self = this; //self instance
    const partida = new Partida(presto);

    let data, resume; // Current data table
    this.getData = () => data;
    this.setPartidas = partidas => {
        data = partidas;
        return self;
    }
    this.setData = table => {
        resume = table.getResume();
        return self.setPartidas(table.getData());
    }

    this.getImporte = () => resume.imp;
    this.getPartida = () => partida;

    this.setPrincipal = () => {
        data.sort((a, b) => (b.imp - a.imp)); //orden por importe desc.
        data[0].mask |= 1; //marco la primera como principal
        return self;
    }

    this.validate = () => { // Todas las solicitudes tienen partidas a incrementar
        return data.length || !i18n.setInputError("acOrgInc", "errRequired", "Debe seleccionar al menos una partida a incrementar");
    }
    this.validatePartida = partida => { // compruebo si la partida existía previamente
        return !data.find(row => ((row.o == partida.o) && (row.e == partida.e)));
    }
}

function Presto() {
	const self = this; //self instance
    const partidas = new Partidas(self);

    let data; // Current presto data type
    this.getData = name => (name ? data[name] : data);
    this.setPresto = presto => { data = presto; return self; }
    this.setData = input => {
        input.titulo = i18n.getItem("descTipos", input.tipo - 1);
        return self.setPresto(input);
    }

    this.getUxxiec = () => uxxiec;
    this.getPartidas = () => partidas;
    this.getPartida = partidas.getPartida;

    this.isTcr = () => (data.tipo == 1);
    this.isFce = () => (data.tipo == 6);
    this.isL83 = () => (data.tipo == 3);
    this.isGcr = () => (data.tipo == 4);
    this.isAnt = () => (data.tipo == 5);
    this.isAfc = () => (data.tipo == 8);

    this.isDisabled = () => data.id;
    this.isEditable = () => !data.id;
    this.isFirmable = () => uxxiec.isFirmable(data);
    this.isRechazable = () => uxxiec.isRechazable(data);
	this.isEditableUae = () => uxxiec.isEditableUae(data);
	this.isUrgente = () => uxxiec.isUrgente(data);
	this.isImpCd = () => (self.isEditable() && !self.isAnt());

    this.isPartidaDec = () => (self.isTcr() || self.isL83() || self.isAnt() || self.isAfc());
	this.isMultipartida = () => (self.isTcr() || self.isFce() || self.isGcr());
    this.isPartidaExt = () => (self.isGcr() || self.isAnt());
    this.isDisableEjInc = () => (data.id || self.isTcr() || self.isFce());
    this.isAutoLoadImp = () => (self.isL83() || self.isAnt() || self.isAfc());
    this.isAutoLoadInc = () => (self.isL83() || self.isAnt());

    this.render = (data, output) => {
        output.ej = data.ej;
        return output;
    }
    this.validate = data => {
        let ok = i18n.reset().isKey("acOrgDec", data.idOrgDec, "Debe seleccionar la orgánica que disminuye"); // autocomplete required key
        ok = i18n.isKey("idEcoDec", data.idEcoDec, "Debe seleccionar la económica que disminuye") && ok; // select required number
        ok || i18n.setError("No ha seleccionada correctamente la partida que disminuye."); // Main form message

        const imp = data.impDec ?? 0; // los importes pueden ser nulos segun el tipo de presto
        if (self.isPartidaDec() && (partidas.getImporte() != imp)) // Valido los importes a decrementar e incrementar
            ok = !i18n.setInputError("impDec", "notValid", "¡Los importes a decrementar e incrementar no coinciden!");
        const cd = self.isAnt() ? imp : (data.cd ?? 0); // los anticipos no validan el CD
        ok = (imp > cd) ? !i18n.setInputError("impDec", "errExceeded", "El importe de la partida que disminuye supera el crédito disponible") : ok;
        ok = i18n.size("memo", data.memo) ? ok : i18n.reject("Debe asociar una memoria justificativa a la solicitud."); // Required string
        if (data.urgente == "2") { // Solicitud urgente
            ok = i18n.size("extra", data.extra) ? ok : i18n.reject("Debe indicar un motivo para la urgencia de esta solicitud."); // Required string
            ok = i18n.geToday("fMax", data.fMax) ? ok : i18n.reject("Debe indicar una fecha maxima de resolución para esta solicitud."); // Required date
        }
        return partidas.validate() && ok;
    }
}

export default new Presto();
