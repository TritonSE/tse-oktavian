const express = require("express");
const { body } = require("express-validator");
const jwt = require("jsonwebtoken");

const { createUser, forgotPassword, resetPassword, changePassword } = require("../services/users");
const { authenticateUser, authorizeUser } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");
const { JWT_SECRET } = require("../constants");

const router = express.Router();

const TOKEN_EXPIRE_SEC = 3600;

const PASSWORD_VALIDATOR = body("password").isString().isLength({ min: 6 });

router.post(
  "/register",
  [
    body("name").notEmpty().isString(),
    body("email").notEmpty().isEmail(),
    PASSWORD_VALIDATOR,
    body("secret").notEmpty().isString(),
    validateRequest,
  ],
  (req, res, next) => {
    createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      secret: req.body.secret,
      active: true,
    })
      .then((user) => {
        req.login(user, { session: false }, (err) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({
              user: req.user,
              token: jwt.sign(req.user.toJSON(), JWT_SECRET, { expiresIn: TOKEN_EXPIRE_SEC }),
            });
          }
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/login",
  [body("email").isEmail(), PASSWORD_VALIDATOR, validateRequest, authenticateUser],
  (req, res) => {
    res.status(200).json({
      user: req.user,
      token: jwt.sign(req.user.toJSON(), JWT_SECRET, { expiresIn: TOKEN_EXPIRE_SEC }),
    });
  }
);

router.get("/me", [authorizeUser([])], (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

router.post(
  "/forgot-password",
  [body("email").isEmail(), body("secret").notEmpty().isString(), validateRequest],
  (req, res, next) => {
    forgotPassword({
      email: req.body.email,
      secret: req.body.secret,
    })
      .then(() => {
        res.status(200).json({});
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/reset-password",
  [body("token").isUUID(4), PASSWORD_VALIDATOR, validateRequest],
  (req, res, next) => {
    resetPassword({
      token: req.body.token,
      password: req.body.password,
    })
      .then(() => {
        res.status(200).json({});
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.post(
  "/change-password",
  [PASSWORD_VALIDATOR, validateRequest, authorizeUser([])],
  (req, res, next) => {
    changePassword({
      user: req.user,
      password: req.body.password,
    })
      .then(() => {
        res.status(200).json({});
      })
      .catch((err) => {
        next(err);
      });
  }
);

module.exports = router;
