
import i18n from "../i18n/langs.js";

HTMLCollection.prototype.find = Array.prototype.find;
HTMLCollection.prototype.forEach = Array.prototype.forEach;

HTMLElement.prototype.eachPrev = function(fn) {
    var el = this.previousElementSibling;
    for (let i = 0; el; el = el.previousElementSibling)
        fn(el, i++);
    return this;
}
HTMLElement.prototype.eachNext = function(fn) {
    var el = this.nextElementSibling;
    for (let i = 0; el; el = el.nextElementSibling)
        fn(el, i++);
    return this;
}
HTMLElement.prototype.eachSibling = function(fn) {
    return this.eachPrev(fn).eachNext(fn);
}

const opts = { // Configuration
    alertsSelector: ".alerts",
    hideClass: "hide",
    showInClass: "fadeIn",
    hideOutClass: "fadeOut",
    typeOkClass: "alert-success",
    typeInfoClass: "alert-info",
    typeWarnClass: "alert-warn",
    typeErrorClass: "alert-error",
    alertTextClass: "alert-text",
    alertCloseClass: "alert-close"
};

function Alerts() {
	const self = this; //self instance
    const alerts = document.querySelector(opts.alertsSelector);
    const texts = alerts.getElementsByClassName(opts.alertTextClass);
    const close = alerts.getElementsByClassName(opts.alertCloseClass);

    const fnShow = (el, txt) => {
        el.parentNode.classList.remove(opts.hideClass, opts.hideOutClass);
        el.parentNode.classList.add(opts.showInClass);
        el.innerHTML = i18n.get(txt);
        return self;
    }
    const fnClose = el => {
        el.classList.remove(opts.showInClass);
        el.classList.add(opts.hideOutClass);
        return self;
    }
    const fnCloseFromChild = el => fnClose(el.parentNode);
    const setAlert = (el, txt) => {
        if (txt) { // Message exists
            el.parentNode.eachSibling(fnClose); // close previous alerts
            return fnShow(el, txt); // show specific alert typw
        }
        return self;
    }

    const fnGetType = type => texts.find(el => el.parentNode.classList.contains(type));
    this.showOk = msg => setAlert(fnGetType(opts.typeOkClass), msg); //green
    this.showInfo = msg => setAlert(fnGetType(opts.typeInfoClass), msg); //blue
    this.showWarn = msg => setAlert(fnGetType(opts.typeWarnClass), msg); //yellow
    this.showError = msg => setAlert(fnGetType(opts.typeErrorClass), msg); //red
    this.showAlerts = function(msgs) { //show posible multiple messages types
        if (msgs) {
            msgs.msgOk && fnShow(fnGetType(opts.typeOkClass), msgs.msgOk);
            msgs.msgInfo && fnShow(fnGetType(opts.typeInfoClass), msgs.msgInfo);
            msgs.msgWarn && fnShow(fnGetType(opts.typeWarnClass), msgs.msgWarn);
            msgs.msgError && fnShow(fnGetType(opts.typeErrorClass), msgs.msgError);
        }
        return self;
    }

    this.closeAlerts = function() {
        i18n.reset(); // Clear previos messages
        texts.forEach(fnCloseFromChild); // fadeOut all alerts
        return self;
    }

    // Show posible server messages and close click event
    texts.forEach(el => setAlert(el, el.innerHTML));
    close.forEach(el => el.addEventListener("click", ev => fnCloseFromChild(el)));
}

// Global singleton instance
const alerts = new Alerts();
globalThis.alerts = alerts; // Global reference
globalThis.showAlerts = (xhr, status, args) => alerts.showAlerts(JSON.read(args?.data)); // Hack PF (only for CV-UAE)
export default alerts;
