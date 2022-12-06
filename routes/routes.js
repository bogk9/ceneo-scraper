const express = require("express");
const path = require("path");
const { check, validationResult } = require("express-validator");
const { validateErrors } = require("./validation");
const { getProductList, getMatchingStore } = require("../scraper/scraper");

module.exports = function (app) {
  // API calls
  app.get(
    "/api/get/productInfo",
    [check("name").exists().notEmpty().isLength({ min: 2, max: 64 })],
    validateErrors,
    getProductList
  );

  app.get(
    "/api/get/matchingStore",
    [check("id1").exists().notEmpty().isLength({ min: 2, max: 64 })],
    validateErrors,
    getMatchingStore
  );

  // Static routes
  app.use(express.static(path.join(__dirname, "..", "build")));
};
