var db = require("./database.js");
var q = require('q');
var emailer = require('../Object/Emailer.js');

var beatprice = {
    getProductByID: function (productiD) {
      var d = q.defer();
      var sql = 'select * from product where proid = ?';
      db.query(sql, [productiD], function (err, datas) {
        if (err){
          d.reject(err);
        }
        d.resolve(datas);
      });
      return d.promise;
    },
    bid: function (OBSx) {
      var d = q.defer();
      var sql = 'select * from bidhistory a, user b where a.userid = b.f_ID and a.productid = ? order by a.price DESC;';
      db.query(sql, [OBSx.productid], function (err, datas) {
        if (err){
          d.reject(err);
        }
        if(datas.length > 0) {
          var contentEmail = 'This Product ' + OBSx.Proname + ' is beated !! You Loose';
          var SendEmailsx = new emailer(datas[0].f_Email, contentEmail);
          SendEmailsx.SendEmail();
          var sql1 = "insert into bidhistory (userid, productid, price, timebid) values (?, ?, ?, ?);";
          db.query(sql1, [OBSx.userid, OBSx.productid, OBSx.beatprice, OBSx.timeBID],function (error, results) {
            if (error){
              d.reject(error);
            }
            d.resolve(results);
          });
        } else {
          // nguoc lai chua co ai dau gia
          var sql1 = "insert into bidhistory (userid, productid, price, timebid) values (?, ?, ?, ?);";
          db.query(sql1, [OBSx.userid, OBSx.productid, OBSx.beatprice, OBSx.timeBID],function (error, results) {
            if (error){
              d.reject(error);
            }
            d.resolve(results);
          });
        }

      })
      return d.promise;
    },
    updateProduct: function (OBSx) {
      var d = q.defer();
      var sql = 'Update product set datefinish = ? where proid = ?';
      db.query(sql, [OBSx.timeBID1, OBSx.productid], function (err, datas) {
        if (err){
          d.reject(err);
        }
        d.resolve(datas);
      });
      return d.promise;
    }
}

module.exports = beatprice;
