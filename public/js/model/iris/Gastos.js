
import gasto from "./Gasto.js"
import i18n from "../../i18n/iris/langs.js";

function Gastos() {
	const self = this; //self instance

    let data; // Current data table
    this.getData = () => data;
    this.setData = gastos => {
        data = gastos;
        return self;
    }

    this.getGasto = () => gasto;
    this.size = () => JSON.size(data);
    this.isEmpty = () => !self.size();

    this.getFacturas = () => data.filter(gasto.isFactura);
    this.getTickets = () => data.filter(gasto.isTicket);
    this.getPernoctas = () => data.filter(gasto.isPernocta);
    this.getDietas = () => data.filter(gasto.isDieta);
    this.getDocumentacion = () => data.filter(gasto.isDocumentacion);

    const fnDiffDays = (dt1, dt2) => (new Date(dt1)).diffDays(new Date(dt2));
    this.getNumNoches = () => {
        if (self.isEmpty()) return 0;
        const pernoctas = self.getPernoctas();
        if (!pernoctas.length) return 0;
        const dt1 = pernoctas[0].f1;
        const dt2 = pernoctas.last().f2;
        return dt1.inDay(dt2) ? 0 : fnDiffDays(dt1, dt2);
    }
    this.getNumDias = () => {
        if (self.isEmpty()) return 0;
        const pernoctas = self.getPernoctas();
        if (!pernoctas.length) return 0;
        const dt1 = pernoctas[0].f1;
        const dt2 = pernoctas.last().f2;
        return dt1.inDay(dt2) ? 1 : fnDiffDays(dt1, dt2);
    }
    this.getImpPernoctas = () => {
        if (self.isEmpty()) return 0;
        return data.reduce((a, g) => (a + (gasto.isPernocta(g) ? g.imp : 0)), 0);
    }

    this.validate = () => {
		return true;
	}
}

export default new Gastos();
