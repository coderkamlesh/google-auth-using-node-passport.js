require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const port = process.env.PORT || 3001;

const app = express();

app.set("view engine", "ejs");
app.use(
  session({
    secret: "mySuperSecretKey",
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, //7days
    },
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${port}/auth/google/callback`,
    },
    function (accessToken, refreshToken, profile, cb) {
      cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

//serve static file
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard", { user: req.user });
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  //   req.session.destroy();
  //   res.redirect("/login");
  req.logout(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
