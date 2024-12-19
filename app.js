require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const db = require("./models");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

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

if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}
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
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
