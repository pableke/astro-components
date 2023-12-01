
import i18n from "../../i18n/iris/langs.js";
import valid from "../../i18n/validators.js";

const H24 = "00:00";
const MS0 = ":00.0";
const CT_PAIS = "ES";
const CT_LAT = 37.62568269999999;
const CT_LNG = -0.9965839000000187;
const CT_NAME = "Cartagena, España";

function Ruta() {
	const self = this; //self instance
    let data, origen, destino;

    this.getData = () => data;
    this.setData = input => {
        data = input;
        data.h1 = data.h1 || H24;
        data.h2 = data.h2 || H24;
		data.dt1 = data.f1 + "T" + data.h1 + MS0;
		data.dt2 = data.f2 + "T" + data.h2 + MS0;
        return self;
    }

    this.getCT = () => CT_NAME;
    this.getOrigen = () => origen;
    this.setOrigen = place => { origen = place; return self; }
    this.setPlace1 = (lat, lng, pais) => {
        data.lat1 = lat;
        data.lng1 = lng;
        data.pais1 = pais;
        return self;
    }
    this.setOrigenCT = () => self.setPlace1(CT_LAT, CT_LNG, CT_PAIS);

    this.getDestino = () => destino;
    this.setDestino = place => { destino = place; return self; }
    this.setPlace2 = (lat, lng, pais) => {
        data.lat2 = lat;
        data.lng2 = lng;
        data.pais2 = pais;
        return self;
    }
    this.setDestinoCT = () => self.setPlace2(CT_LAT, CT_LNG, CT_PAIS);

    this.isVehiculoPropio = () => (data.desp == 1);
    this.nextPlace = () => {
        origen = destino;
        destino = null;
        return self;
    }

    this.format = (data, output) => {
        output.origen = data.origen;
        output.destino = data.destino;
        output.f1 = i18n.isoDate(data.f1 || data.dt1.substring(0, 10));
        output.h1 = data.h1 || i18n.isoTimeShort(data.dt1);
        output.f2 = i18n.isoDate(data.f2 || data.dt2.substring(0, 10));
        output.h2 = data.h2 || i18n.isoTimeShort(data.dt2);
        output.desp = i18n.getItem("despMaps", data.desp - 1);
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
        okOrigen = valid.isDate("f1", data.f1) && valid.isTime("h1", data.h1) && okOrigen;
        let ok = valid.size("destino", data.destino) && okOrigen; // select required number
        ok = valid.isDate("f2", data.f2) && valid.isTime("h2", data.h2) && ok;
        if (!okOrigen)
            return i18n.reject("Debe seleccionar el origen de la etapa y la fecha de salida.");
        return destino ? ok : i18n.reject("Debe seleccionar el destino de la etapa y la fecha de llegada.");
    }
    this.validateRuta = function(data) {
        let ok = valid.reset().size("origen", data.origen) && valid.size("destino", data.destino);
        if (!Number.isNumber(data.lat1) || !Number.isNumber(data.lng1) || !data.pais1)
            return i18n.reject("Localización incorrecta para el origen de la etapa.");
        if (!Number.isNumber(data.lat2) || !Number.isNumber(data.lng2) || !data.pais2)
            return i18n.reject("Localización incorrecta para el destino de la etapa.");
        if (!data.desp || (data.desp < 1))
            return i18n.reject("Error al seleccionar el medio de transporte.");
        return ok && valid.isDateTime("f1", data.dt1) && valid.isDateTime("f2", data.dt2);
    }
    this.validateMun = function(data) {
        data.desp = data.despMun;
        data.f1 = data.f2 = data.f1Mun;
        data.origen = data.destino = data.origenMun;
        self.setData(data).setOrigenCT().setDestinoCT();
        let ok = valid.reset().size("origenMun", data.origenMun, "Debe seleccionar el lugar al que se dirigió"); // required string
        ok = valid.isDate("f1Mun", data.f1Mun) && ok;
        return ok || i18n.reject("errForm");
    }
}

export default new Ruta();
