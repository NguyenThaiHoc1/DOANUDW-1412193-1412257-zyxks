var userDB = require("../models/user.js");
var querystring = require('querystring');
var Qs = require('q');
var request = require('request');
var objectUser = require("../Object/userObject.js");

function Checking(value) {
  var resulf = value === undefined || value.trim() === "" || value.length === 0;
  return resulf;
}

// changepassword chua sua co gi sua lai
var userController = {

  userCheckEmail : function (req, res) {
        var params = req.url.split('?')[1];
        var data   = querystring.parse(params);
        var email  = data.email;
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        userDB.findbyUserEmail(email).then(function (rows) {
            if (rows.length > 0) {
              res.write('"Email is already"');
            } else {
              res.write('"true"');
            }
            res.end();
        }).fail(function(err) {
            console.log(err);
            res.end('fail');
        });
  },
  userCheckName : function (req, res) {
    var params = req.url.split('?')[1].split('=')[1];
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    userDB.findbyUserName(params).then(function (rows) {
        if (rows.length > 0) {
          res.write('"Username is already"');
        } else {
          res.write('"true"');
        }
        res.end();
    }).fail(function(err) {
        console.log(err);
        res.end('fail');
    });
  },
  userRegister: function (req, res) {
      if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        req.flash("messagesFail", "Please Checking Captcha");
        res.redirect("/register");
      } else {
        var secretKey = "6LdWASUUAAAAAI7CnZ9ohJ1aUkf-P4Pap_qnmvdi";
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
        request(verificationUrl,function(error,response,body) {
          body = JSON.parse(body);
          if(body.success !== undefined && !body.success) {
            req.flash("messagesFail", "Failed captcha verification");
            res.redirect("/register");
          }
          if ( Checking(req.body.address) || Checking(req.body.username) || Checking(req.body.password) || Checking(req.body.first_name) || Checking(req.body.last_name) || Checking(req.body.email)){
            req.flash("messagesFail", "Register is fail !!!");
            res.redirect("/register");
          }
          else {
            userDB.insertUser(req.body).then(function (rows) {
              req.flash("messagesSuccess", "Register is success !!!");
              res.redirect("/login");
            }).fail(function (err) {
              req.flash("messagesFail", "Register is fail !!!");
              res.redirect("/register");
            });
          }
        });
      }
  },
  userLogin: function (req, res) {
      // khuc nay viet dang nhap
      // kiem tra xem co bi hack hay ko
      if (Checking(req.body.username) || Checking(req.body.password)){
        req.flash("messagesFail", "LogIn is fail !!!");
        res.redirect("/login");
      }else {
        userDB.findbyUserName(req.body.username).then(function (rows) {
            if(rows.length > 0) {
              var fullname = rows[0].f_Name.split(' ');
              var Firstname = fullname[0];
              var Lastname = fullname[1];
              var accessadmin = rows[0].accessadmin;
              if(accessadmin == 0){
                req.flash("messagesFail", "Account is Locked");
                res.redirect("/login");
              } else {
                var newuser = new objectUser(rows[0].f_ID, rows[0].f_Username, rows[0].f_Password, Firstname, Lastname, rows[0].f_Email, rows[0].f_Address, rows[0].f_DOB, rows[0].f_Permission, rows[0].positiverating, rows[0].negativerating, rows[0].f_ImageUrl, rows[0].f_deadlineseller);
                if(newuser.validPassword(req.body.password)) {
                    req.session.user = newuser;
                    res.redirect("/profile");
                }else {
                  req.flash("messagesFail", "LogIn is fail !!!");
                  res.redirect("/login");
                }
              }
            }
            else {
              req.flash("messagesFail", "Username is not exists");
              res.redirect("/login");
            }
        })

      }
  },
  userLogout: function (req, res) {
    // user destroy
    req.session.destroy(); // huy session hien tai
    res.redirect('/');
  },
  getchangepassword: function (req, res) {
    res.render("_Users/changepassword", {
      user: req.session.user,
      successMess : res.locals.Success,
      FailMess : res.locals.Fail,
      layout: "applicationnoHeader"
    });
  },
  changepassword: function (req, res) {
    // chuc nang nay duoc su dung cho nhung ai da dang nhap
    if (Checking(req.body.oldpassword) || Checking(req.body.password) || Checking(req.body.conficpassword)){
      req.flash("messagesFail", "ChangePassword is fail !!!");
      res.redirect("/changepassword");
    } else {
      var userchange = new objectUser(req.session.user.IdUser ,req.session.user.Username,
           req.session.user.Password, req.session.user.Firstname, req.session.user.Lastname, req.session.Email, req.session.user.Address,
           req.session.user.Days,req.session.user.Permission, req.session.user.Positiverating,
           req.session.user.Negativerating, req.session.user.Imgurl, req.session.user.Deadlineseller);
       if(userchange.validPassword(req.body.oldpassword)) {
         userchange.SettingPassword(userchange.encryptPassword(req.body.password));
         userDB.changepassword(userchange).then(function (rows) {
           req.session.user = userchange;
           req.flash("messagesSuccess", "Password is changed !");
           res.redirect("/changepassword");
         }).fail(function (err) {
           req.flash("messagesFail", "Password change fail ! Please try again");
           res.redirect("/changepassword");
         });
       } else {
         req.flash("messagesFail", "Old Password Incorrect !!!");
         res.redirect("/changepassword");
       }
    }
  },
  registerPage: function (req, res) {
    res.render("_featureWEB/register", {
        user: req.session.user,
        successMess : res.locals.Success,
        FailMess : res.locals.Fail,
        layout: "applicationnoHeader"
    });
  },
  loginPage: function (req, res) {
    res.render("_featureWEB/loginusers", {
        successMess : res.locals.Success,
        FailMess : res.locals.Fail,
        layout: "applicationnoHeader"
    });
  },
  changeInformation: function (req, res) {
    if (Checking(req.body.email) || Checking(req.body.first_name) || Checking(req.body.last_name) || Checking(req.body.address)){
      req.flash("messagesFail", "Update profile is fail !!!");
      res.redirect("/profile");
    } else {
        var userchange = new objectUser(req.session.user.IdUser ,req.session.user.Username,
          req.session.user.Password, req.body.first_name, req.body.last_name, req.body.email, req.body.address,
          req.session.user.Days,req.session.user.Permission, req.session.user.Positiverating,
          req.session.user.Negativerating, req.session.user.Imgurl, req.session.user.Deadlineseller);
        var objects = {
          Userid : req.session.user.IdUser,
          email: req.body.email,
          name: req.body.first_name + ' ' +req.body.last_name,
          address: req.body.address
        }
        userDB.UpdateUser(objects).then(function () {
          req.session.user = userchange;
          req.flash("messagesSuccess", "Update is Success !");
          res.redirect("/profile");
        }).fail(function (err) {
          req.flash("messagesFail", "Update is Fail");
          res.redirect("/profile");
        })
    }
  },
  testingCallback: function (req, res, next) {
      Qs.all([userDB.Testing1(), userDB.Testing2()]).spread(function (a, b) {
          console.log(a);
          console.log("=================");
          console.log(b);
      });
  }
  // chi la test callback ma thoi
}
module.exports = userController;
