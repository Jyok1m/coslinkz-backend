require("dotenv").config();
require("./db/connection");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cors = require("cors"); //

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var profileRouter = require("./routes/profile");
var userRouter = require("./routes/user");
var creationRouter = require("./routes/creation");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/user", userRouter);
app.use("/creation", creationRouter);

module.exports = app;
