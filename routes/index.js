const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send(`
    <html>
    <head>
    <style>
     body {width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: coral; overflow-y: hidden;}
     h1 {font-family: Arial; font-size: 5rem;}
     </style>
    <title>Merchandizer</title>
    </head>
      <body>
        <h1>Merchandizer</h1>
      </body>
    </html>
  `);
});

module.exports = router;
