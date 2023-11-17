
import alerts from "./Alerts.js";
import array from "./ArrayBox.js";

const fnTrue = () => true; // always true
const mask = (val, i) => ((val >> i) & 1); // check bit at i position

const FOCUSABLED = "[tabindex]:not([type=hidden],[readonly],[disabled])";
const fnVisible = el => (el.offsetWidth || el.offsetHeight || el.getClientRects().length);

const opts = { // Configuration
    tabClass: "tab-content",
    activeClass: "active",
    tabActionClass: "tab-action",
    progressBarClass: "progress-bar",
};

function Tabs() {
	const self = this; //self instance
	const tabs = document.getElementsByClassName(opts.tabClass);
	const progressbar = document.getElementsByClassName(opts.progressBarClass);

    const fnFindIndex = id => tabs.findIndex(tab => (tab.id == ("tab-" + id))); //find index tab by id
    const fnCurrentIndex = () => tabs.findIndex(el => el.classList.contains(opts.activeClass)); //current index tab
    const autofocus = tab => {
        const el = tab.querySelectorAll(FOCUSABLED).find(fnVisible);
        el && el.focus();
        return self;
    }
    const fnSetTab = (tab, index) => {
        tab.classList.add(opts.activeClass);
        _tabIndex = index ?? fnCurrentIndex();
        return autofocus(tab);
    }

    let _tabIndex = fnCurrentIndex(); //current index tab
    let _tabSize = tabs.length - 1; // max tabs size
    let _tabMask = ~0; // all 11111....

    this.getTab = id => tabs.find(tab => (tab.id == ("tab-" + id))); // Find by id selector
    this.setMask = mask => { _tabMask = mask; return self; } // set mask for tabs
    this.setActive = id => fnSetTab(self.getTab(id)); // Force active class whithot events and alerts

    // Set events on tabs actions
    this.setInitEvent = (tab, fn) => { opts["init-tab-" + tab] = fn; return self; }
    this.setShowEvent = (tab, fn) => { opts["show-tab-" + tab] = fn; return self; }
    this.setViewEvent = (tab, fn) => { opts["view-tab-" + tab] = fn; return self; }
    this.setValidEvent = (tab, fn) => { opts["valid-tab-" + tab] = fn; return self; }

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
        const fnInit = opts["init-" + tab.id] || fnTrue; // Event handler fire once
        const fnShow = opts["show-" + tab.id] || fnTrue; // Event handler fire each access to tab
        const fnValid = ((i > _tabIndex) && opts["valid-" + tabs[_tabIndex].id]) || fnTrue; // Event fired before leave current tab to next tab
        if (fnValid(tab) && fnInit(tab) && fnShow(tab)) { // Validate change tab
            alerts.closeAlerts(); // Close all previous messages
            const step = "step-" + i; //go to a specific step on progressbar
            progressbar.forEach(bar => { // progressbar is optional
                bar.children.forEach(child => child.classList.toggle(opts.activeClass, child.id <= step));
            });
            tab.dataset.back = updateBack ? _tabIndex : tab.dataset.back; // Save source tab index
            tabs.forEach(tab => tab.classList.remove(opts.activeClass));
            fnSetTab(tab, i); // set current tab
            const fnView = opts["view-" + tab.id] || fnTrue;
            fnView(tab, self); // Fire when show tab
        }
        delete opts["init-" + tab.id];
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
        el.getElementsByClassName(opts.tabActionClass).forEach(link => {
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
                if (href == "#toggle-tab") {
                    const hide = link.dataset.hide || "hide"; // Hide class
                    const targets = document.querySelectorAll(link.dataset.target || (".info-" + link.id));
                    targets.forEach(el => el.classList.toggle(hide));

                    const icon = link.querySelector(".icon-" + link.id);
                    if (icon && link.dataset.toggle) // change link icon class?
                        link.dataset.toggle.split(/\s+/).forEach(name => icon.classList.toggle(name));
                    autofocus(targets[0]); // set focus on input
                }
            });
        });
        return self;
    }

    // Init. view and PF navigation (only for CV-UAE)
    self.setActions(document);
    window.showTab = (xhr, status, args, tab) => {
        if (status != "success")
            return !alerts.showError("Error 500: Internal server error.");
        if (!args) // Has server response
            return self.showTab(tab); // Show tab and return true
        const msgs = array.parse(args.msgs); // Parse server messages
        const ok = !msgs?.msgError; // is ok?
        ok && self.showTab(tab); // Only show tab if no error
        alerts.showAlerts(msgs); // Always show alerts after change tab
        return ok;
    }
}

export default new Tabs();
