
const api = {};
api.ajax = {};

function fnFetch(opts) {
	opts.headers = opts.headers || {};
	opts.headers["x-requested-with"] = "XMLHttpRequest";
	if (opts.token)
		opts.headers.authorization = "Bearer " + opts.token;
	return globalThis.fetch(opts.action, opts);
}

function fnFetchJSON(action, method, data, token) {
	const opts = { action, method, body: JSON.stringify(data), token };
	opts.headers = { "Content-Type":"application/json; charset=utf-8" };
	return fnFetch(opts);
}

function fnAjax(res) {
	const type = res.headers.get("content-type") || "";
	const promise = type.includes("application/json") ? res.json() : res.text();
	return res.ok ? promise : promise.then(data => Promise.reject(data));
}
function fnAjaxJSON(action, method, data, token) {
	const opts = { action, method, body: JSON.stringify(data), token };
	opts.headers = { "Content-Type":"application/json; charset=utf-8" };
	return fnFetch(opts).then(fnAjax);
}

function fnUrlParams(params) {
	const qs = new URLSearchParams(params);
	return "?" + qs.toString();
}

api.ajax.get = (action, params, token) => {
	const opts = { action, token };
	opts.action += params ? fnUrlParams(params) : "";
	return fnFetch(opts).then(fnAjax);
}
api.ajax.post = (action, data, token) => fnAjaxJSON(action, "POST", data, token);
api.ajax.put = (action, data, token) => fnAjaxJSON(action, "PUT", data, token);
api.ajax.patch = (action, data, token) => fnAjaxJSON(action, "PATCH", data, token);
api.ajax.delete = (action, token) => fnFetch({ action, method: "DELETE", token });
api.ajax.fetch = opts => fnFetch(opts).then(fnAjax);

api.get = (action, params, token) => {
	const opts = { action, token };
	opts.action += params ? fnUrlParams(params) : "";
	return fnFetch(opts);
}
api.post = (action, data, token) => fnFetchJSON(action, "POST", data, token);
api.put = (action, data, token) => fnFetchJSON(action, "PUT", data, token);
api.patch = (action, data, token) => fnFetchJSON(action, "PATCH", data, token);
api.delete = (action, token) => fnFetch({ action, method: "DELETE", token });
api.fetch = fnFetch;

api.send = function(action, fd) {
	const opts = { action };
	opts.method = "POST";
	opts.body = fd; //enctype = multipart/form-data
	return fnFetch(opts);
}

export default api;
