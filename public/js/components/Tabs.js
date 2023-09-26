
const fnTrue = () => true; // always true
const mask = (val, i) => ((val >> i) & 1); // check bit at i position

HTMLCollection.prototype.filter = Array.prototype.filter;
HTMLCollection.prototype.forEach = Array.prototype.forEach;

export default function(opts) {
    opts = opts || {}; // default optios
    opts.tabClass = opts.tabClass || "tab-content";
    opts.activeClass = opts.activeClass || "active";
    opts.navbarClass = opts.navbarClass || "navbar";
    opts.progressBarClass = opts.progressBarClass || "progress-bar";

	const self = this; //self instance
	const tabs = document.getElementsByClassName(opts.tabClass);
	const progressbar = document.getElementsByClassName(opts.progressBarClass);

    let _tabIndex = tabs.filter(el => el.classList.contains(opts.activeClass)); //current index tab
    let _tabSize = tabs.length - 1; // max tabs size
    let _backTab = _tabIndex; // back to previous tab
    let _tabMask = ~0; // all 11111....

    this.getTab = id => tabs.find(tab => (tab.id == ("tab-" + id))); // Find by id selector
    this.setTabMask = mask => { _tabMask = mask; return self; } // set mask for tabs

    function fnShowTab(i) { //show tab by index
        i = (i < 0) ? 0 : Math.min(i, _tabSize - 1);
        if (i == _tabIndex) // is current tab
            return self; // nothing to do
        const tab = tabs[i]; // get next tab
        const fnInit = opts["onInitTab" + i] || fnTrue; // Event handler fire once
        const fnView = opts["onViewTab" + i] || fnTrue; // Event handler fire each access to tab
        if (fnInit(tab) && fnView(tab)) { // Validata change tab
            const step = "step-" + i; //go to a specific step on progressbar
            progressbar.forEach(bar => { // progressbar is optional
                bar.children.forEach(child => child.classList.toggle(opts.activeClass, child.id <= step));
            });
            _backTab = _tabIndex; // save from
            _tabIndex = i; // set current index
            tabs.forEach(tab => tab.classList.remove(opts.activeClass));
            tab.classList.add(opts.activeClass); // set active tab
        }
        delete opts["onInitTab" + i];
        return self;
    }

    this.viewTab = id => fnShowTab(tabs.findIndex(tab => (tab.id == ("tab-" + id)))); //find by id selector
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

    document.getElementsByClassName(opts.navbarClass).forEach(link => {
        link.addEventListener("click", ev => { // Handle click event
            const href = link.getAttribute("href");
            if (href == "#back-tab")
                return self.backTab();
            if (href == "#prev-tab")
                return self.setTabMask(+(link.dataset.mask ?? _tabMask)).prevTab();
            if (href == "#next-tab")
                return self.setTabMask(+(link.dataset.mask ?? _tabMask)).nextTab();
            if (href.startsWith("#tab-"))
                return self.viewTab(+href.match(/\d+$/).pop());
            if (href == "#last-tab")
                return self.lastTab();
        });
    });
}
