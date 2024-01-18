
import Place from "./Place.js";
import i18n from "../../i18n/iris/langs.js";

const TSS = ":00"; // Seg.
const H24 = "00:00"; // 24H
const MS0 = ":00.0Z"; // Z = timezone
const CT_PAIS = "ES"; // ISO España
const CT_LAT = 37.62568269999999;
const CT_LNG = -0.9965839000000187;
const CT_NAME = "Cartagena, España";

function Ruta() {
	const self = this; //self instance
    const origen = new Place(); //source place
    const destino = new Place(); //destination
    let data;

    this.getData = () => data;
    this.setRuta = ruta => {
        data = ruta;
        return self;
    }
    this.setData = input => {
        self.setRuta(input);
        data.h1 = data.h1 || H24;
        data.h2 = data.h2 || H24;
		data.dt1 = data.dt1 || (data.f1 + "T" + data.h1 + MS0);
		data.dt2 = data.dt2 || (data.f2 + "T" + data.h2 + MS0);
        return self;
    }

	this.isPrincipal = data => (data.mask & 1);
	this.unlink = () => { delete data.g; return self; }
	this.isUnlinked = () => !data.g;
	this.isLinked = () => data.g;

    this.isSalidaTemprana = ruta => (ruta.dt1.getHours() < 14);
	this.isSalidaTardia = ruta => (ruta.dt1.getHours() > 21);
	this.isLlegadaTemprana = ruta => (ruta.dt2.getHours() < 14);
	this.isLlegadaTardia = ruta => (ruta.dt2.getHours() < 5);
	this.isLlegadaCena = ruta => (ruta.dt2.getHours() > 21);

    this.setMedioTransporte = tipo => { data.desp = tipo; return self; }
    this.isVehiculoPropio = () => (data.desp == 1);
	this.isVehiculoAlquiler = () => (data.desp == 4);
	this.isVehiculoAjeno = () => (data.desp == 5);
	this.isDespSinFactura = () => (self.isVehiculoPropio() || self.isVehiculoAjeno());
	this.isOtros = () => (data.desp == 9);

    this.getCT = () => CT_NAME;
    this.isCartagena = () => origen.isCartagena() && destino.isCartagena();
    this.getOrigen = () => origen;
    this.setPlace1 = (lat, lng, pais) => {
        data.lat1 = lat;
        data.lng1 = lng;
        data.pais1 = pais;
        return self;
    }
    this.setOrigen = place => {
        origen.setPlace(place);
        const loc = place.geometry.location;
        return self.setPlace1(loc.lat(), loc.lng(), origen.getContry());
    }
    this.setOrigenCT = () => self.setPlace1(CT_LAT, CT_LNG, CT_PAIS);

    this.getDestino = () => destino;
    this.setPlace2 = (lat, lng, pais) => {
        data.lat2 = lat;
        data.lng2 = lng;
        data.pais2 = pais;
        return self;
    }
    this.setDestino = place => {
        destino.setPlace(place);
        const loc = place.geometry.location;
        return self.setPlace2(loc.lat(), loc.lng(), destino.getContry());
    }
    this.setDestinoCT = () => self.setPlace2(CT_LAT, CT_LNG, CT_PAIS);
    this.nextPlace = () => {
        data.origen = data.destino;
        self.setPlace1(data.lat2, data.lng2, data.pais2);
        destino.setPlace(null);
        data.f1 = i18n.enDate(data.dt2);
        data.h1 = i18n.isoTimeShort(data.dt2);
        Object.clear(data, [ "dt1", "f2", "h2", "dt2", "destino", "desp" ]);
        return self.setPlace2();
    }

    this.format = (data, output) => {
        output.origen = data.origen;
        output.destino = data.destino;
        output.f1 = i18n.isoDate(data.f1 || data.dt1);
        output.h1 = data.h1 || i18n.isoTimeShort(data.dt1);
        output.f2 = i18n.isoDate(data.f2 || data.dt2);
        output.h2 = data.h2 || i18n.isoTimeShort(data.dt2);
        output.principal = self.isPrincipal(data) ? " (principal)" : ""; // mostrar en la vista
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
        let ok = i18n.reset().size("origen", data.origen) && i18n.size("destino", data.destino);
        if (!Number.isNumber(data.lat1) || !Number.isNumber(data.lng1) || !data.pais1)
            ok = !i18n.setInputError("origen", "errRequired", "Localización incorrecta para el origen de la etapa.");
        if (!Number.isNumber(data.lat2) || !Number.isNumber(data.lng2) || !data.pais2)
            ok = !i18n.setInputError("destino", "errRequired", "Localización incorrecta para el destino de la etapa.");
        if (!data.desp || (data.desp < 1))
            ok = !i18n.setInputError("desp", "errRequired", "Debe seleccionar un medio de transporte.");
        if (data.desp == 1)
            ok = i18n.size20("matricula", data.matricula) && ok;
        return i18n.isDateTime("f1", data.dt1) && i18n.isDateTime("f2", data.dt2) && ok;
    }
    this.validateMun = function(data) {
        data.f2 = data.f1;
        data.origen = data.destino;
        self.setData(data).setOrigenCT().setDestinoCT();
        return self.validate(data);
    }
    this.validateRuta = function(ruta) {
        ruta.dt1 = ruta.f1 + "T" + ruta.h1 + MS0;
        ruta.dt2 = ruta.f2 + "T" + ruta.h2 + MS0;
        Object.copy(ruta, data, [ "lat1", "lng1", "pais1" ]);

        let ok = self.validate(ruta);
        ok = i18n.isTime("h1", ruta.h1 + TSS) && ok;
        return i18n.isTime("h2", ruta.h2 + TSS) && ok;
    }
}

export default new Ruta();
