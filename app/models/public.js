var db = require("./database.js");
var q = require('q');

var publics = {
    CheckUser: function (username) {
      var d = q.defer();
      var sql = 'select * from user where f_Username = ?';
      db.query(sql, [username], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    Counterlistcommit: function (idProcess) {
      var d = q.defer();
      var sql = 'select * \
                  from CommentDanhGia a\
                  where a.userid1 = ?;';
      db.query(sql, [idProcess], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    ListComment: function (idProcess, start, end) {
      var d = q.defer();
      var sql = 'select *, \
                  (select f_Name from dackweb.user where f_ID = a.userid1) as Userid1,\
                  (select f_Name from dackweb.user where f_ID = a.userid2) as Userid2\
                  from CommentDanhGia a, product b\
                  where a.productid = b.proid and userid2 = ?\
                  LIMIT ?, ?;';
      db.query(sql, [idProcess, start, end], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    }
}

module.exports = publics;
