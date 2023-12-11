
function Gasto() {
	const self = this; //self instance
    let data;

    this.getData = () => data;
    this.setData = gasto => { data = gasto; return self; }

}

export default new Gasto();
