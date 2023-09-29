
import data from "./table-test.js";
import test from "../model/Test.js";

export default {
    test: {
        data,
        beforeRender: resume => { resume.imp = 0;},
        onRender: (row, fmt, resume) => {
            test.render(row, fmt);
            resume.imp += row.imp ?? 0;
        },
        afterRender: resume => test.render(resume, {})
    }
}
