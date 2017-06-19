var userDB = require("../models/user.js");
var adminDB = require("../models/admin.js");
var querystring = require('querystring');
var Qs = require('q');
var request = require('request');
var objectUser = require("../Object/userObject.js");


function Checking(value) {
  var resulf = value === undefined || value.trim() === "" || value.length === 0;
  return resulf;
}

var adminControllers = {
  adminLogin: function (req, res) {
      // khuc nay viet dang nhap
      // kiem tra xem co bi hack hay ko
      if (Checking(req.body.fusername) || Checking(req.body.fpassword)){
        req.flash("messagesFail", "LogIn is fail !!!");
        res.redirect("/admin");
      } else {
        userDB.findbyUserName(req.body.fusername).then(function (rows) {
            if(rows.length > 0) {
              var fullname = rows[0].f_Name.split(' ');
              var Firstname = fullname[0];
              var Lastname = fullname[fullname.length - 1];
                                           // username, password, first_name, last_name, email, address, day, permission
              var newuser = new objectUser(rows[0].f_ID, rows[0].f_Username, rows[0].f_Password, Firstname, Lastname, rows[0].f_Email, rows[0].f_Address, rows[0].f_DOB, rows[0].f_Permission, rows[0].positiverating, rows[0].negativerating, rows[0].f_ImageUrl);
              if(newuser.validPassword(req.body.fpassword) && rows[0].f_Permission=='admin') {
                  req.session.admin = newuser;
                  res.redirect("/admin");
              } else {
                req.flash("messagesFail", "Login is failed!");
                res.redirect("/admin");
              }
            }
            else {
              req.flash("messagesFail", "Username doesn't exist");
              res.redirect("/admin");
            }
        })
      }
  },
  adminLogout: function (req, res) {
    // user destroy
    req.session.destroy(); // huy session hien tai
    res.redirect('/');
  },
  acceptSellRequest: function (req, res) {
    if (req.session.admin === undefined) {
      res.redirect('/admin');
      return;
    }
    adminDB.AcceptSellRequest(req.query.f_Username).then(function (rows) {
      res.redirect('/admin');
    });
  },
  denySellRequest: function (req, res) {
    if (req.session.admin === undefined) {
      res.redirect('/admin');
      return;
    }
    adminDB.DenySellRequest(req.query.f_Username).then(function (rows) {
      res.redirect('/admin');
    });
  },
  changeCategoryState: function (req, res) {
    if (req.session.admin === undefined) {
      res.redirect('/admin');
      return;
    }
    adminDB.ChangeCategoryState(req.query.f_Catname_ChangeState).then(function (rows) {
      res.redirect('/admin');
    });
  },
  addCategory: function (req, res) {
    if (req.session.admin === undefined) {
      res.redirect('/admin');
      return;
    }
    adminDB.AddCategory(req.query.f_Catname_Add).then(function (rows) {
      res.redirect('/admin');
    })
  },
  editCategoryName: function (req, res) {
    if (req.session.admin === undefined) {
      res.redirect('/admin');
      return;
    }
    adminDB.EditCategoryName(req.query.f_Old_Catname,req.query.f_New_Catname).then(function (rows) {
      res.redirect('/admin');
    })
  },
  resetPassword: function (req, res) {
    if (req.session.admin === undefined) {
      res.redirect('/admin');
      return;
    }
    adminDB.ResetPassword(req.query.f_Username).then(function (rows) {
      res.redirect('/admin');
    })
  },
  changeUserState: function (req, res) {
    if (req.session.admin === undefined) {
      res.redirect('/admin');
      return;
    }
    adminDB.ChangeUserState(req.query.f_Username).then(function (rows) {
      res.redirect('/admin');
    })
  },
  Defaultpage: function (req, res) {
    if (req.session.admin === undefined) {
      res.render("_featureWEB/loginAdmin", {
          successMess : res.locals.Success,
          FailMess : res.locals.Fail,
          layout : false
      });
    }
    else {
      Qs.all([adminDB.FindSellRequest(), adminDB.LoadUser(),adminDB.LoadCategory()])
        .spread(function (users_request_rows, users_all_rows, categories_rows) {
        var vm = {
          users_request: users_request_rows,
          users_all: users_all_rows,
          categories: categories_rows,
          layout: false
        }
        res.render("_admin/admin", vm); 
      });
      /*
      adminDB.FindSellRequest().then(function(rows) {
        var vm = {
          users: rows,
          layout: false
        }
        res.render("_admin/admin", vm);
      });
      */
    };
  },
};
module.exports = adminControllers;