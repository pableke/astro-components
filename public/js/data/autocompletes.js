
import data from "./table-test.js";
import test from "../model/Test.js";

export default {
    test: {
        minLength: 3,
        source: term => test.filter(data, term),
        render: test.autocomplete
    }
}
