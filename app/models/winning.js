var db = require("./database.js");
var q = require('q');


var winning = {
    CheckingAllProduct: function () {
        var d = q.defer();
        var sql = 'select b.proid, b.proname, a.f_ID, a.f_Email\
                  from dackweb.product b, dackweb.user a\
                  where  b.sellerid = a.f_ID and TIMESTAMPDIFF(Second , now() , b.datefinish) >=  0 and TIMESTAMPDIFF(Second , now() , b.datefinish) <= 5';
        db.query(sql, function (error, results) {
          if (error){
            d.reject(error);
          }
          d.resolve(results);
        });
        return d.promise;
    },
    loadHighestBuyerInfo : function (proId) {
      var d = q.defer();
      var sql = 'select b.f_ID, b.f_Email, b.f_ImageUrl ,b.f_Name, a.price, f.step \
                    from bidhistory a, user b ,product f\
                    where a.userid = b.f_ID and f.proid = a.productid\
                    and a.productid = ?\
                    and not exists (select * from dackweb.favorite favo\
  				          where favo.idproduct = ? and a.userid = favo.iduser)\
                    and a.price >= ( select max(c.price) \
  				                            from bidhistory c \
                                      where c.productid = ?\
                                      and not exists (select * from dackweb.favorite favo\
  								                                    where favo.idproduct = ? and c.userid = favo.iduser)\
                );';
      db.query(sql,[proId, proId, proId, proId], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    writeWinning: function (proID, userID) {
      var d = q.defer();
      var sql = 'insert into winning(idproduct, iduser) values (?, ?)';
      db.query(sql,[proID, userID], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    }
}

module.exports = winning;
