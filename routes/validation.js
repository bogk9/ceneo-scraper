const { check, validationResult } = require("express-validator");

function validateErrors(req, res, next) {
  const errors = validationResult(req);
  console.log(req.body);

  if (!errors.isEmpty()) {
    return res.status(422).jsonp(errors.array());
  } else {
    next();
  }
}

module.exports = { validateErrors };
