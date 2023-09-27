
import i18n from "../i18n/langs.js";

HTMLCollection.prototype.find = Array.prototype.find;
HTMLCollection.prototype.forEach = Array.prototype.forEach;

export default function(alerts, opts) {
    opts = opts || {};
    opts.alertTextClass = opts.alertTextClass || "alert-text";
    opts.alertSuccessClass = opts.alertSuccessClass || "alert-text-success";
    opts.alertInfoClass = opts.alertInfoClass || "alert-text-info";
    opts.alertWarnClass = opts.alertWarnClass || "alert-text-warn";
    opts.alertErrorClass = opts.alertErrorClass || "alert-text-error";
    opts.alertCloseClass = opts.alertCloseClass || "alert-close";

	const self = this; //self instance
    const texts = alerts.getElementsByClassName(opts.alertTextClass);
    const close = alerts.getElementsByClassName(opts.alertCloseClass);

    const setAlert = (el, txt) => {
        el.parentNode.classList.remove("hide", "fadeOut");
        el.parentNode.classList.add("fadeIn");
        el.innerHTML = i18n.get(txt);
        return self;
    }
    const closeAlert = el => {
        el.parentNode.classList.remove("fadeIn");
        el.parentNode.classList.add("fadeOut");
        return self;
    }

    this.showOk = msg => setAlert(texts.find(opts.alertSuccessClass), msg); //green
    this.showInfo = msg => setAlert(texts.find(opts.alertInfoClass), msg); //blue
    this.showWarn = msg => setAlert(texts.find(opts.alertWarnClass), msg); //yellow
    this.showError = msg => setAlert(texts.find(opts.alertErrorClass), msg); //red
    this.showAlerts = function(msgs) { //show posible multiple messages types
        return msgs ? self.showOk(msgs.msgOk).showInfo(msgs.msgInfo).showWarn(msgs.msgWarn).showError(msgs.msgError) : self;
    }

    this.closeAlerts = function() {
        i18n.reset(); // Clear previos messages
        texts.each(closeAlert); // fadeOut all alerts
        return self;
    }

    // Show posible server messages and close click event
    texts.forEach(el => { el.firstChild && setAlert(el, el.firstChild.innerHTML); });
    close.forEach(el => el.addEventListener("click", ev => closeAlert(el)));
}
