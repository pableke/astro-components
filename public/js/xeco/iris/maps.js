
import tabs from "../../components/Tabs.js";
import iris from "../../model/iris/Iris.js";
//import MUNICIPIO from "../../data/iris/cartagena.js";
//import i18n from "../../i18n/iris/langs.js";

const OPTIONS = {
    fields: [ "address_component", "formatted_address", "geometry", "name" ],
    types: [ "geocode", "establishment" ],
    strictBounds: false
};

const tabRuta = tabs.getTab(4);
const perfil = iris.getPerfil();
const itinerario = iris.getRutas();
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

window.initMap = function() {
	const distance = new google.maps.DistanceMatrixService(); //Instantiate a distance matrix
    const origen = new google.maps.places.Autocomplete(inputOrigen, OPTIONS); // Search source
    const destino = new google.maps.places.Autocomplete(inputDestino, OPTIONS); // Search destination

    // Set the bounds to the map's viewport
    //const map = new google.maps.Map(document.getElementById("map"), { center: CT, zoom: 8, mapTypeId: "roadmap" });
    //map.data.addGeoJson(MUNICIPIO); //municipio de cartagena
    //origen.bindTo("bounds", map);
    //destino.bindTo("bounds", map);

    tabRuta.querySelector("[href='#add-ruta']").addEventListener("click", ev => {
        const data = formIris.isValid(ruta.validateRuta, ".ui-ruta");
        if (!data)
            return;
        data.mask = ruta.isCartagena() ? 4 : 0;

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
        formIris.setData(ruta.nextPlace().getData(), ".ui-ruta");
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
        //setViewport(place, this);
        ruta.setOrigen(place);
    });
    destino.addListener("place_changed", function() {
        const place = destino.getPlace();
        //setViewport(place, this);
        ruta.setDestino(place);
    });
}

// Create the script tag, set the appropriate attributes
const script = document.createElement("script");
script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBIlqxZkVg9GyjzyNzC0rrZiuY6iPLzTZI&libraries=places&callback=initMap";
script.async = true; // Solicita al navegador que descargue y ejecute la secuencia de comandos de manera asíncrona, despues llamará a initMap
document.head.appendChild(script); // Append the "script" element to "head"

export default function(form, data) {
    formIris = form;
    rutas = rutas || formIris.setTable("#rutas-maps", {
        msgEmptyTable: "No existen etapas asociadas a la comunicación.",
        beforeRender: resume => { resume.km2 = 0; },
        onRender: ruta.render,
        onFooter: ruta.resume,
        afterRender: resume => formIris.saveTable("#rutas-json", rutas)
    });
	rutas.render(data);
    if (rutas.size()) {
        const last = rutas.getLastItem();
        const selector = perfil.isMUN() ? ".grupo-matricula-mun" : ".grupo-matricula-maps";
        formIris.setData(ruta.setData(Object.clone(last)).nextPlace().getData(), ".ui-ruta")
                .setData(last, ".ui-mun").toggle(selector, last.desp == 1);
    }
    else {
        formIris.reset(".ui-mun").show(".grupo-matricula-mun")
                .reset(".ui-ruta").hide(".grupo-matricula-maps");
        inputOrigen.value = ruta.setData({}).setOrigenCT().getCT();
    }
    const rutasOut = itinerario.setData(rutas).getRutasOut();
    formIris.toggle(".rutas-out", rutasOut.length);
}
