
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

    const closeAlert = el => {
        el.classList.remove(opts.showInClass);
        el.classList.add(opts.hideOutClass);
        return self;
    }
    const closeAlertFromChild = el => closeAlert(el.parentNode);
    const setAlert = (el, txt) => {
        if (txt) { // Message exists
            el.parentNode.eachSibling(closeAlert); // close previous alerts
            el.parentNode.classList.remove(opts.hideClass, opts.hideOutClass);
            el.parentNode.classList.add(opts.showInClass);
            el.innerHTML = i18n.get(txt);
        }
        return self;
    }

    const fnGetType = type => texts.find(el => el.parentNode.classList.contains(type));
    this.showOk = msg => setAlert(fnGetType(opts.typeOkClass), msg); //green
    this.showInfo = msg => setAlert(fnGetType(opts.typeInfoClass), msg); //blue
    this.showWarn = msg => setAlert(fnGetType(opts.typeWarnClass), msg); //yellow
    this.showError = msg => setAlert(fnGetType(opts.typeErrorClass), msg); //red
    this.showAlerts = function(msgs) { //show posible multiple messages types
        return msgs ? self.showOk(msgs.msgOk).showInfo(msgs.msgInfo).showWarn(msgs.msgWarn).showError(msgs.msgError) : self;
    }

    this.closeAlerts = function() {
        i18n.reset(); // Clear previos messages
        texts.forEach(closeAlertFromChild); // fadeOut all alerts
        return self;
    }

    // Show posible server messages and close click event
    texts.forEach(el => setAlert(el, el.innerHTML));
    close.forEach(el => el.addEventListener("click", ev => closeAlertFromChild(el)));
}

// Global singleton instance
const alerts = new Alerts();
globalThis.alerts = alerts;
export default alerts;
