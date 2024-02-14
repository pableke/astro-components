
import alerts from "./Alerts.js";

function Api() {
    this.json = async (url, opts) => {
        alerts.loading(); // show loading indicator
        const res = await globalThis.fetch(url, opts); // send api call
        const promise = res.ok ? res.json() : Promise.reject(res.statusText);
        // Add default catch and finally functions to promise
        return promise.catch(alerts.showError).finally(alerts.working);
    }
    this.text = async (url, opts) => {
        alerts.loading(); // show loading indicator
        const res = await globalThis.fetch(url, opts); // send api call
        const promise = res.ok ? res.text() : Promise.reject(res.statusText);
        // Add default catch and finally functions to promise
        return promise.catch(alerts.showError).finally(alerts.working);
    }

    this.send = async (url, opts) => {
        alerts.loading(); // show loading indicator
        const res = await globalThis.fetch(url, opts); // send api call
		const type = res.headers.get("content-type") || ""; // get response mime type
		const data = await (type.includes("application/json") ? res.json() : res.text());
        const promise = res.ok ? Promise.resolve(data) : Promise.reject(data || res.statusText);
        return promise.finally(alerts.working);
    }
}

export default new Api();
