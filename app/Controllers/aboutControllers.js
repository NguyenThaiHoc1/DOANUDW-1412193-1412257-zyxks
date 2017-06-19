var aboutController = {
    Defaultpage : function (req, res) {
      res.render("about", {
          user: req.session.user,
          layout: "application"
      });
    }
}

module.exports = aboutController;
