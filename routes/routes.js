const {getProductList, getMatchingStore} = require("../scraper"); 
const express = require("express");
const path = require("path");


module.exports = function(app){
    app.get("/api/get/productInfo", getProductList);
    app.get("/api/get/matchingStore", getMatchingStore);
	
	// public routes
	app.use(express.static(path.join(__dirname, '..', 'build')));
	
}