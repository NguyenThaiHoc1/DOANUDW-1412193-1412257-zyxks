var profileDb = require("../models/profile.js");
var Qs = require("q");
var handle = require('handlebars'); // --- module mới dùng để xử lý helpers

var totalRec = 0,

pageSize  = 2;

pageCount = 0;

var start       = 0;

var currentPage = 1;

var profileController = {
  Defaultpage : function (req, res) {
    var username = req.session.user.Username;
    var expireDate = req.session.user.Deadlineseller;
    var permission = req.session.user.Permission;
    Qs.all([profileDb.isWaitingForPermission(username), profileDb.isDenied(username)])
      .spread(function (rslt1, rslt2) {
        var currentTime = new Date();
        expireDate = new Date(Date.parse(expireDate));
        var isUser = (permission === 'user') ? 1 : 0;
        var isExpired = (expireDate !== undefined && currentTime > expireDate) ? 1 : 0;
        var isWaitingForPermission = rslt1;
        var isDenied = rslt2;
        res.render("_profile/profiletest", {
          user: req.session.user,
          successMess : res.locals.Success,
          FailMess : res.locals.Fail,

          username: username,
          expireDate: expireDate,
          isUser: isUser,
          isExpired: isExpired,
          isWaitingForPermission: rslt1,
          isDenied: rslt2,
          isAbleToRequest: ((isUser || isExpired) && !rslt1),

          layout: "applicationnoHeader", // layout for profile Page
          helpers: {
            foo: function(a,b) {}
          }
        });
    });
  },
  wishlistUserPage : function (req, res) {
    profileDb.getWishlistbyID(req.session.user.IdUser).then(function (temp1) {
        totalRec      = temp1.length;
        pageCount     =  Math.ceil(totalRec /  pageSize);
        if (typeof req.query.page !== 'undefined') {
          currentPage = req.query.page;
        }
        if(currentPage >= 1){
          start = (currentPage - 1) * pageSize;
        }
        profileDb.getWishlistbylimitID(req.session.user.IdUser, start, pageSize).then(function (data) {
          res.render("_profile/profilewishlist",{
              user: req.session.user,
              wishlist: data,
              layout: "applicationnoHeader",
              helpers: {
                foo: function () {
                  var html = '';
                  html += '<li><a href="/profile/wishlist?page='+ 1 + '" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
                  for (var i = 1; i <= pageCount; i++) {
                      if(currentPage == i) {
                        html += '<li class="active"><a href= "/profile/wishlist?page='+ i +'">' + i + ' </a></li>';
                      }else {
                        html += '<li><a href= "/profile/wishlist?page='+ i +'">' + i + ' </a></li>';
                      }
                  }
                  html += '<li><a href="/profile/wishlist?page='+ pageCount + '" aria-label="Previous"><span aria-hidden="true">&raquo;</span></a></li>';
                  return new handle.SafeString(html);
                },
                trimString: function (passedString) {
                  var theString = passedString.substring(0,20);
                  if(passedString.length <= 20){
                    return new handle.SafeString(passedString);
                  } else {
                    return new handle.SafeString(theString + "...");
                  }
                }
              }
          });
        });

    });

  },
  historyauctionPage : function (req, res) {
    profileDb.getHistoryaucbyID(req.session.user.IdUser).then(function (temp1) {
        totalRec      = temp1.length;
        pageCount     =  Math.ceil(totalRec /  pageSize);
        if (typeof req.query.page !== 'undefined') {
          currentPage = req.query.page;
        }
        if(currentPage >= 1){
          start = (currentPage - 1) * pageSize;
        }
        profileDb.getHistoryaucbylimitID(req.session.user.IdUser, start, pageSize).then(function (data) {
          res.render("_profile/profilehistoryAuc",{
              user: req.session.user,
              historyAuction: data,
              layout: "applicationnoHeader",
              helpers: {
                foo: function () {
                  var html = '';
                  html += '<li><a href="/profile/historyauction?page='+ 1 + '" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
                  for (var i = 1; i <= pageCount; i++) {
                      if(currentPage == i) {
                        html += '<li class="active"><a href= "/profile/historyauction?page='+ i +'">' + i + ' </a></li>';
                      }else {
                        html += '<li><a href= "/profile/historyauction?page='+ i +'">' + i + ' </a></li>';
                      }
                  }
                  html += '<li><a href="/profile/historyauction?page='+ pageCount + '" aria-label="Previous"><span aria-hidden="true">&raquo;</span></a></li>';
                  return new handle.SafeString(html);
                },
                trimString: function (passedString) {
                  var theString = passedString.substring(0,20);
                  if(passedString.length <= 20){
                    return new handle.SafeString(passedString);
                  } else {
                    return new handle.SafeString(theString + "...");
                  }
                },
                checkingDeadline: function (stringDays) {
                  var html = '';
                  if(stringDays === 'This Finish'){
                      html = '<span style="color:red">'+ stringDays +'</span>';
                  }else {
                      html = '<span style="color:blue">'+ stringDays +'</span>';
                  }
                  return new handle.SafeString(html);
                }
              }
          });
        });

    });
  },
  historyvictoryPage : function (req, res) {
    res.render("_profile/profilehistoryvictory",{
        user: req.session.user,
        layout: "applicationnoHeader"
    });
  }
}

module.exports = profileController;
