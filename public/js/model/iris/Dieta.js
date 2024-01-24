
import dietas from "../../data/iris/dietas.js"
import i18n from "../../i18n/iris/langs.js";

function Dieta() {
	const self = this; //self instance

    this.getDieta = pais => dietas[pais] || dietas.ZZ;

	this.getImporte = function(pais, tipo, grupo, isRD) {
		const dieta = self.getDieta(pais); //dieta actual
		var key = ((tipo == "1") ? "a" : "m") + grupo; //prefix (grupo = "1"/"2")
		//key += (IRSE.mask & 16) ? "" : "UPCT"; //mascara de la solicitud
		key += isRD ? "" : "UPCT";
		return dieta[key];
	}

    this.format = (data, output) => {
        output.a1 = i18n.isoFloat(data.a1);
        output.a2 = i18n.isoFloat(data.a2);
        output.m1 = i18n.isoFloat(data.m1);
        output.m2 = i18n.isoFloat(data.m2);
        output.name = i18n.strval(data, "name");
        return output;
    }
}

export default new Dieta();
