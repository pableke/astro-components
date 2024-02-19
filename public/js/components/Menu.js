
function Menu() {
	const self = this; //self instance

    const opts = {};
    opts.isRoot = node => !node.padre; // is root in tree
    opts.isChild = (node, child) => (node.id == child.padre); // is child from parent
    opts.onLabel = node => ((node.icono || "") + node.nombre); // render item label menu
    opts.onLink = node => `href="${node.enlace}" title="${node.titulo}"`; // render link attributes href, title, etc...

    this.set = (name, fn) => {
        opts[name] = fn;
        return self;
    }

    // Build tree menu as UL > Li > *
    function preorden(data, node, level) {
        const children = data.filter(child => opts.isChild(node, child)); // sub-menu items (children from node)
        const label = `<span class="label-menu level-${level}">` + opts.onLabel(node) + "</span>"; // item menu label
        if (children.length) {
            var output = `<li class="item-menu level-${level} item-parent">`; // parent item menu (with children)
            output += `<a ${opts.onLink(node)} class="link-menu level-${level}">${label}<i class="fas fa-caret-right icon-right"></i></a>`;
            output += `<ul class="sub-menu level-${level + 1}">` + children.map(child => preorden(data, child, level + 1)).join("") + "</ul>";
            return output + "</li>";
        }
        var output = `<li class="item-menu level-${level} item-leaf">`; // leaf item menu (item hoja)
        output += `<a ${opts.onLink(node)} class="link-menu level-${level}">${label}</a>`;
        output += children.map(child => preorden(data, child, level + 1)).join("");
        return output + "</li>";
    }
    this.html = data => data.filter(opts.isRoot).map(node => preorden(data, node, 1)).join("");
}

export default new Menu();
