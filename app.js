require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const createError = require("http-errors");
const db = require("./models");

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const artistsRouter = require("./routes/artists");
const toursRouter = require("./routes/tours");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");
const statsRouter = require("./routes/stats");

// Sync database
db.sequelize.sync({ force: false });

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/users", usersRouter);
app.use("/artists", artistsRouter);
app.use("/tours", toursRouter);
app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);
app.use("/stats", statsRouter);

// Error handling
app.use(function (req, res, next) {
  next(createError(404, "Endpoint not found"));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;
