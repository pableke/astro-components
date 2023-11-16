
//import Form from "../../components/Form.js";
import Table from "../../components/Table.js";
import tabs from "../../components/Tabs.js";
//import iris from "../../model/iris/Iris.js";
import ruta from "../../model/iris/Ruta.js";
//import MUNICIPIO from "../../data/iris/cartagena.js";

const CT_LAT = 37.62568269999999;
const CT_LNG = -0.9965839000000187;
const CT = { //default CT coords
    desp: 0, mask: 0, lat: CT_LAT, lng: CT_LNG, pais: "ES",
    origen: "Cartagena, España", lat1: CT_LAT, lng1: CT_LNG, pais1: "ES",
    destino: "Cartagena, España", lat2: CT_LAT, lng2: CT_LNG, pais2: "ES"
};
const OPTIONS = {
    fields: [ "address_component", "formatted_address", "geometry", "name" ],
    types: [ "geocode", "establishment" ],
    strictBounds: false
};

var p1, p2; // Places (origen, destino)
var formIris; // Global IRIS form
const tabRuta = tabs.getTab(4);
const tRutas = tabRuta.querySelector("#rutas-maps");
const rutas = new Table(tRutas, {
    msgEmptyTable: "No existen etapas asociadas a la comunicación.",
    beforeRender: resume => { resume.km2 = 0; },
    onRender: ruta.render,
    onFooter: ruta.resume,
    afterRender: resume => { }
});

tabs.setViewEvent(4, tab => formIris.autofocus());
tabs.setValidEvent(4, tab => {
    if (rutas.isEmpty())
        return !formIris.setError("#origen", "Debe detallar los conceptos asociados a la solicitud.");
    return true;
});

window.loadRutas = function(form, data) {
    formIris = form;
	rutas.render(data);
}

window.initMap = function() {
    const map = new google.maps.Map(document.getElementById("map"), { center: CT, zoom: 8, mapTypeId: "roadmap" });
    const origen = new google.maps.places.Autocomplete(document.getElementById("origen"), OPTIONS);
    const destino = new google.maps.places.Autocomplete(document.getElementById("destino"), OPTIONS);

    //Set the bounds to the map's viewport
    //origen.bindTo("bounds", map);
    //destino.bindTo("bounds", map);
    //map.data.addGeoJson(MUNICIPIO); //municipio de cartagena

    function setViewport(place, input) {
        // User entered the name of a Place that was not suggested
        if (!place.geometry || !place.geometry.location)
            return formIris.setError(input, "No details available for input: '" + place.name + "'");
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport)
            map.fitBounds(place.geometry.viewport)
        else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
    }

    // Get the place details from autocomplete to origen and destino
    origen.addListener("place_changed", function() { p1 = origen.getPlace(); setViewport(p1, this); });
    destino.addListener("place_changed", function() { p2 = destino.getPlace(); setViewport(p2, this); });
}

tabRuta.querySelector("#add-ruta").addEventListener("click", ev => {
    let loc1 = null; //source location
    function fnCountry(place) { //get the country place
        let component = place.address_components.find(address_component => (address_component.types.indexOf("country") > -1));
        return component && component.short_name;
    }

    if (!p1 && rutas.isEmpty()) { //primera ruta
        loc1 = new google.maps.LatLng(CT.lat1, CT.lng1);
        loc1.pais = CT.pais1;
    }
    else if (p1 && p1.geometry) { //ha seleccionado un origen?
        loc1 = p1.geometry.location;
        loc1.pais = fnCountry(p1);
    }
    else if (rutas.size()) { //origen=destino anterior?
        let last = rutas.getLastItem();
        loc1 = new google.maps.LatLng(last.lat2, last.lng2);
        loc1.pais = last.pais2;
    }
    formIris.isValid(ruta.validate);
    p1 = p2 = null;
});
