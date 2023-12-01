
import tabs from "../../components/Tabs.js";
import iris from "../../model/iris/Iris.js";
import itinerario from "../../model/iris/Rutas.js";
//import MUNICIPIO from "../../data/iris/cartagena.js";

const ADDRESS_COMPONENT = [ "Cartagena", "30393", "30394", "30395", "30396", "30397", "30398", "30399", "30593", "30594", "30835", "30868", "30201", "30202", "30203", "30204", "30205", "30300", "30310", "30319", "30330", "30350", "30351", "30365", "30366", "30367", "30368", "30369", "30370", "30380", "30381", "30382", "30383", "30384", "30385", "30387", "30389", "30390", "30391", "30392"];
const OPTIONS = {
    fields: [ "address_component", "formatted_address", "geometry", "name" ],
    types: [ "geocode", "establishment" ],
    strictBounds: false
};

const tabRuta = tabs.getTab(4);
const ruta = itinerario.getRuta();
const inputOrigen = document.getElementById("origen");
const inputDestino = document.getElementById("destino");
var formIris, rutas; // Global IRIS form

const fnEnd = ok => ok ? formIris.stringify("#rutas-json", rutas) : !formIris.setErrors();
window.fnSave = () => {
    const perfil = iris.getPerfil();
    const data = formIris.isValid(iris.validate);
    if (!data)
        return false;
    if (perfil.isMUN())
        return fnEnd(ruta.validateMun(data) && rutas.add(data));
    if (tabs.isActive(4) && perfil.isCOM())
        return fnEnd(itinerario.validate());
    return true;
}
tabs.setValidEvent(3, window.fnSave).setValidEvent(4, window.fnSave);

window.loadRutas = function(form, data) {
    formIris = form;
    rutas = rutas || formIris.setTable("#rutas-maps", itinerario.render());
    itinerario.setData(data);
	rutas.render(data);
    if (rutas.size()) {
        const last = itinerario.getLast();
        inputOrigen.value = last.destino; // Init origen
        formIris.setval("#f1", i18n.enDate(last.dt2)).setval("#h1", i18n.enDate(last.dt2));
    }
    else {
        inputOrigen.value = ruta.getCT();
        formIris.clear(".ui-mun");
    }
}

window.initMap = function() {
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

    tabRuta.querySelector("#add-ruta").addEventListener("click", ev => {
        const data = formIris.isValid(ruta.validate);
        if (!data)
            return;
        const p1 = ruta.setData(data).getOrigen();
        if (!p1 && rutas.isEmpty()) //primera ruta
            inputOrigen.value = ruta.setOrigenCT().getCT();
        else if (!p1)
            return formIris.setError(inputOrigen, "Debe seleccionar el origen de la ruta", "errRequired");
        else if (p1 && p1.geometry) //ha seleccionado un origen?
            ruta.setPlace1(p1.geometry.location.lat(), p1.geometry.location.lng(), fnCountry(p1));

        const p2 = ruta.getDestino();
        data.mask = (ADDRESS_COMPONENT.includes(fnLocality(p1)) && ADDRESS_COMPONENT.includes(fnLocality(p2))) ? 4 : 0;
        ruta.setPlace2(p2.geometry.location.lat(), p2.geometry.location.lng(), fnCountry(p2));

        if (ruta.isVehiculoPropio()) //calculate distance
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

        // Re-init form
        ruta.nextPlace(); // re-init places
        inputOrigen.value = inputDestino.value; //origen = destino anterior
        inputDestino.value = null;
        formIris.copy("#f1", "#f2").setval("#f2").copy("#h1", "#h2").setval("#h2");
        inputDestino.focus();
    });

    // Get the place details from autocomplete to origen and destino
    origen.addListener("place_changed", function() { ruta.setOrigen(origen.getPlace()); /*setViewport(p1, this);*/ });
    destino.addListener("place_changed", function() { ruta.setDestino(destino.getPlace()); /*setViewport(p2, this);*/ });
}
