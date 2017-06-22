var aboutController = {
    Defaultpage : function (req, res) {
      res.render("about", {
          user: req.session.user,
          checkingSeller: (req.session.user.Permission === 'seller') ? true : undefined,
          layout: "application"
      });
    }
}

module.exports = aboutController;
