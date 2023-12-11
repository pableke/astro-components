
/*** MAPA DE LOS VALORES PARA LOS CAMPOS DEL FORMULARIO ***/
const NP_010  = { economica: "323003", sujeto: 0, exento: 1, m349: 0, iban:  0, iva:  0 };
const NP_206  = { economica: "323003", sujeto: 2, exento: 0, m349: 6, iban:  0, iva:  0 };
const C2T14   = { economica: "131004", sujeto: 0, exento: 1, m349: 0, iban: 10, iva:  0 };
const C2UET14 = { economica: "131004", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C2ZZT14 = { economica: "131004", sujeto: 2, exento: 0, m349: 0, iban: 10, iva:  0 };
const C2T15   = { economica: "131200", sujeto: 0, exento: 1, m349: 0, iban: 10, iva:  0 };
const C2TUE15 = { economica: "131200", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C2T16   = { economica: "139000", sujeto: 0, exento: 0, m349: 0, iban: 10, iva: 21 };
const C2UET16 = { economica: "139000", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C2T17   = { economica: "139001", sujeto: 0, exento: 0, m349: 0, iban: 10, iva: 21 };
const C2UET17 = { economica: "139001", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C2T18   = { economica: "139002", sujeto: 0, exento: 0, m349: 0, iban: 10, iva: 21 };
const C2UET18 = { economica: "139002", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C1T5    = { economica: "131600", sujeto: 0, exento: 0, m349: 0, iban: 10, iva: 21 };
const C1UET5  = { economica: "131600", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C1ZZT5  = { economica: "131600", sujeto: 2, exento: 0, m349: 0, iban: 10, iva:  0 };
const C2T19   = { economica: "131600", sujeto: 0, exento: 5, m349: 2, iban: 10, iva:  0 };
const C2ZZT19 = { economica: "131600", sujeto: 0, exento: 2, m349: 0, iban: 10, iva:  0 };
const C1T1    = { economica: "132500", sujeto: 0, exento: 0, m349: 0, iban:  4, iva: 21 };
const C2T1    = { economica: "132500", sujeto: 2, exento: 0, m349: 6, iban:  4, iva: 21 };
const C1T20   = { economica: "132700", sujeto: 0, exento: 0, m349: 0, iban: 10, iva: 21 };
const C1UET20 = { economica: "132700", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C1ZZT20 = { economica: "132700", sujeto: 2, exento: 0, m349: 0, iban: 10, iva:  0 };
const C1T21   = { economica: "132600", sujeto: 0, exento: 0, m349: 0, iban: 10, iva:  4 };
const F133001 = { economica: "133001", sujeto: 0, exento: 0, m349: 0, iban: 10, iva:  4 };
const C2UET22 = { economica: "133001", sujeto: 0, exento: 5, m349: 2, iban: 10, iva:  0 };
const C2ZZT22 = { economica: "133001", sujeto: 0, exento: 2, m349: 0, iban: 10, iva:  0 };
const C2UET23 = { economica: "133001", sujeto: 2, exento: 0, m349: 6, iban: 10, iva:  0 };
const C2ZZT23 = { economica: "133001", sujeto: 2, exento: 0, m349: 0, iban: 10, iva:  0 };
const C1T6    = { economica: "154000", sujeto: 0, exento: 0, m349: 0, iban: 10, iva: 21 };
const C2T2    = { economica: "155100", sujeto: 0, exento: 0, m349: 0, iban:  4, iva: 21 };
const C2UET2  = { economica: "155100", sujeto: 2, exento: 0, m349: 6, iban:  4, iva:  0 };

export default {
    c1epes4: NP_010, c1noes4: NP_010, c1noue4: NP_010, c1nozz4: NP_010,
    c2epes4: NP_010, c2noes4: NP_010, c2noue4: NP_206, c2nozz4: NP_010, 
    c3epes4: NP_010, c3noes4: NP_010, c3noue4: NP_206, c3nozz4: NP_010,

    c2epes14: C2T14, c2noes14: C2T14, c2noue14: C2UET14, c2nozz14: C2ZZT14,
    c3epes14: C2T14, c3noes14: C2T14, c3noue14: C2UET14, c3nozz14: C2ZZT14,

    c1epes3: NP_010, c1noes3: NP_010, c1noue3: NP_010, c1nozz3: NP_010, 
    c2epes3: NP_010, c2noes3: NP_010, c2noue3: NP_206, c2nozz3: NP_010, 
    c3epes3: NP_010, c3noes3: NP_010, c3noue3: NP_206, c3nozz3: NP_010,

    c2epes15: C2T15, c2noes15: C2T15, c2noue15: C2TUE15, c2nozz15: C2T15, 
    c3epes15: C2T15, c3noes15: C2T15, c3noue15: C2TUE15, c3nozz15: C2T15,

    c1epes9: NP_010, c1noes9: NP_010, c1noue9: NP_010, c1nozz9: NP_010, 
    c2epes9: NP_010, c2noes9: NP_010, c2noue9: NP_206, c2nozz9: NP_010, 
    c3epes9: NP_010, c3noes9: NP_010, c3noue9: NP_206, c3nozz9: NP_010,

    c2epes16: C2T16, c2noes16: C2T16, c2noue16: C2UET16, c2nozz16: C2UET16, 
    c3epes16: C2T16, c3noes16: C2T16, c3noue16: C2UET16, c3nozz16: C2UET16,

    c2epes17: C2T17, c2noes17: C2T17, c2noue17: C2UET17, c2nozz17: C2UET17, 
    c3epes17: C2T17, c3noes17: C2T17, c3noue17: C2UET17, c3nozz17: C2UET17,

    c2epes18: C2T18, c2noes18: C2T18, c2noue18: C2UET18, c2nozz18: C2UET18, 
    c3epes18: C2T18, c3noes18: C2T18, c3noue18: C2UET18, c3nozz18: C2UET18,

    c1epes5: C1T5, c1noes5: C1T5, c1noue5: C1T5, c1nozz5: C1T5, 
    c2epes5: C1T5, c2noes5: C1T5, c2noue5: C1UET5, c2nozz5: C1ZZT5, 
    c3epes5: C1T5, c3noes5: C1T5, c3noue5: C1UET5, c3nozz5: C1ZZT5,

    c1epes19: C1T5, c1noes19: C1T5, c1noue19: C1T5, c1nozz19: C1T5, 
    c2epes19: C1T5, c2noes19: C1T5, c2noue19: C2T19, c2nozz19: C2ZZT19, 
    c3epes19: C1T5, c3noes19: C1T5, c3noue19: C2T19, c3nozz19: C2ZZT19,

    c1epes1: C1T1, c1noes1: C1T1, c1noue1: C1T1, c1nozz1: C1T1, 
    c2epes1: C1T1, c2noes1: C1T1, c2noue1: C2T1, c2nozz1: C1T1, 
    c3epes1: C1T1, c3noes1: C1T1, c3noue1: C2T1, c3nozz1: C1T1,

    c1epes20: C1T20, c1noes20: C1T20, c1noue20: C1T20, c1nozz20: C1T20, 
    c2epes20: C1T20, c2noes20: C1T20, c2noue20: C1UET20, c2nozz20: C1ZZT20, 
    c3epes20: C1T20, c3noes20: C1T20, c3noue20: C1UET20, c3nozz20: C1ZZT20,

    c2epes21: C1T21, c2noes21: C1T21, c3epes21: C1T21, c3noes21: C1T21,

    c1epes22: F133001, c1noes22: F133001, c1noue22: F133001, c1nozz22: F133001, 
    c2epes22: F133001, c2noes22: F133001, c2noue22: C2UET22, c2nozz22: C2ZZT22, 
    c3epes22: F133001, c3noes22: F133001, c3noue22: C2UET22, c3nozz22: C2ZZT22,

    c1epes23: F133001, c1noes23: F133001, c1noue23: F133001, c1nozz23: F133001, 
    c2epes23: F133001, c2noes23: F133001, c2noue23: C2UET23, c2nozz23: C2ZZT23, 
    c3epes23: F133001, c3noes23: F133001, c3noue23: C2UET23, c3nozz23: C2ZZT23,

    c1epes6: C1T6, c1noes6: C1T6, c1noue6: C1T6, c1nozz6: C1T6, 
    c2epes6: C1T6, c2noes6: C1T6, c2noue6: C1T6, c2nozz6: C1T6, 
    c3epes6: C1T6, c3noes6: C1T6, c3noue6: C1T6, c3nozz6: C1T6,

    c2epes2: C2T2, c2noes2: C2T2, c2noue2: C2UET2, c2nozz2: C2T2, 
    c3epes2: C2T2, c3noes2: C2T2, c3noue2: C2UET2, c3nozz2: C2T2,

    cp13:    { economica: "", sujeto: 0, exento: 0, m349: 0, iban: 10, iva: 0 }, // Cartas de pago
    default: { economica: "", sujeto: 0, exento: 0, m349: 0, iban:  0, iva: 0 }  // Default values
};
