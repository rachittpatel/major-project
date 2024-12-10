const express = require("express");
const app = express();
const mongoose = require ("mongoose");
//const Listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
  console.log("Connected to DB");
})
.catch((err) => {
  console.log( err);
});

async function main() {
  await mongoose.connect( MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.send("hi, i am root");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User ({
//     email: "student@gmail.com",
//     username: "demouser",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.get("/testListing",wrapAsync( async (req, res) => {
  let sampleListing = new Listing ({
    title: "Sample Listing",
    description: "by the beetch",
    price: 1200,
    location: "UP",
    country: "India",
  });
  await sampleListing.save();
  console.log("sample saved");
  res.send("successful taste");
}));

app.all("*", (req, res, next) => {
 next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
  let {statusCode= 500, message= "something went wrong"} = err;
   res.status(statusCode).render("error.ejs", {message});
});

app.listen(8081, () => {
  console.log("server is listen to the port 8081");
});

