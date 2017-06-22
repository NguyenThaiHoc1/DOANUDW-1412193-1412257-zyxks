var locationController = {
    Defaultpage : function (req, res) {
      res.render("storelocation", {
          user: req.session.user,
          checkingSeller: (req.session.user.Permission === 'seller') ? true : undefined,
          layout: "applicationnoHeader"
      });
    }
}

module.exports = locationController;
