
import coll from "./Collection.js";
import i18n from "../i18n/langs.js";

HTMLElement.prototype.eachPrev = function(fn) {
    var el = this.previousElementSibling;
    for (let i = 0; el; el = el.previousElementSibling)
        fn(el, i++);
    return this;
}
HTMLElement.prototype.prev = function(selector) {
    var el = this.previousElementSibling;
    while (el) {
        if (el.matches(selector))
            return el;
        el = el.previousElementSibling;
    }
    return null;
}
HTMLElement.prototype.eachNext = function(fn) {
    var el = this.nextElementSibling;
    for (let i = 0; el; el = el.nextElementSibling)
        fn(el, i++);
    return this;
}
HTMLElement.prototype.next = function(selector) {
    var el = this.nextElementSibling;
    while (el) {
        if (el.matches(selector))
            return el;
        el = el.nextElementSibling;
    }
    return null;
}
HTMLElement.prototype.eachSibling = function(fn) {
    return this.eachPrev(fn).eachNext(fn);
}
HTMLElement.prototype.sibling = function(selector) {
    return this.prev(selector) || this.next(selector);
}

// Classes Configuration
const ALERTS_CLASS = "alerts";
const TYPE_OK = "alert-success";
const TYPE_INFO = "alert-info";
const TYPE_WARN = "alert-warn";
const TYPE_ERROR = "alert-error";
const ALERT_TEXT = "alert-text";
const ALERT_CLOSE = "alert-close";

function Alerts() {
	const self = this; //self instance
    const alerts = document.querySelector("." + ALERTS_CLASS);
    const texts = alerts.getElementsByClassName(ALERT_TEXT);
    const close = alerts.getElementsByClassName(ALERT_CLOSE);

	// Handle loading div
    const _loading = alerts.nextElementSibling; // loading animation = none
	this.loading = () => { _loading.classList.remove("hide", "fadeOut"); return self.closeAlerts(); }
	this.working = () => { _loading.fadeOut(); return self; } // working animation = fadeOut

    // Scroll body to top on click and toggle back-to-top arrow
	const _top = _loading.nextElementSibling;
    this.top = () => { document.body.scrollIntoView({ behavior: "smooth" }); return self; }
	this.redir = (url, target) => { url && window.open(url, target || "_blank"); return self; };
	window.onscroll = function() { _top.toggle(null, this.scrollY < 80); }
	_top.addEventListener("click", self.top);

    const fnShow = (el, txt) => {
        el.innerHTML = i18n.get(txt);
        el.parentNode.fadeIn();
        return self;
    }
    const fnClose = el => el.fadeOut();
    const fnCloseParent = el => fnClose(el.parentNode);
    const setAlert = (el, txt) => {
        if (txt) { // Message exists
            el.parentNode.eachSibling(fnClose); // close previous alerts
            return fnShow(el, txt); // show specific alert typw
        }
        return self;
    }

    const fnGetType = type => texts.find(el => el.parentNode.classList.contains(type));
    this.showOk = msg => setAlert(fnGetType(TYPE_OK), msg); //green
    this.showInfo = msg => setAlert(fnGetType(TYPE_INFO), msg); //blue
    this.showWarn = msg => setAlert(fnGetType(TYPE_WARN), msg); //yellow
    this.showError = msg => setAlert(fnGetType(TYPE_ERROR), msg); //red
    this.showAlerts = function(msgs) { //show posible multiple messages types
        if (msgs) {
            msgs.msgOk && fnShow(fnGetType(TYPE_OK), msgs.msgOk);
            msgs.msgInfo && fnShow(fnGetType(TYPE_INFO), msgs.msgInfo);
            msgs.msgWarn && fnShow(fnGetType(TYPE_WARN), msgs.msgWarn);
            msgs.msgError && fnShow(fnGetType(TYPE_ERROR), msgs.msgError);
        }
        return self.working();
    }

    this.closeAlerts = function() {
        i18n.reset(); // Clear previos messages
        texts.forEach(fnCloseParent); // fadeOut all alerts
        return self;
    }

    // Show posible server messages and close click event
    texts.forEach(el => { el.innerHTML && fnShow(el, el.innerHTML); });
    close.forEach(el => el.addEventListener("click", ev => fnCloseParent(el)));

    // Global singleton instance
    window.loading = self.loading;
    window.working = self.working;
    window.showAlerts = (xhr, status, args) => self.showAlerts(coll.parse(args?.msgs)); // Hack PF (only for CV-UAE)
}

export default new Alerts();
