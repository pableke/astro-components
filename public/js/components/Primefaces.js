
const fnVoid = () => {}

function params(data) {
    const results = [];
    for (const name in data)
        results.push({ name, value: data[name] });
    return results;
}
function send(name, data) {
    const fnCall = window[name]; // p:remoteCommand name
    fnCall(params(data)); // p:remoteCommand server call
}

function datalist(form, select, input, opts) {
    opts = opts || {}; // Init. options
    opts.onLoad = opts.onLoad || fnVoid; // fired on load event
    opts.onReset = opts.onReset || fnVoid; // fired on reset event

    const PF = {}; // Primefaces config
    PF.emptyOption = opts.emptyOption;
    PF.onLoad = item => { input.value = item.value; opts.onLoad(item); } // fired on load event
    PF.onReset = () => { input.value = ""; opts.onReset(); }; // fired on reset event

    input = form.getInput(input);
    return form.setDatalist(select, PF);
}

function multiNameInput(form, main, inputs) {
	const self = this; //self instance
}

export default {
    params, send,
    datalist,
    multiNameInput
}
