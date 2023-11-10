
import perfiles from "../../data/iris/perfiles.js"
import i18n from "../../i18n/iris/langs.js";
import valid from "../../i18n/validators.js";
import uxxiec from "../Uxxiec.js";

const PERFIL = "P,PAS,COM,AyL,OTR";
const DEFAULT = { // default => actividad=COM/MUN, tramite=AyL
	pasos: 0b111011, actividad: 3, tramite: 7, titulo: "Perfil no encontrado"
};

function Organica(perfil) {
	const self = this; //self instance

	this.is642 = mask => ((mask & 8) == 8); //contiene alguna aplicacion 642?
	this.is643 = mask => ((mask & 16) == 16); //contiene alguna aplicacion 643?
    this.isTTPP = org => (org && (org.startsWith("300906") || org.startsWith("300920"))); //TTPP o Master
    this.isIsu3005 = (org, mask) => (org && org.startsWith("3005") && ((mask & 64) == 64)); //es de investigacion de la 3005XX

	this.format = (data, output) => {
        output.o = data.o;
        output.dOrg = data.dOrg;
        output.r = data.r;
        output.resp = data.resp;
        output.imp = i18n.isoFloat(data.imp);
        return output;
    }
    this.render = (data, output, resume) => {
        return self.format(data, output);
    }

    this.validate = function(data) {
        return true;
    }
}

function Perfil() {
	const self = this; //self instance
	const organica = new Organica(self);

    let data, parts;
	const fnUpdate = perfil => {
		perfil = perfil || KEY;
		data = perfiles[perfil] || DEFAULT;
		return self;
	}

	this.getData = () => data;
	this.getOrganica = () => organica;
    this.getPerfil = () => parts.join(",");
	this.setPerfil = perfil => {
		perfil = perfil || PERFIL;
		data = perfiles[perfil] || DEFAULT;
		parts = perfil.split(",");
		return self;
	}

	this.getRol = () => parts[0];
	this.setRol = val => { parts[0] = val; return fnUpdate(self.getPerfil()); }
	this.setRolP = () => self.setRol("P");
	this.setRolA = () => self.setRol("A");
	this.setRolByNif = nif => (nif == uxxiec.getNif()) ? self.setRolP() : self.setRolA();

	this.getColectivo = () => parts[1];
	this.setColectivo = val => { parts[1] = val; return fnUpdate(self.getPerfil()); }
	this.getActividad = () => parts[2];
	this.setActividad = val => { parts[2] = val; return fnUpdate(self.getPerfil()); }
	this.isCOM = () => (parts[2] == "COM");
	this.isMUN = () => (parts[2] == "MUN");
	this.isMOV = () => (parts[2] == "MOV");

	this.getTramite = () => parts[3];
	this.setTramite = val => { parts[3] = val; return fnUpdate(self.getPerfil()); }

	this.getFinanciacion = () => parts[4];
	this.setFinanciacion = val => { parts[4] = val; return fnUpdate(self.getPerfil()); }
	this.isIsu = () => ((parts[4] == "ISU") || (parts[4] == "xSU"));
	this.isA83 = () => ((parts[4] == "A83") || (parts[4] == "x83"));
	this.isACA = () => ((parts[4] == "ACA") || (parts[4] == "xAC"));
	this.isOTR = () => ((parts[4] == "OTR") || (parts[4] == "xOT"));
	this.refinanciar = organicas => {
		let result = "OTR";
		if (organicas.length) {
			const ORG_300518 = "300518";
			organicas.forEach(org => {
				result = (org.o.startsWith(ORG_300518) && organica.is642(org.mask)) ? "ISU" : result; //apli=642
				result = (org.o.startsWith(ORG_300518) && organica.is643(org.mask) && (result != "ISU")) ? "A83" : result; //apli=643
				result = (organica.isTTPP(org.o) && (result == "OTR")) ? "ACA" : result; //TTPP o Master
			});
			if (organicas.length > 1) {
				if (result == "ISU") return self.setFinanciacion("xSU");
				if (result == "A83") return self.setFinanciacion("x83");
				if (result == "ACA") return self.setFinanciacion("xAC");
				return self.setFinanciacion("xOT");
			}
		}
		return self.setFinanciacion(result);
	}

	this.validate = data => {
        let ok = valid.reset().size20("acInteresado", data.nifInteresado, "Debe seleccionar un interesado válido"); // autocomplete required key
		return (parts && parts[0] && parts[1] && parts[2] && parts[3] && parts[4]) ? ok : i18n.reject("Perfil no encontrado");
	}
}

export default new Perfil();