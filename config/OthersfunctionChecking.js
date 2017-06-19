var functionCheck = {
  isLoggedInChecking: function(req, res, next) { // cai nay dung de cho phep dau gia khi chua cho phep
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    //res.redirect('/user/signin'); dung de chuyen trang di dau
  },
  isLoggedIn : function (req, res, next) {
    // neu nhu chua dang nhap thi dang nhap
    if (req.session.user !== undefined){
      return next();
    }else {
      if(req.body.ajax !== undefined){
        req.flash("messagesFail", "Please Login After Add Wishlist");
        res.send({redirect: '/login'});
      }
      else {
        res.redirect('/login');
      }
    }
  },
  isLoggedLong : function (req, res, next) { // neu nhu da dang nhap roi thi ....
    if (req.session.user !== undefined){
      res.redirect('/profile');
    }else {
      return next();
    }
  }
}

module.exports = functionCheck;
