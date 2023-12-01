
import dietas from "../../data/iris/dietas.js"

function Dieta() {
	const self = this; //self instance
    let data;

    this.getData = () => data;
    this.setData = dietas => { data = dietas; return self; }

}

export default new Dieta();
