var q = require('q');
var db = require("./database.js");

var wishlist = {
    checkingByID: function (idItem, idUser) {
      var d = q.defer();
      var sql = 'select * from watchlist where productid = ? and userid = ?';
      db.query(sql, [idItem, idUser],function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    additemwishlistByID: function (idItem, idUser) {
      var d = q.defer();
      var sql = 'insert into watchlist (productid, userid) values (?, ?);';
      db.query(sql, [idItem, idUser],function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    }
}
module.exports = wishlist;
