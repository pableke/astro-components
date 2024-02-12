
import alerts from "./Alerts.js";
import coll from "./Collection.js";

const fnTrue = () => true; // always true
const mask = (val, i) => ((val >> i) & 1); // check bit at i position
const FOCUSABLED = "[tabindex]:not([type=hidden],[readonly],[disabled])";

// Classes Configuration
const TAB_CLASS = "tab-content";
const ACTIVE_CLASS = "active";
const ACTION_CLASS = "tab-action";
const PROGRESS_BAR = "progress-bar";

function Tabs() {
	const self = this; //self instance
    const EVENTS = {}; //events tab container

	let tabs, progressbar;
    let _tabIndex, _tabSize, _tabMask;

    const fnSet = (name, fn) => { EVENTS[name] = fn; return self; }
    const fnActive = el => el.classList.contains(ACTIVE_CLASS);
    const fnFindIndex = id => tabs.findIndex(tab => (tab.id == ("tab-" + id))); //find index tab by id
    const fnCurrentIndex = () => tabs.findIndex(fnActive); //current index tab
    const autofocus = tab => {
        const el = tab.querySelectorAll(FOCUSABLED).find(el => el.isVisible());
        el && el.focus();
        return self;
    }
    const fnSetTab = (tab, index) => {
        tab.classList.add(ACTIVE_CLASS);
        _tabIndex = index ?? fnCurrentIndex();
        return autofocus(tab);
    }

    this.getCurrent = () => tabs[_tabIndex]; // current tab
    this.getTab = id => tabs.find(tab => (tab.id == ("tab-" + id))); // Find by id selector
    this.setMask = mask => { _tabMask = mask; return self; } // set mask for tabs
    this.setActive = id => fnSetTab(self.getTab(id)); // Force active class whithot events and alerts
    this.isActive = id => fnActive(self.getTab(id)); // is current tab active
	this.render = (selector, data) => { // HTMLElement.prototype.render is implemented in Collection
        tabs.forEach(tab => tab.querySelectorAll(selector).forEach(el => el.render(data)));
		return self;
	}

    // Set events on tabs actions
    const fnCallEvent = (name, tab) => {
        const fn = EVENTS[name + "-" + tab.id] || fnTrue;
        return fn(tab, self);
    }

    this.setInitEvent = (tab, fn) => fnSet("init-tab-" + tab, fn);
    this.setShowEvent = (tab, fn) => fnSet("show-tab-" + tab, fn);
    this.setViewEvent = (tab, fn) => fnSet("view-tab-" + tab, fn);
    this.setValidEvent = (tab, fn) => fnSet("valid-tab-" + tab, fn);
    this.isValid = () => fnCallEvent("valid", tabs[_tabIndex]); // is current tab valid

	// Alerts helpers
	this.showOk = msg => { alerts.showOk(msg); return self; } // Encapsule showOk message
	this.showInfo = msg => { alerts.showInfo(msg); return self; } // Encapsule showInfo message
	this.showWarn = msg => { alerts.showWarn(msg); return self; } // Encapsule showWarn message
	this.showError = msg => { alerts.showError(msg); return self; } // Encapsule showError message
	this.showAlerts = data => { alerts.showAlerts(data); return self; } // Encapsule showAlerts message

    function fnShowTab(i, updateBack) { //show tab by index
        i = (i < 0) ? 0 : Math.min(i, _tabSize);
        if (i == _tabIndex) // is current tab
            return self; // nothing to do
        const tab = tabs[i]; // get next tab
        const ok = (i < _tabIndex) || self.isValid(); // Event fired before leave current tab to next tab
        // If valid => Init event handler fire once and then Show event handler fire each access to tab
        if (ok && fnCallEvent("init", tab) && fnCallEvent("show", tab)) { // Validate change tab
            alerts.closeAlerts(); // Close all previous messages
            const step = "step-" + i; //go to a specific step on progressbar
            progressbar.forEach(bar => { // progressbar is optional
                bar.children.forEach(child => child.classList.toggle(ACTIVE_CLASS, child.id <= step));
            });
            tab.dataset.back = updateBack ? _tabIndex : tab.dataset.back; // Save source tab index
            tabs.forEach(tab => tab.classList.remove(ACTIVE_CLASS)); // update tabs style
            fnSetTab(tab, i); // set current tab
            fnCallEvent("view", tab); // Fire when show tab
        }
        delete EVENTS["init-" + tab.id];
        alerts.working().top(); // go up
        return self;
    }

    this.showTab = id => fnShowTab(fnFindIndex(id), true); //find by id selector
    this.backTab = () => fnShowTab(+tabs[_tabIndex].dataset.back, false); // Back to previous tab
    this.prevTab = () => self.backTab; // Synonym for back to previous tab
    this.lastTab = () => fnShowTab(_tabSize, true);
    this.nextTab = () => { // Ignore 0's mask tab
        for (var i = _tabIndex + 1; !mask(_tabMask, i) && (i < _tabSize); i++);
        return fnShowTab(i, true); // Show calculated next tab
    }

    this.setActions = el => {
        el.getElementsByClassName(ACTION_CLASS).forEach(link => {
            link.addEventListener("click", ev => { // Handle click event
                ev.preventDefault(); // avoid navigation
                const href = link.getAttribute("href");
                if ((href == "#back-tab") || (href == "#prev-tab"))
                    return self.backTab();
                if (href == "#next-tab")
                    return self.nextTab();
                if (href.startsWith("#tab-"))
                    return self.showTab(+href.match(/\d+$/).pop());
                if (href == "#last-tab")
                    return self.lastTab();
                if (href == "#toggle") {
                    const icon = link.querySelector(link.dataset.icon || "i"); // icon indicator
                    self.getCurrent().querySelectorAll(link.dataset.target).toggle(); // toggle info
                    coll.split(link.dataset.toggle, " ").forEach(name => icon.toggle(name));
                }
            });
        });
        return self;
    }
    this.load = el => {
        tabs = el.getElementsByClassName(TAB_CLASS);
        progressbar = el.getElementsByClassName(PROGRESS_BAR);
        _tabIndex = fnCurrentIndex(); // current index tab
        _tabSize = tabs.length - 1; // max tabs size
        return self.setMask(~0).setActions(el); // all 11111... + actions
    }

    // Init. view and PF navigation (only for CV-UAE)
    self.load(document);
    window.showTab = (xhr, status, args, tab) => {
        if (!xhr || (status != "success"))
            return !alerts.showError("Error 500: Internal server error.");
        if (!args) // Has server response?
            return self.showTab(tab); // Show tab and return true
        const msgs = coll.parse(args.msgs); // Parse server messages
        const ok = !msgs?.msgError; // is ok?
        if (ok && globalThis.isset(tab))
            self.showTab(tab); // Show tab if NO error
        alerts.showAlerts(msgs); // Always show alerts after change tab
        return ok;
    }
}

export default new Tabs();
