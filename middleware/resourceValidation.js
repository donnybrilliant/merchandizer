const createError = require("http-errors");
const db = require("../models");
const TourService = require("../services/TourService");
const tourService = new TourService(db);
const ShowService = require("../services/ShowService");
const showService = new ShowService(db);
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const ArtistService = require("../services/ArtistService");
const artistService = new ArtistService(db);
const UserService = require("../services/UserService");
const userService = new UserService(db);
const AdjustmentService = require("../services/AdjustmentService");
const adjustmentService = new AdjustmentService(db);
const CategoryService = require("../services/CategoryService");
const categoryService = new CategoryService(db);
const InventoryService = require("../services/InventoryService");
const inventoryService = new InventoryService(db);

async function validateAndFindTour(req, res, next, val) {
  const tourId = parseInt(val, 10);
  if (isNaN(tourId) || tourId < 1) {
    return next(createError(400, "tourId must be a valid integer"));
  }

  try {
    const tour = await tourService.getById(tourId);
    req.params.tourId = tourId;
    req.tour = tour;
    next();
  } catch (err) {
    next(err);
  }
}

async function validateAndFindShow(req, res, next, val) {
  const showId = parseInt(val, 10);
  if (isNaN(showId) || showId < 1) {
    return next(createError(400, "showId must be a valid integer"));
  }

  try {
    const show = await showService.getById(showId);
    req.params.showId = showId;
    req.show = show;
    next();
  } catch (err) {
    next(err);
  }
}

async function validateAndFindProduct(req, res, next, val) {
  const productId = parseInt(val, 10);
  if (isNaN(productId) || productId < 1) {
    return next(createError(400, "productId must be a valid integer"));
  }

  try {
    const product = await productService.getById(productId);
    req.params.productId = productId;
    req.product = product;
    next();
  } catch (err) {
    next(err);
  }
}

async function validateAndFindArtist(req, res, next, val) {
  const artistId = parseInt(val, 10);
  if (isNaN(artistId) || artistId < 1) {
    return next(createError(400, "artistId must be a valid integer"));
  }

  try {
    const artist = await artistService.getById(artistId);
    req.params.artistId = artistId;
    req.artist = artist;
    next();
  } catch (err) {
    next(err);
  }
}

async function validateAndFindUser(req, res, next, val) {
  const userId = parseInt(val, 10);
  if (isNaN(userId) || userId < 1) {
    return next(createError(400, "userId must be a valid integer"));
  }

  try {
    const user = await userService.getById(userId);
    req.params.userId = userId;
    next();
  } catch (err) {
    next(err);
  }
}

async function validateAndFindAdjustment(req, res, next, val) {
  const adjustmentId = parseInt(val, 10);
  if (isNaN(adjustmentId) || adjustmentId < 1) {
    return next(createError(400, "adjustmentId must be a valid integer"));
  }

  try {
    const adjustment = await adjustmentService.getById(adjustmentId);
    req.params.adjustmentId = adjustmentId;
    req.adjustment = adjustment;
    next();
  } catch (err) {
    next(err);
  }
}

async function validateAndFindCategory(req, res, next, val) {
  const categoryId = parseInt(val, 10);
  if (isNaN(categoryId) || categoryId < 1) {
    return next(createError(400, "categoryId must be a valid integer"));
  }

  try {
    const category = await categoryService.getById(categoryId);
    req.params.categoryId = categoryId;
    req.category = category;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateAndFindTour,
  validateAndFindShow,
  validateAndFindProduct,
  validateAndFindArtist,
  validateAndFindUser,
  validateAndFindAdjustment,
  validateAndFindCategory,
};
