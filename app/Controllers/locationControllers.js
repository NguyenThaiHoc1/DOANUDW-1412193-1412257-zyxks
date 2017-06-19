var locationController = {
    Defaultpage : function (req, res) {
      res.render("storelocation", {
          user: req.session.user,
          layout: "applicationnoHeader"
      });
    }
}

module.exports = locationController;
