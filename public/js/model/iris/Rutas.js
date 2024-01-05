
import ruta from "./Ruta.js"
import i18n from "../../i18n/iris/langs.js";

function Rutas() {
	const self = this; //self instance

    let data, resume; // Current data table
    this.getData = () => data;
    this.setRutas = rutas => {
        data = rutas;
        return self;
    }
    this.setData = table => {
        resume = table.getResume();
        return self.setRutas(table.getData());
    }

    this.getRuta = () => ruta;
    this.size = () => JSON.size(data);
    this.isEmpty = () => !self.size();
    this.getFirst = () => data[0];
    this.getLast = () => data.at(-1);
    this.getStart = () => self.getFirst().dt1;
    this.getStartDate = () => new Date(self.getStart());
    this.getEnd = () => self.getLast().dt2;
    this.getEndDate = () => new Date(self.getEnd());
    this.is1Dia = () => self.getStart().inDay(self.getEnd());

    const fnDiffDays = () => self.getStartDate().diffDays(self.getEndDate());
    this.getNumNoches = () => (self.isEmpty() || self.is1Dia()) ? 0 : fnDiffDays();
    this.getNumDias = () => {
        if (self.isEmpty()) return 0;
        return self.is1Dia() ? 1 : fnDiffDays();
    }

    this.isSaved = () => data.every(ruta => ruta.id);
    this.getRutasVp = () => data.filter(r => ruta.setRuta(r).isVehiculoPropio());
    this.getRutasOut = () => data.filter(r => (ruta.setRuta(r).isUnlinked() && !ruta.isDespSinFactura()));
    this.getRutaByDate = fecha => {
        let ruta = self.getFirst(); // Ruta de salida
        const fMax = (new Date(fecha)).addHours(29).toISOString(); // fMAx = hora de salida + 5h del dia siguiente
        data.forEach(r => { ruta = (r.dt2 < fMax) ? r : ruta; }); // Ultima fecha de llegada mas proxima a fMax
        return ruta;
    }

    this.validate = function() {
		if (self.isEmpty())
			return !i18n.setInputError("destino", "errRequired", "errItinerario");
		let r1 = data[0];
		if (!ruta.validate(r1))
			return false;
		for (let i = 1; i < data.length; i++) {
			let r2 = data[i];
			if (!ruta.validate(r2))
				return false; //stop
			if (r1.pais2 != r2.pais1)
				return !i18n.setInputError("destino", "errRequired", "errItinerarioPaises");
			if (r1.dt2 > r2.dt1) //rutas ordenadas
				return !i18n.setInputError("destino", "errRequired", "errItinerarioFechas");
			if (data[0].origen == r2.origen)
				return !i18n.setInputError("destino", "errRequired", "errMulticomision");
			r1 = r2; //go next route
		}
		return true;
	}
}

export default new Rutas();
