
import dietas from "../../data/iris/dietas.js"
import i18n from "../../i18n/iris/langs.js";

function Dieta() {
    this.getDieta = pais => dietas[pais] || dietas.ZZ;

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
