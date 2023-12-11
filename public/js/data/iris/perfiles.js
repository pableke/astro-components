
import i18n from "../../i18n/iris/langs.js";

export default { //12 tabs
    "P,PAS,COM,AyL,OTR": { pasos: 0b1011101111, actividad: 0b1100000000111, tramite: 7, titulo: i18n.get("titPerfil01") },
    "A,PAS,COM,AyL,OTR": { pasos: 0b1011101111, actividad: 0b1100000000111, tramite: 7, titulo: i18n.get("titPerfil01") },

    "P,PDI-FU,MUN,AyL,A83": { pasos: 0b1001101111, actividad: 0b0000000000011, tramite: 1, titulo: i18n.get("titPerfil06") },

    default: { pasos: 0b1011101111, actividad: 0b1100000000111, tramite: 7, titulo: i18n.get("titPerfilErr") } // default = P,PAS,COM,AyL,OTR
};
