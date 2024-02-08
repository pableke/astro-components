
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
    const fnChange = opts.onChange || globalThis.void; // fired on load event
    const fnReset = opts.onReset || globalThis.void; // fired on reset event

    input = form.getInput(input); // get input element
    opts.onChange = item => { input.value = item.value; fnChange(item); } // fired on load event
    opts.onReset = () => { input.value = ""; fnReset(); }; // fired on reset event
    return form.setDatalist(select, opts);
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
