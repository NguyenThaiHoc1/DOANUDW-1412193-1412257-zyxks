var wishlistDB = require("../models/wishlist.js");

var wishlistController = {
  additemwishlist : function (req, res) {
      var idItem = req.body.idItem.idItem;
      var idUser = req.session.user.IdUser;

      wishlistDB.checkingByID(idItem, idUser).then(function (data) {
          if(data.length > 0) {
            res.send({"messagesFail": 'This Item has had in wishlist !'});
          }
          else {
              wishlistDB.additemwishlistByID(idItem, idUser).then(function () {
                res.send({"messagesSuccess": 'Item add success !'});
              }).fail(function (err) {
                console.log(err);
                res.end('fail');
              });
          }
      });
  },
  deletewishlist : function (req, res) {

  },
  showwishlistByUserid : function (req, res) {

  }
}

module.exports = wishlistController;
