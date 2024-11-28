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
const showsRouter = require("./routes/shows");

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
app.use("/shows", showsRouter);

// Error handling
app.use(function (req, res, next) {
  next(createError(404, "Endpoint not found"));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
