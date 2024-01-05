
import i18n from "../../i18n/iris/langs.js";

function Gasto() {
	const self = this; //self instance
    let data;

    this.getData = () => data;
    this.setData = gasto => { data = gasto; return self; }

    this.isFactura = gasto => (gasto.tipo == 1);
    this.isTicket = gasto => (gasto.tipo == 2);
    this.isPernocta = gasto => (gasto.tipo == 6);
    this.isDieta = gasto => (gasto.tipo == 7);
    this.isDocumentacion = gasto => (gasto.tipo == 8);

    this.format = (data, output) => {
        output.origen = data.origen;
        output.destino = data.destino;
        output.f1 = i18n.isoDate(data.f1 || data.dt1);
        output.f2 = i18n.isoDate(data.f2 || data.dt2);
        output.imp1 = i18n.isoFloat(data.imp1);
        output.imp2 = i18n.isoFloat(data.imp2);
        return output;
    }
    this.render = (data, output, resume) => {
        resume.imp1 += data.imp1;
        resume.imp2 += data.imp2;
        return self.format(data, output);
    }
    this.resume = (data, output) => {
        output.imp1 = i18n.isoFloat(data.imp1);
        output.imp2 = i18n.isoFloat(data.imp2);
        return output;
    }
}

export default new Gasto();
