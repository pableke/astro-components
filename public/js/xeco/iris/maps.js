
//import Form from "../../components/Form.js";
import Table from "../../components/Table.js";
import tabs from "../../components/Tabs.js";
//import iris from "../../model/iris/Iris.js";
import ruta from "../../model/iris/Ruta.js";
//import MUNICIPIO from "../../data/iris/cartagena.js";

const ADDRESS_COMPONENT = [ "Cartagena", "30393", "30394", "30395", "30396", "30397", "30398", "30399", "30593", "30594", "30835", "30868", "30201", "30202", "30203", "30204", "30205", "30300", "30310", "30319", "30330", "30350", "30351", "30365", "30366", "30367", "30368", "30369", "30370", "30380", "30381", "30382", "30383", "30384", "30385", "30387", "30389", "30390", "30391", "30392"];
const CT_LAT = 37.62568269999999;
const CT_LNG = -0.9965839000000187;
const CT = { //default CT coords, "desp: 0, mask: 0, lat: CT_LAT, lng: CT_LNG, pais: "ES",
    origen: "Cartagena, España", lat1: CT_LAT, lng1: CT_LNG, pais1: "ES",
    destino: "Cartagena, España", lat2: CT_LAT, lng2: CT_LNG, pais2: "ES"
};
const OPTIONS = {
    fields: [ "address_component", "formatted_address", "geometry", "name" ],
    types: [ "geocode", "establishment" ],
    strictBounds: false
};

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

tabs.setValidEvent(4, tab => {
    if (rutas.isEmpty())
        return !formIris.setError("#origen", "Debe detallar las etapas asociados a la solicitud.");
    formIris.setval("#rutas-maps", JSON.stringify(rutas.getData()));
    return true;
});

window.loadRutas = function(form, data) {
    formIris = form;
	rutas.render(data);
}

window.initMap = function() {
    const inputOrigen = document.getElementById("origen");
    const inputDestino = document.getElementById("destino");

    //const map = new google.maps.Map(document.getElementById("map"), { center: CT, zoom: 8, mapTypeId: "roadmap" });
    const origen = new google.maps.places.Autocomplete(inputOrigen, OPTIONS);
    const destino = new google.maps.places.Autocomplete(inputDestino, OPTIONS);
	const distance = new google.maps.DistanceMatrixService(); //Instantiate a distance matrix

    //Set the bounds to the map's viewport
    //origen.bindTo("bounds", map);
    //destino.bindTo("bounds", map);
    //map.data.addGeoJson(MUNICIPIO); //municipio de cartagena

    /*function setViewport(place, input) {
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
    }*/
    function fnGetComponent(place, type) { //get short name from type address component
        let component = place.address_components.find(address => address.types.includes(type));
        return component && component.short_name;
    }
    //get country short name from place (ES, EN, GB, IT,...)
    const fnCountry = place => fnGetComponent(place, "country");
    //get postal code / locality short name from place (30XXX, Cartagena, Murcia,...)
    const fnLocality = place => fnGetComponent(place, "postal_code") || fnGetComponent(place, "locality");

    var p1, p2; // Places (origen, destino)
    inputOrigen.value = rutas.size() ? rutas.getLastItem().destino : CT.origen; // Init origen
    tabRuta.querySelector("#add-ruta").addEventListener("click", ev => {
        const data = formIris.isValid(ruta.validate);
        if (!data || !p2)
            return;
        if (!p1 && rutas.isEmpty()) { //primera ruta
            inputOrigen.value = CT.origen;
            data.lat1 = CT.lat1;
            data.lng1 = CT.lng1;
            data.pais1 = CT.pais1;
        }
        else if (!p1)
            return formIris.setError(inputOrigen, "Debe seleccionar el origen de la ruta", "errRequired");
        else if (p1 && p1.geometry) { //ha seleccionado un origen?
            data.lat1 = p1.geometry.location.lat();
            data.lng1 = p1.geometry.location.lng();
            data.pais1 = fnCountry(p1);
        }

		data.dt1 = data.f1 + "T" + data.h1 + ":00.0";
		data.dt2 = data.f2 + "T" + data.h2 + ":00.0";
        data.mask = (ADDRESS_COMPONENT.includes(fnLocality(p1)) && ADDRESS_COMPONENT.includes(fnLocality(p2))) ? 4 : 0
        data.lat2 = p2.geometry.location.lat();
        data.lng2 = p2.geometry.location.lng();
        data.pais2 = fnCountry(p2);
console.log(data, p1, p2);

        if (data.desp == "1") //calculate distance
            distance.getDistanceMatrix({
                origins: [inputOrigen.value],
                destinations: [inputDestino.value],
                travelMode: "DRIVING"
            }, function(res, status) {
                if (status !== "OK")
                    return formIris.setError("#origen", "The calculated distance fails due to " + status);
                const origins = res.originAddresses;
                //const destinations = res.destinationAddresses;
                for (let i = 0; i < origins.length; i++) {
                    let results = res.rows[i].elements;
                    for (let j = 0; j < results.length; j++) {
                        const element = results[j];
                        data.km2 = element.distance.value/1000; //to km
                    }
                }
                rutas.add(data);
            });
        else
            rutas.add(data);

        // Reinit form
        p1 = p2; // reinit places
        p2 = null;
        inputOrigen.value = inputDestino.value; //origen = destino anterior
        inputDestino.value = null;
        formIris.copy("#f1", "#f2").setval("#f2").copy("#h1", "#h2").setval("#h2");
        inputDestino.focus();
    });

    // Get the place details from autocomplete to origen and destino
    origen.addListener("place_changed", function() { p1 = origen.getPlace(); /*setViewport(p1, this);*/ });
    destino.addListener("place_changed", function() { p2 = destino.getPlace(); /*setViewport(p2, this);*/ });
}
