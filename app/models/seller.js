var db = require("./database.js");
var q = require('q');

var seller = {
    // * chua xong : de mac dinh la 21
    GetAuctionPosted: function (idUser) {
      var d = q.defer();
      var sql = 'select b.startprice, b.image1 ,b.sku , b.proname, b.tinydes, b.fulldes, b.warranty, b.datepost, b.datefinish, b.step, b.beatprice, b.sellerid, b.proid, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\') sogiay,\
                  case\
                            when a.price is null then b.startprice \
                            when a.price is not null then a.price\
                  end as priceAuction, \
                  case \
                            when a.userid is null then "No Bid"\
                            when a.userid is not null then a.userid\
                  end as userBid, \
                  case \
                             when  (select count(*)  \
                             from bidhistory history\
                             where history.productid = b.proid\
                             group by history.productid) is null then 0\
                           when  (select count(*)  \
                             from bidhistory history\
                             where history.productid = b.proid\
                             group by history.productid) is not null then (select count(*)  \
                                                 from bidhistory history\
                                                 where history.productid = b.proid\
                                                 group by history.productid)\
                  end as soluotdaugia\
                  from bidhistory a right join product b on a.productid = b.proid\
                  where b.sellerid = ? and not exists (\
                              select *\
                                          from bidhistory c\
                              where c.productid = a.productid\
                                          and a.userid = c.userid\
                                          and  exists(\
                                        select * \
                                                              from bidhistory e \
                                                              where e.productid = c.productid\
                                                              and a.price < e.price\
                                    )\
                         )\
                  group by b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\'), a.price, a.userid\
                  order by b.datepost DESC; ';
      db.query(sql,[idUser], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    Getinfoproduct: function (idProduct) {
      var d = q.defer();
      var sql = 'select * from product where proid = ?';
      db.query(sql, [idProduct], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    SaveDetail: function (Objec) {
      var d = q.defer();
      var sql = 'Update product set fulldes = ? where proid = ?';
      db.query(sql, [Objec.fulldetail, Objec.productID], function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    getCatogory: function () {
      var d = q.defer();
      var sql = 'select catid, catname from category where active = 1;';
      db.query(sql, function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    GetUserInformation: function(userid) {
      var d = q.defer();
      var sql = 'select * from user where f_id=?';
      db.query(sql, [userid],function (error, results) {
        if (error){
          d.reject(error);
        }
        results[0].isSeller = false;
        var now = new Date();
        if (results[0].f_deadlineseller && results[0].f_deadlineseller > now)
          results[0].isSeller = true;
        d.resolve(results);

        if (!results[0].isSeller) {
          sql = "update user set f_permission='user' where f_id=?";
          db.query(sql, [userid], function (err,rslt) {
            if (err)
              d.reject(err);
          })
        }
      });
      return d.promise;
    }
}

module.exports = seller;
