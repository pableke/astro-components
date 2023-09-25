
const fnTrue = () => true;
const mask = (val, i) => ((val >> i) & 1); // check bit at i position

export default function(opts) {
    opts = opts || {}; // default optios
    opts.tabClass = opts.tabClass || "tab-content";
    opts.activeClass = opts.activeClass || "active";

	const self = this; //self instance
	const tabs = Array.from(document.getElementsByClassName(opts.tabClass));

    let _tabIndex = tabs.filter(el => el.classList.contains(opts.activeClass)); //current index tab
    let _tabSize = tabs.length - 1; // max tabs size
    let _backTab = _tabIndex; // back to previous tab
    let _tabMask = ~0; // all 11111....

    this.getTab = id => tabs.find(tab => (tab.id == ("tab-" + id))); // Find by id selector
    this.setTabMask = mask => { _tabMask = mask; return self; } // set mask for tabs

    function fnShowTab(i) { //show tab by index
        window.alerts.closeAlerts(); // always close alerts
        i = (i < 0) ? 0 : Math.min(i, _tabSize - 1);
        if (i == _tabIndex) // is current tab
            return self; // nothing to do
        const tab = tabs[i]; // get next tab
        const fn = opts["tab-" + i] || fnTrue; // Event handler
        if (fn(tab)) { // Validata change tab
            const progressbar = document.getElementById("progressbar");
            if (progressbar) { // progressbar is optional
                const step = "step-" + i; //go to a specific step on progressbar
                self.each(progressbar.children, li => self.toggle(li, opts.activeClass, li.id <= step));
            }
            _backTab = _tabIndex; // save from
            _tabIndex = i; // set current index
            self.removeClass(tabs, opts.activeClass).addClass(tab, opts.activeClass) // set active tab
                .setFocus(tab); // Auto set focus and scroll
        }
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

	const lastId = str => +str.match(/\d+$/).pop();
    const fnNav = (link, fn) => link.addEventListener("click", fn);
    document.querySelectorAll("a[href='#back-tab']").forEach(link => fnNav(link, self.backTab));
    document.querySelectorAll("a[href='#prev-tab']").forEach(link => fnNav(link, ev => { self.setTabMask(+(el.dataset.mask ?? _tabMask)).prevTab(); }));
    document.querySelectorAll("a[href='#next-tab']").forEach(link => fnNav(link, ev => { self.setTabMask(+(el.dataset.mask ?? _tabMask)).nextTab(); }));
    document.querySelectorAll("a[href^='#tab-']").forEach(link => fnNav(link, ev => { self.viewTab(lastId(el.href)); }));
    document.querySelectorAll("a[href='#last-tab']").forEach(link => fnNav(link, self.lastTab));
}
