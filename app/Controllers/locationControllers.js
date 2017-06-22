var locationController = {
    Defaultpage : function (req, res) {
      var usersx;
      if(req.session.user === undefined) {
          usersx = undefined;
      }else {
        usersx = (req.session.user.Permission === 'seller') ? true : undefined;
      }
      res.render("storelocation", {
          user: req.session.user,
          checkingSeller: usersx,
          layout: "applicationnoHeader"
      });
    }
}

module.exports = locationController;
