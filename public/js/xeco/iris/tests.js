
import dietas from "../../data/iris/dietas.js";

const CT_LAT = 37.62568269999999;
const CT_LNG = -0.9965839000000187;
const CT = { //default CT coords
    desp: 0, mask: 4, lat: CT_LAT, lng: CT_LNG, pais: "ES",
    origen: "Cartagena, España", lat1: CT_LAT, lng1: CT_LNG, pais1: "ES",
    destino: "Cartagena, España", lat2: CT_LAT, lng2: CT_LNG, pais2: "ES",
    lat: () => CT_LAT, lng: () => CT_LNG // google Lat/Lng Object Literal
};
const OPTIONS = {
    fields: [ "address_component", "formatted_address", "geometry", "name" ],
    types: [ "geocode", "establishment" ],
    strictBounds: false
};

const CARTAGENA = [ "Cartagena", "30200", "30201", "30202", "30203", "30204", "30205", "30280", "30290", "30300", "30310", "30319", "30330", "30350", "30351", "30353", "30365", "30366", "30367", "30368", "30369", "30370", "30380", "30381", "30382", "30383", "30384", "30385", "30386", "30387", "30390", "30391", "30392", "30393", "30394", "30395", "30396", "30397", "30398", "30399", "30593", "30594", "30835", "30868" ];
const MADRID = [ "Madrid", "28001", "28002", "28003", "28004", "28005", "28006", "28007", "28008", "28009", "28010", "28011", "28012", "28013", "28014", "28015", "28016", "28017", "28018", "28019", "28020", "28021", "28022", "28023", "28024", "28025", "28026", "28027", "28028", "28029", "28030", "28031", "28032", "28033", "28034", "28035", "28036", "28037", "28038", "28039", "28040", "28041", "28042", "28043", "28044", "28045", "28046", "28047", "28048", "28049", "28050", "28051", "28052", "28053", "28054", "28055" ];
const BARCELONA = [ "Barcelona", "08001", "08002", "08003", "08004", "08005", "08006", "08007", "08008", "08009", "08010", "08011", "08012", "08013", "08014", "08015", "08016", "08017", "08018", "08019", "08020", "08021", "08022", "08023", "08024", "08025", "08026", "08027", "08028", "08029", "08030", "08031", "08032", "08033", "08034", "08035", "08036", "08037", "08038", "08039", "08040", "08041", "08042" ];

function fnGetComponent(place, type) { //get short name from type address component
    const component = place.address_components.find(address => address.types.includes(type));
    return component && component.short_name;
}
//get postal code / locality short name from place (30XXX, Cartagena, Madrid,...)
const fnLocality = place => fnGetComponent(place, "postal_code") || fnGetComponent(place, "locality");
const fnCartagena = place => CARTAGENA.includes(fnLocality(place));
//get country short name from place (ES, EN, GB, IT,...)
const fnCountry = place => {
    const pais = fnGetComponent(place, "country");
    if ((pais == CT.pais) && MADRID.includes(fnLocality(place)))
        return "ES-MA"; // Dieta para madrid
    if ((pais == CT.pais) && BARCELONA.includes(fnLocality(place)))
        return "ES-BA"; // dieta para barcelona
    return pais; // codigo del pais
}

window.initMap = function() {
    const inputOrigen = document.getElementById("origen");
    const origen = new google.maps.places.Autocomplete(inputOrigen, OPTIONS);

    origen.addListener("place_changed", function() {
        const place = origen.getPlace();
        const dieta = dietas[fnCountry(place)] || dietas.ZZ;
        console.log("CT=" + fnCartagena(place), dieta, place);
    });
}

// Create the script tag, set the appropriate attributes
const script = document.createElement("script");
script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBIlqxZkVg9GyjzyNzC0rrZiuY6iPLzTZI&libraries=places&callback=initMap";
script.async = true; // Solicita al navegador que descargue y ejecute la secuencia de comandos de manera asíncrona, despues llamará a initMap
document.head.appendChild(script); // Append the "script" element to "head"
