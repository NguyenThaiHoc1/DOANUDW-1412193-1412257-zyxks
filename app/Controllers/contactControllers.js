var contactController = {
    Defaultpage : function (req, res) {
      res.render("contact", {
          user: req.session.user,
          layout: "application"
      });
    }
}

module.exports = contactController;
