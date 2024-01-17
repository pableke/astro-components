
const fnVoid = () => {}

function params(data) {
    const results = [];
    for (const name in data)
        results.push({ name, value: data[name] });
    return results;
}
function send(name, data) { // p:remoteCommand tag
    const fnCall = window[name]; // p:remoteCommand name
    fnCall(params(data)); // p:remoteCommand server call
}

function datalist(form, select, input, opts) {
    opts = opts || {}; // Init. options
    opts.onChange = opts.onChange || fnVoid; // fired on load event
    opts.onReset = opts.onReset || fnVoid; // fired on reset event

    const PF = {}; // Primefaces config
    PF.emptyOption = opts.emptyOption;
    PF.onChange = item => { input.value = item.value; opts.onChange(item); } // fired on load event
    PF.onReset = () => { input.value = ""; opts.onReset(); }; // fired on reset event

    input = form.getInput(input);
    return form.setDatalist(select, PF);
}

function multiNameInput(form, main, inputs) {
    main = form.getInput(main);
    inputs = form.getInputs(inputs);

    inputs.forEach(el => {
        el.addEventListener("change", () => {
            main.value = el.value;
        });
        el.value = main.value;
    });
    return this;
}

export default {
    params, send,
    datalist,
    multiNameInput
}
