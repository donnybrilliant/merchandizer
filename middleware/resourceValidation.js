const createError = require("http-errors");
const db = require("../models");
const TourService = require("../services/TourService");
const tourService = new TourService(db);
const ShowService = require("../services/ShowService");
const showService = new ShowService(db);
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);

async function checkTourExists(req, res, next) {
  const { tourId } = req.params;
  try {
    await tourService.getById(tourId);
    next();
  } catch (err) {
    next(err);
  }
}

async function checkShowExists(req, res, next) {
  const { showId } = req.params;
  try {
    await showService.getById(showId);
    next();
  } catch (err) {
    next(err);
  }
}

async function checkProductExists(req, res, next) { 
  const { productId } = req.params;
  try {
    await productService.getById(productId);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { checkTourExists, checkShowExists, checkProductExists };
