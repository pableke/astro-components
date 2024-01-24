
const CT_LAT = 37.62568269999999;
const CT_LNG = -0.9965839000000187;
const CARTAGENA = [ "Cartagena", "30200", "30201", "30202", "30203", "30204", "30205", "30280", "30290", "30300", "30310", "30319", "30330", "30350", "30351", "30353", "30365", "30366", "30367", "30368", "30369", "30370", "30380", "30381", "30382", "30383", "30384", "30385", "30386", "30387", "30390", "30391", "30392", "30393", "30394", "30395", "30396", "30397", "30398", "30399", "30593", "30594", "30835", "30868" ];
const CT = { //default CT coords
    desp: 0, mask: 4, lat: CT_LAT, lng: CT_LNG, pais: "ES",
    origen: "Cartagena, España", lat1: CT_LAT, lng1: CT_LNG, pais1: "ES",
    destino: "Cartagena, España", lat2: CT_LAT, lng2: CT_LNG, pais2: "ES"
};

//get address component from type
const fnGetComponent = (place, type) => place.address_components.find(ac => ac.types.includes(type));
const fnGetShortName = (place, type) => fnGetComponent(place, type)?.short_name;
const fnGetLongName = (place, type) => fnGetComponent(place, type)?.long_name;
//get postal code / locality short name from place (30XXX, Cartagena, Madrid,...)
const fnLocality = place => fnGetShortName(place, "postal_code") || fnGetShortName(place, "locality");

export default function() {
	const self = this; //self instance
    let place; // Google maps API place

    this.getData = () => place;
    this.getPlace = () => place;
    this.setPlace = data => { place = data; return self; }

    this.isCartagena = () => CARTAGENA.includes(fnLocality(place)); // Localidad de cartagena
    this.isMadrid = () => ("MD" == fnGetShortName(place, "administrative_area_level_1")); // CCAA de Madrid
    this.isBarcelona = () => ("B" == fnGetShortName(place, "administrative_area_level_2")); // Provincia de barcelona
    //get country short name from place (ES, EN, GB, IT,...)
    this.getContry = () => {
        const pais = fnGetShortName(place, "country");
        if ((pais == CT.pais) && self.isMadrid())
            return "ES-MD"; // Dieta para madrid comunidad
        if ((pais == CT.pais) && self.isBarcelona())
            return "ES-BA"; // dieta para barcelona provincia
        return pais; // codigo del pais
    }

    this.format = (place, output) => {
        output.dir = fnGetLongName(place, "route") || "-";
        output.cp = fnGetShortName(place, "postal_code") || "-";
        output.localidad = fnGetShortName(place, "locality") || "-";
        output.provincia = fnGetLongName(place, "administrative_area_level_2") + " (" + fnGetShortName(place, "administrative_area_level_2") + ")";
        output.ccaa = fnGetLongName(place, "administrative_area_level_1") + " (" + fnGetShortName(place, "administrative_area_level_1") + ")";
        output.pais = fnGetLongName(place, "country") + " (" + fnGetShortName(place, "country") + ")";
        return output;
    }

    this.validate = () => {
        let ok = i18n.reset() && place;
        return ok;
    }
}
