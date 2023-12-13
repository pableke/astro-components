
import tabs from "../../components/Tabs.js";
import iris from "../../model/iris/Iris.js";
import itinerario from "../../model/iris/Rutas.js";
//import MUNICIPIO from "../../data/iris/cartagena.js";
//import i18n from "../../i18n/iris/langs.js";

const ADDRESS_COMPONENT = [ "Cartagena", "30393", "30394", "30395", "30396", "30397", "30398", "30399", "30593", "30594", "30835", "30868", "30201", "30202", "30203", "30204", "30205", "30300", "30310", "30319", "30330", "30350", "30351", "30365", "30366", "30367", "30368", "30369", "30370", "30380", "30381", "30382", "30383", "30384", "30385", "30387", "30389", "30390", "30391", "30392"];
const OPTIONS = {
    fields: [ "address_component", "formatted_address", "geometry", "name" ],
    types: [ "geocode", "establishment" ],
    strictBounds: false
};

const tabRuta = tabs.getTab(4);
const perfil = iris.getPerfil();
const ruta = itinerario.getRuta();
const inputOrigen = document.getElementById("origen");
const inputDestino = document.getElementById("destino");
var formIris, rutas; // Global IRIS form

tabs.setValidEvent(4, () => formIris.isValid(iris.validateRutas));
tabs.setValidEvent(3, () => {
    if (perfil.isMUN()) {
        const data = formIris.isValid(ruta.validateMun, ".ui-mun");
        data && rutas.render([data]); //afterRender event save json
        return formIris.isValid(iris.validateRutas);
    }
    return formIris.isValid(iris.validate);
});

window.loadRutas = function(form, data) {
    formIris = form;
    rutas = rutas || formIris.setTable("#rutas-maps", {
        msgEmptyTable: "No existen etapas asociadas a la comunicación.",
        beforeRender: resume => { resume.km2 = 0; },
        onRender: ruta.render,
        onFooter: ruta.resume,
        afterRender: resume => formIris.stringify("#rutas-json", rutas)
    });
	rutas.render(data);
    itinerario.setData(rutas);
    if (rutas.size()) {
        const last = rutas.getLastItem();
        const selector = perfil.isMUN() ? ".grupo-matricula-mun" : ".grupo-matricula-maps";
        formIris.setValues(ruta.setData(Object.clone(last)).nextPlace().getData(), ".ui-ruta")
                .setValues(last, ".ui-mun").toggle(selector, last.desp == 1);
    }
    else {
        formIris.clear(".ui-mun").show(".grupo-matricula-mun")
                .clear(".ui-ruta").hide(".grupo-matricula-maps");
        inputOrigen.value = ruta.setData({}).setOrigenCT().getCT();
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

    function fnGetComponent(place, type) { //get short name from type address component
        let component = place.address_components.find(address => address.types.includes(type));
        return component && component.short_name;
    }
    //get country short name from place (ES, EN, GB, IT,...)
    const fnCountry = place => fnGetComponent(place, "country");
    //get postal code / locality short name from place (30XXX, Cartagena, Murcia,...)
    const fnLocality = place => fnGetComponent(place, "postal_code") || fnGetComponent(place, "locality");

    tabRuta.querySelector("[href='#add-ruta']").addEventListener("click", ev => {
        const data = formIris.isValid(ruta.validateRuta, ".ui-ruta");
        if (!data)
            return;
        const loc1 = fnLocality(ruta.getOrigen());
        const loc2 = fnLocality(ruta.getDestino());
        data.mask = (ADDRESS_COMPONENT.includes(loc1) && ADDRESS_COMPONENT.includes(loc2)) ? 4 : 0;

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
                        data.imp = data.km2 * .26; //imp gasolina
                    }
                }
                rutas.add(data);
            });
        else
            rutas.add(data);

        // Re-init form
        formIris.setValues(ruta.nextPlace().getData(), ".ui-ruta");
        inputDestino.focus();
    });

    // Get the place details from autocomplete to origen and destino
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
    origen.addListener("place_changed", function() {
        const place = origen.getPlace();
        /*setViewport(place, this);*/
        ruta.setOrigen(place, fnCountry(place));
    });
    destino.addListener("place_changed", function() {
        const place = destino.getPlace();
        /*setViewport(place, this);*/
        ruta.setDestino(place, fnCountry(place));
    });
}
