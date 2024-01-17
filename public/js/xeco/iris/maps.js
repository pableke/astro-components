
import tabs from "../../components/Tabs.js";
import iris from "../../model/iris/Iris.js";
//import MUNICIPIO from "../../data/iris/cartagena.js";
//import i18n from "../../i18n/iris/langs.js";

const CARTAGENA = [ "Cartagena", "30200", "30201", "30202", "30203", "30204", "30205", "30280", "30290", "30300", "30310", "30319", "30330", "30350", "30351", "30353", "30365", "30366", "30367", "30368", "30369", "30370", "30380", "30381", "30382", "30383", "30384", "30385", "30386", "30387", "30390", "30391", "30392", "30393", "30394", "30395", "30396", "30397", "30398", "30399", "30593", "30594", "30835", "30868" ];
//const MADRID = [ "Madrid", "28001", "28002", "28003", "28004", "28005", "28006", "28007", "28008", "28009", "28010", "28011", "28012", "28013", "28014", "28015", "28016", "28017", "28018", "28019", "28020", "28021", "28022", "28023", "28024", "28025", "28026", "28027", "28028", "28029", "28030", "28031", "28032", "28033", "28034", "28035", "28036", "28037", "28038", "28039", "28040", "28041", "28042", "28043", "28044", "28045", "28046", "28047", "28048", "28049", "28050", "28051", "28052", "28053", "28054", "28055" ];
//const BARCELONA = [ "Barcelona", "08001", "08002", "08003", "08004", "08005", "08006", "08007", "08008", "08009", "08010", "08011", "08012", "08013", "08014", "08015", "08016", "08017", "08018", "08019", "08020", "08021", "08022", "08023", "08024", "08025", "08026", "08027", "08028", "08029", "08030", "08031", "08032", "08033", "08034", "08035", "08036", "08037", "08038", "08039", "08040", "08041", "08042" ];
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

function fnGetComponent(place, type) { //get short name from type address component
    let component = place.address_components.find(address => address.types.includes(type));
    return component && component.short_name;
}
//get country short name from place (ES, EN, GB, IT,...)
const fnCountry = place => fnGetComponent(place, "country");
//get postal code / locality short name from place (30XXX, Cartagena, Murcia,...)
const fnLocality = place => fnGetComponent(place, "postal_code") || fnGetComponent(place, "locality");

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
        const loc1 = fnLocality(ruta.getOrigen());
        const loc2 = fnLocality(ruta.getDestino());
        data.mask = (CARTAGENA.includes(loc1) && CARTAGENA.includes(loc2)) ? 4 : 0;
//console.log(ruta.getOrigen(), ruta.getDestino());

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
        ruta.setOrigen(place, fnCountry(place));
        //setViewport(place, this);
    });
    destino.addListener("place_changed", function() {
        const place = destino.getPlace();
        ruta.setDestino(place, fnCountry(place));
        //setViewport(place, this);
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
