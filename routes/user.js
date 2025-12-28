const express = require("express");
const router = express.Router();
const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const usersController = require("../controllers/users");

// ================= LOGIN =================
router.route("/login")
  .get(usersController.userLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true
    }),
    usersController.loginData
  );

// ================= SIGNUP =================
router.route("/signup")
  .get(usersController.userSignup)
  .post(
    wrapAsync(usersController.signupData)
  );

// ================= LOGOUT =================
router.post(
  "/logout",
  usersController.userLogout
);

module.exports = router;
