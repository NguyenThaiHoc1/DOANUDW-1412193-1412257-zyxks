var DangDauGiaController = {
  Defaultpage : function (req, res) {
    res.render("_featureWEB/DangDauGiaPage", {
        layout: "application"
    });
  }
}

module.exports = DangDauGiaController;
