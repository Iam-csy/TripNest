const User = require("../models/user");

// ================= LOGIN FORM =================
module.exports.userLogin = (req, res) => {
  res.render("listings/users/login");
};

// ================= LOGIN LOGIC =================
module.exports.loginData = (req, res) => {
  req.flash("success", "Welcome back!");

  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// ================= SIGNUP FORM =================
module.exports.userSignup = (req, res) => {
  res.render("listings/users/signup");
};

// ================= SIGNUP LOGIC =================
module.exports.signupData = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, err => {
      if (err) return next(err);

      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });

  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

// ================= LOGOUT =================
module.exports.userLogout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    req.flash("success", "You are logged out successfully");
    res.redirect("/listings");
  });
};
