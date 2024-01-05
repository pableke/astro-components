
const ARRAY_EMPTY = [];
const fnVoid = () => {}

export function Select(form, select, input, opts) {
    opts = opts || {}; // Init. options
    opts.onLoad = opts.onLoad || fnVoid; // fired on load event
    opts.onReset = opts.onReset || fnVoid; // fired on reset event

    select = String.isstr(select) ? form.getInput(select) : select;
    input = String.isstr(input) ? form.getInput(input) : input;

    const self = this; //self instance
    let data = ARRAY_EMPTY; // default = empty array

    const fnSetData = items => {
        data = items;
        return self;
    }

    this.getItems = () => data;
    this.getItem = index => data[index];
    this.getCurrentItem = () => self.getItem(select.selectedIndex);

    this.load = items => {
        if (!JSON.size(items))
            return self.reset();
        form.setSelect(select, items);
        input.value = items[0].value;
        opts.onLoad(items[0]);
        return fnSetData(items);
    }
    this.reset = () => {
        form.setSelect(select, ARRAY_EMPTY, opts.emptyOption);
        input.value = "";
        opts.onReset();
        return fnSetData(ARRAY_EMPTY);
    }

    select.addEventListener("change", ev => {
        input.value = select.value;
        opts.onLoad(self.getCurrentItem());
    });
}

export function MultiNameInput(form, main, inputs) {
	const self = this; //self instance
}
