var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send(`
    <html>
    <head>
    <title>Merchandizer</title>
    </head>
      <body>
        <h1>Merchandizer</h1>
      </body>
    </html>
  `);
});

module.exports = router;
