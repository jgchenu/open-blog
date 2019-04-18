let response={
    get body(){
        return this._body;
    },
    set body(val){
        this.res.statusCode=200;
        this._body=val;
    }
};
module.exports=response;