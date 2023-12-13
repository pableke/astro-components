
import i18n from "../../i18n/iris/langs.js";
import valid from "../../i18n/validators.js";

const TSS = ":00"; // Seg.
const H24 = "00:00"; // 24H
const MS0 = ":00.0Z"; // Z = timezone
const CT_PAIS = "ES"; // ISO España
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
		data.dt1 = data.dt1 || (data.f1 + "T" + data.h1 + MS0);
		data.dt2 = data.dt2 || (data.f2 + "T" + data.h2 + MS0);
        return self;
    }

	this.isSalidaTemprana = ruta => (ruta.dt1.getHours() < 14);
	this.isSalidaTardia = ruta => (ruta.dt1.getHours() > 21);
	this.isLlegadaTemprana = ruta => (ruta.dt2.getHours() < 14);
	this.isLlegadaTardia = ruta => (ruta.dt2.getHours() < 5);
	this.isLlegadaCena = ruta => (ruta.dt2.getHours() > 21);

    this.getCT = () => CT_NAME;
    this.getOrigen = () => origen;
    this.setPlace1 = (lat, lng, pais) => {
        data.lat1 = lat;
        data.lng1 = lng;
        data.pais1 = pais;
        return self;
    }
    this.setOrigen = (place, pais) => {
        origen = place;
        const loc = place.geometry.location;
        return self.setPlace1(loc.lat(), loc.lng(), pais);
    }
    this.setOrigenCT = () => self.setPlace1(CT_LAT, CT_LNG, CT_PAIS);

    this.getDestino = () => destino;
    this.setPlace2 = (lat, lng, pais) => {
        data.lat2 = lat;
        data.lng2 = lng;
        data.pais2 = pais;
        return self;
    }
    this.setDestino = (place, pais) => {
        destino = place;
        const loc = place.geometry.location;
        return self.setPlace2(loc.lat(), loc.lng(), pais);
    }
    this.setDestinoCT = () => self.setPlace2(CT_LAT, CT_LNG, CT_PAIS);

    this.setMedioTransporte = tipo => { data.desp = tipo; return self; }
    this.isVehiculoPropio = () => (data.desp == 1);
    this.nextPlace = () => {
        data.origen = data.destino;
        if (destino)
            self.setOrigen(destino, data.pais2);
        destino = null;
        data.f1 = i18n.enDate(data.dt2);
        data.h1 = i18n.isoTimeShort(data.dt2);
        Object.clear(data, [ "dt1", "f2", "h2", "dt2", "destino", "desp" ]);
        return self.setPlace2();
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

    this.validate = data => {
        let ok = valid.reset().size("origen", data.origen) && valid.size("destino", data.destino);
        if (!Number.isNumber(data.lat1) || !Number.isNumber(data.lng1) || !data.pais1)
            ok = !i18n.setInputError("origen", "errRequired", "Localización incorrecta para el origen de la etapa.");
        if (!Number.isNumber(data.lat2) || !Number.isNumber(data.lng2) || !data.pais2)
            ok = !i18n.setInputError("destino", "errRequired", "Localización incorrecta para el destino de la etapa.");
        if (!data.desp || (data.desp < 1))
            ok = !i18n.setInputError("desp", "errRequired", "Debe seleccionar un medio de transporte.");
        if (data.desp == 1)
            ok = valid.size20("matricula", data.matricula) && ok;
        return valid.isDateTime("f1", data.dt1) && valid.isDateTime("f2", data.dt2) && ok;
    }
    this.validateMun = function(data) {
        data.f2 = data.f1;
        data.origen = data.destino;
        self.setData(data).setOrigenCT().setDestinoCT();
        return self.validate(data);
    }
    this.validateRuta = function(ruta) {
        data.desp = ruta.desp;
        data.dt1 = ruta.f1 + "T" + ruta.h1 + MS0;
        data.dt2 = ruta.f2 + "T" + ruta.h2 + MS0;
        let ok = self.validate(data);
        ok = valid.isTime("h1", ruta.h1 + TSS) && ok;
        return valid.isTime("h2", ruta.h2 + TSS) && ok;
    }
}

export default new Ruta();
