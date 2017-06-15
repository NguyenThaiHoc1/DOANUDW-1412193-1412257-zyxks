var db = require("./database.js");
var q = require('q');

var profile = {
  getWishlistbyID: function (id) {
    // - lay tat cac cac wishlist cua 1 id nao do
    var d = q.defer();
    var sql = 'select * from watchlist where userid = ?;';
    db.query(sql, [id], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  getWishlistbylimitID: function (idUser, start, pageSize) {
    // - lay khoang [start, pageSize] cua 1 id nao do
    var d = q.defer();
    var sql = 'select c.DateAdd, b.image1, b.proid, b.proname, b.tinydes, TIMESTAMPDIFF(Second , now() , b.datefinish) sogiay,\
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
                    					 from dackweb.bidhistory history\
                    					 where history.productid = b.proid\
                    					 group by history.productid) is null then 0\
                    			   when  (select count(*)  \
                    					 from dackweb.bidhistory history\
                    					 where history.productid = b.proid\
                    					 group by history.productid) is not null then (select count(*)  \
                    															 from dackweb.bidhistory history\
                    															 where history.productid = b.proid\
                    															 group by history.productid)\
                    end as soluotdaugia\
                    from dackweb.watchlist c left join dackweb.product b on b.proid = c.productid left join dackweb.bidhistory a on a.productid = b.proid\
                    where c.userid = ?\
                    and not exists (\
                    						select *\
                                            from dackweb.bidhistory c\
                    						where c.productid = a.productid\
                                            and a.userid = c.userid\
                                            and  exists(\
                    											select * \
                                                                from dackweb.bidhistory e \
                                                                where e.productid = c.productid\
                                                                and a.price < e.price\
                    									)\
                    			 )\
                    group by c.DateAdd, b.proid, b.proname, b.tinydes, TIMESTAMPDIFF(Second , now() , b.datefinish), a.price, a.userid\
                    order by c.DateAdd ASC\
                    LIMIT ?, ?';
    db.query(sql,[idUser, start, pageSize], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  productAuc: function (id, start, end) {

  },
  victory: function (id, start, end) {

  }
}

module.exports = profile;
