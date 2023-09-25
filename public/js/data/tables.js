
import data from "./table-test.js";
import test from "../model/Test.js";

export default {
    test: {
        data,
        beforeRender: resume => { resume.imp = 0;},
        onRender: (row, resume, fmt, i) => {
            test.render(row, fmt, i);
            resume.imp += row.imp;
        }
    }
}
