
const CT_LAT = 37.62568269999999;
const CT_LNG = -0.9965839000000187;
const CT = { //default CT coords
    desp: 0, mask: 4, lat: CT_LAT, lng: CT_LNG, pais: "ES",
    origen: "Cartagena, España", lat1: CT_LAT, lng1: CT_LNG, pais1: "ES",
    destino: "Cartagena, España", lat2: CT_LAT, lng2: CT_LNG, pais2: "ES",
    lat: () => CT_LAT, lng: () => CT_LNG // google Lat/Lng Object Literal
};

const MADRID = [ "Madrid", "28001", "28002", "28003", "28004", "28005", "28006", "28007", "28008", "28009", "28010", "28011", "28012", "28013", "28014", "28015", "28016", "28017", "28018", "28019", "28020", "28021", "28022", "28023", "28024", "28025", "28026", "28027", "28028", "28029", "28030", "28031", "28032", "28033", "28034", "28035", "28036", "28037", "28038", "28039", "28040", "28041", "28042", "28043", "28044", "28045", "28046", "28047", "28048", "28049", "28050", "28051", "28052", "28053", "28054", "28055" ];
const CARTAGENA = [ "Cartagena", "30200", "30201", "30202", "30203", "30204", "30205", "30280", "30290", "30300", "30310", "30319", "30330", "30350", "30351", "30353", "30365", "30366", "30367", "30368", "30369", "30370", "30380", "30381", "30382", "30383", "30384", "30385", "30386", "30387", "30390", "30391", "30392", "30393", "30394", "30395", "30396", "30397", "30398", "30399", "30593", "30594", "30835", "30868" ];
const BARCELONA = [ "Barcelona", "08001", "08002", "08003", "08004", "08005", "08006", "08007", "08008", "08009", "08010", "08011", "08012", "08013", "08014", "08015", "08016", "08017", "08018", "08019", "08020", "08021", "08022", "08023", "08024", "08025", "08026", "08027", "08028", "08029", "08030", "08031", "08032", "08033", "08034", "08035", "08036", "08037", "08038", "08039", "08040", "08041", "08042" ];

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

    //get country short name from place (ES, EN, GB, IT,...)
    this.getContry = () => {
        const pais = fnGetShortName(place, "country");
        if ((pais == CT.pais) && MADRID.includes(fnLocality(place)))
            return "ES-MA"; // Dieta para madrid
        if ((pais == CT.pais) && BARCELONA.includes(fnLocality(place)))
            return "ES-BA"; // dieta para barcelona
        return pais; // codigo del pais
    }

    this.isMadrid = () => MADRID.includes(fnLocality(place));
    this.isCartagena = () => CARTAGENA.includes(fnLocality(place));
    this.isBarcelona = () => BARCELONA.includes(fnLocality(place));

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
