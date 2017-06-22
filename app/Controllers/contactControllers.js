var contactController = {
    Defaultpage : function (req, res) {
      res.render("contact", {
          user: req.session.user,
          checkingSeller: (req.session.user.Permission === 'seller') ? true : undefined,
          layout: "application"
      });
    }
}

module.exports = contactController;
