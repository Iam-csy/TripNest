



require("dotenv").config();


const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const MongoStore=require("connect-mongo");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

// ================= DATABASE =================
// mongoose.connect("mongodb://127.0.0.1:27017/mydatabase")
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));
if (!process.env.ATLAS_URL) {
  throw new Error("❌ ATLAS_URL is undefined");
}


const dbUrl = process.env.ATLAS_URL;


mongoose.connect(dbUrl)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.error(err));


// ================= VIEW ENGINE =================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= MIDDLEWARE =================

app.use("/uploads", express.static("uploads"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600, // 24 hours
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

app.use(
  session({
    store,
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
      maxAge: 1000 * 60 * 60 * 24 * 3,
    },
  })
);


app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= FLASH GLOBALS =================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ================= ROUTES =================
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user.js");

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// ================= HOME =================
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ================= ERROR HANDLING =================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error", { err });
});

// ================= SERVER =================
app.listen(8080, () => {
  console.log("Server running at 8080");
});
