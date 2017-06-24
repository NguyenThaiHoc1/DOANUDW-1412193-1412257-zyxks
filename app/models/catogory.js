var db = require("./database.js");
var q = require('q');

var catogory = {
    getCatogory: function() {
        var d = q.defer();
        var sql = 'select catid, catname from category where active = 1;';
        db.query(sql, function(error, results) {
            if (error) {
                d.reject(error);
            }
            d.resolve(results);
        });
        return d.promise;
    },
    findCatogoryID: function(id) {
        var d = q.defer();
        var sql = 'select * from product a, category b where a.catid = b.catid and a.catid = ? and b.active = 1;';
        db.query(sql, [id], function(error, results) {
            if (error) {
                d.reject(error);
            }
            d.resolve(results);
        });
        return d.promise;
    },
    getPageNumber: function(start, pageSize, object, typePage) {
      var d = q.defer();

      if (typePage == 1) {
          if (object == 0) {

          } else {
              var sql1 = 'select b.image1, b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\') sogiay,\
                          case\
                                	  when a.price is null then b.startprice\
                                    when a.price is not null then a.price\
                          end as priceAuction,\
                          case\
                                	  when a.userid is null then "No Bid"\
                                    when a.userid is not null then (select f_Name from dackweb.user where f_ID = a.userid)\
                          end as userBid,\
                          case\
                                     when  (select count(*)\
                          					 from dackweb.bidhistory history\
                          					 where history.productid = b.proid\
                          					 group by history.productid) is null then 0\
                          			   when  (select count(*)\
                          					 from dackweb.bidhistory history\
                          					 where history.productid = b.proid\
                          					 group by history.productid) is not null then (select count(*)  \
                          															 from dackweb.bidhistory history\
                          															 where history.productid = b.proid\
                          															 group by history.productid)\
                          end as soluotdaugia\
                          from dackweb.bidhistory a right join dackweb.product b on a.productid = b.proid, dackweb.category cato\
                          where b.catid = ? and b.catid = cato.catid and cato.active = 1\
                          and not exists( select * \
                				  from favorite favo\
                                  where favo.idproduct = b.proid and favo.iduser = a.userid )\
                          and not exists (\
                          						select *\
                                                  from dackweb.bidhistory c\
                          						where c.productid = a.productid\
                                                  and a.userid = c.userid\
                                                  and not exists(select * \
											  from favorite favo\
											  where favo.idproduct = c.productid and favo.iduser = c.userid)\
                                                  and  exists(\
                          											select * \
                                                                      from dackweb.bidhistory e \
                                                                      where e.productid = c.productid\
                                                                      and a.price < e.price\
                                                                      and not exists( select * \
															  from favorite favo\
															  where favo.idproduct = e.productid and favo.iduser = e.userid)\
                              )\
                            )\
                          group by b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\'), a.price, a.userid\
                          order by \
                          case\
                          	  when a.price is null then b.startprice \
                              when a.price is not null then a.price\
                          end ASC\
                          LIMIT ? , ?;';
          }
      } else if (typePage == 0) {
          if (object == 0) {

          } else {
              var sql1 = 'select b.image1, b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\') sogiay,\
                          case\
                                	  when a.price is null then b.startprice\
                                    when a.price is not null then a.price\
                          end as priceAuction,\
                          case\
                                	  when a.userid is null then "No Bid"\
                                    when a.userid is not null then (select f_Name from dackweb.user where f_ID = a.userid)\
                          end as userBid,\
                          case\
                                     when  (select count(*)\
                          					 from dackweb.bidhistory history\
                          					 where history.productid = b.proid\
                          					 group by history.productid) is null then 0\
                          			   when  (select count(*)\
                          					 from dackweb.bidhistory history\
                          					 where history.productid = b.proid\
                          					 group by history.productid) is not null then (select count(*)\
                          															 from dackweb.bidhistory history\
                          															 where history.productid = b.proid\
                          															 group by history.productid)\
                          end as soluotdaugia\
                          from dackweb.bidhistory a right join dackweb.product b on a.productid = b.proid, dackweb.category cato\
                          where b.catid = ? and b.catid = cato.catid and cato.active = 1\
                          and not exists( select * \
                				  from favorite favo\
                                  where favo.idproduct = b.proid and favo.iduser = a.userid)\
                          and not exists (\
                          						select *\
                                                  from dackweb.bidhistory c\
                          						where c.productid = a.productid\
                                                  and a.userid = c.userid\
                                                  and not exists(select * \
											  from favorite favo\
											  where favo.idproduct = c.productid and favo.iduser = c.userid)\
                                                  and  exists(\
                          											select * \
                                                                      from dackweb.bidhistory e \
                                                                      where e.productid = c.productid\
                                                                      and a.price < e.price\
                                                                      and not exists( select * \
															  from favorite favo\
															  where favo.idproduct = e.productid and favo.iduser = e.userid)\
                              )\
                            )\
                          group by b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\'), a.price, a.userid\
                          LIMIT ? , ?;';
          }
      } else if (typePage == 2) {
          if (object == 0) {

          } else {
              var sql1 = 'select b.image1, b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\') sogiay,\
                          case\
                                	  when a.price is null then b.startprice\
                                    when a.price is not null then a.price\
                          end as priceAuction,\
                          case\
                                	  when a.userid is null then "No Bid"\
                                    when a.userid is not null then (select f_Name from dackweb.user where f_ID = a.userid)\
                          end as userBid,\
                          case\
                                     when  (select count(*)\
                          					 from dackweb.bidhistory history\
                          					 where history.productid = b.proid\
                          					 group by history.productid) is null then 0\
                          			   when  (select count(*)\
                          					 from dackweb.bidhistory history\
                          					 where history.productid = b.proid\
                          					 group by history.productid) is not null then (select count(*)\
                          															 from dackweb.bidhistory history\
                          															 where history.productid = b.proid\
                          															 group by history.productid)\
                          end as soluotdaugia\
                          from dackweb.bidhistory a right join dackweb.product b on a.productid = b.proid, dackweb.category cato\
                          where b.catid = ? and b.catid = cato.catid and cato.active = 1\
                          and not exists( select * \
                				  from favorite favo\
                                  where favo.idproduct = b.proid and favo.iduser = a.userid)\
                          and not exists (\
                          						select *\
                                                  from dackweb.bidhistory c\
                          						where c.productid = a.productid\
                                                  and a.userid = c.userid\
                                                  and not exists(select * \
																 from favorite favo\
																 where favo.idproduct = c.productid and favo.iduser = c.userid)\
                                                  and  exists(\
                          											select * \
                                                                      from dackweb.bidhistory e \
                                                                      where e.productid = c.productid\
                                                                      and a.price < e.price\
                                                                      and not exists( select * \
																					  from favorite favo\
																					  where favo.idproduct = e.productid and favo.iduser = e.userid)\
                                          )\
                          			 )\
                          group by b.proid, b.proname, b.tinydes, DATE_FORMAT(b.datefinish,\'%Y-%m-%d %H:%i:%s\'), a.price, a.userid\
                          order by \
                          case \
                                   when  (select count(*)  \
                          					 from dackweb.bidhistory history\
                          					 where history.productid = b.proid\
                          					 group by history.productid) is null then 0\
                          			   when  (select count(*)  \
                          					 from dackweb.bidhistory history \
                          					 where history.productid = b.proid\
                          					 group by history.productid) is not null then (select count(*)  \
                          															 from dackweb.bidhistory history\
                          															 where history.productid = b.proid \
                          															 group by history.productid) \
                          end  DESC \
                          LIMIT ? , ?;'
          }
      }
      db.query(sql1, [object, start, pageSize], function(err, data) {
          if (err) {
              d.reject(err);
          }
          d.resolve(data);
      });
      return d.promise;
    }
}

module.exports = catogory;
