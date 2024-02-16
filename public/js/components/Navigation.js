
import api from "./Api.js";
import tabs from "./Tabs.js";

function Navigation() {
	const self = this; //self instance
    const main = document.body.children.findOne("main");

    this.setMain = data => {
        main.innerHTML = data; // update contents
        document.documentElement.scrollTop = 0; // scroll to top
        tabs.load(main); // reload tabs events
        return self;
    }
    this.addListener = (name, fn) => {
        if (window.location.pathname == name)
            document.addEventListener("DOMContentLoaded", fn);
        document.addEventListener("vt:" + name, fn);
        //console.log(window.location.pathname, name, "vt:" + name);
        return self;
    }

    // cargamos la pagina de destino con fetch
    const fetchMain = url => {
        api.text(url.pathname).then(text => {
            // utilizamos la api de View Transitions
            document.startViewTransition(() => {
                // extraigo el contenido de la etiqueta main
                self.setMain(text.match(/<main[^>]*>([\s\S]*)<\/main>/im)[1]);
                document.dispatchEvent(new Event("vt:" + url.pathname)); // Dispatch vt event
                //console.log("Event name =", "vt:" + url.pathname); // specific name event
            });
        });
    }

    // Check to see if API is supported
    if (document.startViewTransition) {
        // capture navigation event links
        window.navigation.addEventListener("navigate", ev => {
            const url = new URL(ev.destination.url);
            if (location.pathname == url.pathname)
                return ev.preventDefault(); // Current destination
            // Si es una pagina externa => ignoramos el evento
            if (location.origin == url.origin) {
                // Navegación en el mismo dominio (origin)
                const handler = () => fetchMain(url);
                ev.intercept({ handler }); // intercept event
            }
            //console.log(url, ev);
        });
    }
}

export default new Navigation();
