
import gasto from "./Gasto.js"
import i18n from "../../i18n/iris/langs.js";

function Gastos() {
	const self = this; //self instance
    let data;

    this.getData = () => data;
    this.setData = gastos => { data = gastos; return self; }

    this.getGasto = () => gasto;
    this.size = () => JSON.size(data);
    this.isEmpty = () => !self.size();
}

export default new Gastos();
