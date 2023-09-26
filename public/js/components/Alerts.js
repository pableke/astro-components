
import i18n from "../i18n/langs.js";

HTMLCollection.prototype.forEach = Array.prototype.forEach;

export default function(alerts, opts) {
    opts = opts || {};
    opts.alertTextClass = opts.alertTextClass || "alert-text";
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

    this.showOk = msg => setAlert(texts[0], msg); //green
    this.showInfo = msg => setAlert(texts[1], msg); //blue
    this.showWarn = msg => setAlert(texts[2], msg); //yellow
    this.showError = msg => setAlert(texts[3], msg); //red
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
