const {getProductList, getMatchingStore} = require("../scraper"); 

module.exports = function(app){

    app.get("/api/get/productInfo", getProductList);
    app.get("/api/get/matchingStore", getMatchingStore);
}