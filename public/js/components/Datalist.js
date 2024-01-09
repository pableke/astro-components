
const EMPTY = [];
const fnVoid = () => {}

export default function(select, opts) {
    opts = opts || {}; // Init. options
	opts.hideClass = opts.hideClass || "hide"; // hidden class name
    opts.onLoad = opts.onLoad || fnVoid; // fired on load event
    opts.onReset = opts.onReset || fnVoid; // fired on reset event

    const self = this; //self instance
    let _data = EMPTY; // default = empty array

    this.getItems = () => _data;
    this.getItem = index => _data[index];
    this.getIndex = () => select.selectedIndex;
	this.isOptional = () => !select.options[0]?.value;
    this.getCurrentItem = () => _data[select.selectedIndex - (self.isOptional() ? 1 : 0)];
	this.getOption = () => select.options[self.getIndex()]; // get current option tag
	this.getText = () => self.getOption()?.innerHTML; // get current option text
	this.getValue = () => select.value; // get current value

    this.setItems = function(items, emptyOption) {
        emptyOption = emptyOption ? `<option>${emptyOption}</option>` : ""; // Text for empty first option
        const fnItem = item => `<option value="${item.value}">${item.label}</option>`; // Item list
        select.innerHTML = emptyOption + items.map(fnItem).join(""); // Render items
        _data = items;
        return self;
	}
	this.setOptions = function(labels, values, emptyOption) {
		emptyOption = emptyOption ? `<option>${emptyOption}</option>` : ""; // Text for empty first option
		const fnOptions = (label, i) => `<option value="${values[i]}">${label}</option>`; // Default options template
		const fnDefault = (label, i) => `<option value="${i+1}">${label}</option>`; // 1, 2, 3... Number array
		select.innerHTML = emptyOption + labels.map(values ? fnOptions : fnDefault).join("");
        _data = labels; // set labels
        return self;
	}
    this.setData = function(data, emptyOption) {
        _data = []; // Reset labels continer
		select.innerHTML = emptyOption ? `<option>${emptyOption}</option>` : ""; // Text for empty first option
        for (const k in data) { // Iterate over all keys
            select.innerHTML += `<option value="${k}">${data[k]}</option>`;
            _data.push(data[k]); // add label
        }
        return self;
    }
	this.toggleOptions = function(flags) {
		const option = self.getOption(); //get current option
        const isHidden = el => el.classList.contains(opts.hideClass); // has class hide
		select.options.forEach((option, i) => option.classList.toggle(opts.hideClass, !flags.mask(i)));
		if (option && isHidden(option)) // is current option hidden?
			select.selectedIndex = select.options.findIndex(el => !isHidden(el));
		return self;
	}

    this.load = items => {
        if (!JSON.size(items))
            return self.reset();
        self.setItems(items);
        opts.onLoad(items[0]);
        return self;
    }
    this.reset = () => {
        self.setItems(EMPTY, opts.emptyOption);
        opts.onReset();
        return self;
    }

    select.addEventListener("change", ev => {
        opts.onLoad(self.getCurrentItem());
    });
}
