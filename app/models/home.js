var q = require('q');
var db = require("./database.js");
var home = {
    top5bestprice : function () {
      var d = q.defer();
      var sql = 'select b.image1, b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\') sogiay, b.datepost,\
                  case\
                            when a.price is null then b.startprice \
                            when a.price is not null then a.price\
                  end as priceAuction, \
                  case \
                            when a.userid is null then "No Bid"\
                            when a.userid is not null then (select f_Name from dackweb.user where f_ID = a.userid)\
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
                  from bidhistory a right join product b on a.productid = b.proid, dackweb.category cato\
                  where b.catid = cato.catid and cato.active = 1 \
                  and not exists( select * \
                          from favorite favo\
                                  where favo.idproduct = b.proid and favo.iduser = a.userid)\
                  and not exists (\
                              select *\
                                          from bidhistory c\
                              where c.productid = a.productid\
                                          and a.userid = c.userid\
                                          and not exists(select * \
                        from favorite favo\
                        where favo.idproduct = c.productid and favo.iduser = c.userid)\
                                          and  exists(\
                                        select * \
                                                              from bidhistory e \
                                                              where e.productid = c.productid\
                                                              and a.price < e.price\
                                                              and not exists( select * \
                                from favorite favo\
                                where favo.idproduct = e.productid and favo.iduser = e.userid)\
                              )\
                         )\
                  group by b.proid, b.proname, b.tinydes, TIMESTAMPDIFF(Second , now() , b.datefinish), a.price, a.userid\
                  order by \
                  case\
                      when a.price is null then b.startprice \
                      when a.price is not null then a.price\
                  end DESC\
                  LIMIT 0 , 5;';
      db.query(sql,function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    top5mostauctionbid : function () {
      var d = q.defer();
      var sql = 'select b.image1, b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\') sogiay, b.datepost,\
                  case\
                            when a.price is null then b.startprice \
                            when a.price is not null then a.price\
                  end as priceAuction, \
                  case \
                            when a.userid is null then "No Bid"\
                            when a.userid is not null then (select f_Name from dackweb.user where f_ID = a.userid)\
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
                  from bidhistory a right join product b on a.productid = b.proid, dackweb.category cato\
                  where b.catid = cato.catid and cato.active = 1 \
                  and not exists( select * \
                          from favorite favo\
                                  where favo.idproduct = b.proid and favo.iduser = a.userid)\
                  and not exists (\
                              select *\
                from bidhistory c\
                              where c.productid = a.productid\
                and a.userid = c.userid\
                and not exists( select * \
                        from favorite favo\
                        where favo.idproduct = c.productid and favo.iduser = c.userid)\
                and  exists(\
                        select * \
                        from bidhistory e \
                        where e.productid = c.productid\
                        and a.price < e.price\
                        and not exists( select * \
                                from favorite favo\
                                where favo.idproduct = e.productid and favo.iduser = e.userid)\
                      )\
          )\
                  group by b.proid, b.proname, b.tinydes, TIMESTAMPDIFF(Second , now() , b.datefinish), a.price, a.userid\
                  order by \
                  case \
                           when  (select count(*)  \
                             from bidhistory history\
                             where history.productid = b.proid\
                             group by history.productid) is null then 0\
                           when  (select count(*)  \
                             from bidhistory history \
                             where history.productid = b.proid\
                             group by history.productid) is not null then (select count(*)  \
                                                 from bidhistory history\
                                                 where history.productid = b.proid \
                                                 group by history.productid) \
                  end  DESC \
                  LIMIT 0 , 5;';
      db.query(sql,function (error, results) {
        if (error){
          d.reject(error);
        }
        d.resolve(results);
      });
      return d.promise;
    },
    top5cometoend : function () {
      var d = q.defer();
      var sql = 'select b.image1, b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\') sogiay,b.datepost,\
                  case\
                            when a.price is null then b.startprice \
                            when a.price is not null then a.price\
                  end as priceAuction, \
                  case \
                            when a.userid is null then "No Bid"\
                            when a.userid is not null then (select f_Name from dackweb.user where f_ID = a.userid)\
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
                  from bidhistory a right join product b on a.productid = b.proid, dackweb.category cato\
                  where TIMESTAMPDIFF(Second , now() , b.datefinish) > 0 and b.catid = cato.catid \
                  and cato.active = 1 \
                  and not exists( select * \
                          from favorite favo\
                                  where favo.idproduct = b.proid and favo.iduser = a.userid)\
                  and not exists (\
                              select *\
                                          from bidhistory c\
                              where c.productid = a.productid\
                                          and a.userid = c.userid\
                                          and not exists(select * \
                        from favorite favo\
                        where favo.idproduct = c.productid and favo.iduser = c.userid)\
                                          and  exists(\
                                        select * \
                                                              from bidhistory e \
                                                              where e.productid = c.productid\
                                                              and a.price < e.price\
                                                              and not exists( select * \
                                from favorite favo\
                                where favo.idproduct = e.productid and favo.iduser = e.userid)\
                              )\
                         )\
                  group by b.proid, b.proname, b.tinydes, TIMESTAMPDIFF(Second , now() , b.datefinish), a.price, a.userid\
                  order by TIMESTAMPDIFF(Second , now() , b.datefinish) ASC \
                  LIMIT 0 , 5;';
      db.query(sql,function (error, results) {
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
    }
}
module.exports = home;
