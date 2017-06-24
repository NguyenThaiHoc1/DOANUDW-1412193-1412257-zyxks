var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require('connect-flash');

module.exports = function (app) {
  app.use(express.static("public"));

  app.use("/component", express.static("bower_components"));

  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(session({secret: "asd7asd91y3h12h"}));
  app.use(flash());
  app.use(function(req, res, next) {
      res.locals.Success = req.flash('messagesSuccess');
      res.locals.Fail = req.flash('messagesFail');
      next();
  });
}
