
import alerts from "./Alerts.js";

const fnTrue = () => true; // always true
const mask = (val, i) => ((val >> i) & 1); // check bit at i position

HTMLCollection.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.findIndex = Array.prototype.findIndex;

export default function(opts) {
    opts = opts || {}; // default optios
    opts.tabClass = opts.tabClass || "tab-content";
    opts.activeClass = opts.activeClass || "active";
    opts.tabActionClass = opts.tabActionClass || "tab-action";
    opts.progressBarClass = opts.progressBarClass || "progress-bar";

	const self = this; //self instance
	const tabs = document.getElementsByClassName(opts.tabClass);
	const progressbar = document.getElementsByClassName(opts.progressBarClass);

    let _tabIndex = tabs.findIndex(el => el.classList.contains(opts.activeClass)); //current index tab
    let _tabSize = tabs.length - 1; // max tabs size
    let _backTab = _tabIndex; // back to previous tab
    let _tabMask = ~0; // all 11111....

    this.getTab = id => tabs.find(tab => (tab.id == ("tab-" + id))); // Find by id selector
    this.setTabMask = mask => { _tabMask = mask; return self; } // set mask for tabs

    // Set events on tabs actions
    this.setInitEvent = (tab, fn) => { opts["onInitTab" + tab] = fn; return self; }
    this.setShowEvent = (tab, fn) => { opts["onShowTab" + tab] = fn; return self; }
    this.setViewEvent = (tab, fn) => { opts["onViewTab" + tab] = fn; return self; }

	// Alerts helpers
	this.showOk = msg => { alerts.showOk(msg); return self; } // Encapsule showOk message
	this.showInfo = msg => { alerts.showInfo(msg); return self; } // Encapsule showInfo message
	this.showWarn = msg => { alerts.showWarn(msg); return self; } // Encapsule showWarn message
	this.showError = msg => { alerts.showError(msg); return self; } // Encapsule showError message
	this.showAlerts = data => { alerts.showAlerts(data); return self; } // Encapsule showAlerts message

    function fnShowTab(i) { //show tab by index
        i = (i < 0) ? 0 : Math.min(i, _tabSize);
        if (i == _tabIndex) // is current tab
            return self; // nothing to do
        const tab = tabs[i]; // get next tab
        const fnInit = opts["onInitTab" + i] || fnTrue; // Event handler fire once
        const fnShow = opts["onShowTab" + i] || fnTrue; // Event handler fire each access to tab
        if (fnInit(tab) && fnShow(tab)) { // Validata change tab
            alerts.closeAlerts(); // Close all previous messages
            const step = "step-" + i; //go to a specific step on progressbar
            progressbar.forEach(bar => { // progressbar is optional
                bar.children.forEach(child => child.classList.toggle(opts.activeClass, child.id <= step));
            });
            _backTab = _tabIndex; // save from
            _tabIndex = i; // set current index
            tabs.forEach(tab => tab.classList.remove(opts.activeClass));
            tab.classList.add(opts.activeClass); // set active tab
            const fnView = opts["onViewTab" + i] || fnTrue;
            fnView(tab, self); // Fire when show tab
        }
        delete opts["onInitTab" + i];
        return self;
    }

    this.showTab = id => fnShowTab(tabs.findIndex(tab => (tab.id == ("tab-" + id)))); //find by id selector
    this.lastTab = () => fnShowTab(_tabSize);
    this.backTab = () => fnShowTab(_backTab);
    this.prevTab = () => { // Ignore 0's mask tab
        for (var i = _tabIndex - 1; !mask(_tabMask, i) && (i > 0); i--);
        return fnShowTab(i); // Show calculated prev tab
    }
    this.nextTab = () => { // Ignore 0's mask tab
        for (var i = _tabIndex + 1; !mask(_tabMask, i) && (i < _tabSize); i++);
        return fnShowTab(i); // Show calculated next tab
    }

    this.setActions = el => {
        el.getElementsByClassName(opts.tabActionClass).forEach(link => {
            link.addEventListener("click", ev => { // Handle click event
                ev.preventDefault(); // avoid navigation
                const href = link.getAttribute("href");
                if (href == "#back-tab")
                    return self.backTab();
                if (href == "#prev-tab")
                    return self.setTabMask(+(link.dataset.mask ?? _tabMask)).prevTab();
                if (href == "#next-tab")
                    return self.setTabMask(+(link.dataset.mask ?? _tabMask)).nextTab();
                if (href.startsWith("#tab-"))
                    return self.showTab(+href.match(/\d+$/).pop());
                if (href == "#last-tab")
                    return self.lastTab();
                if (href == "#toggle-tab") {
                    const toggle = link.dataset.css || "hide";
                    const selector = link.dataset.target || (".info-" + link.id);
                    document.querySelectorAll(selector).forEach(el => el.classList.toggle(toggle));
    
                    const icon = link.getElementById("icon-" + link.id);
                    if (icon && link.dataset.toggle) // change link icon class?
                        link.dataset.toggle.split(/\s+/).forEach(name => icon.classList.toggle(name));
    
                    const input = link.dataset.focus && document.querySelector(link.dataset.focus);
                    input && input.focus(); // set focus on input
                }
            });
        });
        return self;
    }
    self.setActions(document);
}
