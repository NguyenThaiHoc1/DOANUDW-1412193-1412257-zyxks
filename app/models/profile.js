var db = require("./database.js");
var q = require('q');

var profile = {
  findbyUserName: function (username) {
    var d = q.defer();
    var sql = 'select * from user where f_Username = ? and f_Permission != \'admin\';';
    db.query(sql, [username],function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
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
  getHistoryaucbyID: function (id) {
    // ta se ghi lai lich su bid cua 1 id nao do trong bang bidhistory
    var d = q.defer();
    var sql = 'select * from bidhistory where userid = ?';
    db.query(sql, [id], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  getHistoryaucbylimitID: function (id, start, end) {
    // xuat thong tin san pham va gia da bid
    // 1 duong link den san pham (proid)
    // ten san pham (proname)
    // thoi gian ket thuc san pham (TIMESTAMPDIFF(Second , now() , b.datefinish))
    // thoi gian bid (timebid)
    // gia da bid luc do (price)
    //
    var d = q.defer();
    var sql = 'select b.image1, b.proid, b.proname, \
            Case \
            when TIMESTAMPDIFF(Second , now() , b.datefinish)  > 0 then b.datefinish\
            when TIMESTAMPDIFF(Second , now() , b.datefinish) <= 0 then \'This Finish\'\
            end as thoigian, a.timebid, a.price\
            from dackweb.bidhistory a, dackweb.product b \
            where a.productid = b.proid and a.userid = ?\
            LIMIT ?, ?;';
    db.query(sql, [id, start, end], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  isWaitingForPermission: function(username) {
    var d = q.defer();
    var sql = "select * from sellrequest,user where f_id=f_id_user and f_username=? and f_result is null";
    db.query(sql, [username], function(err, rslt) {
      if (err)
        d.reject(err);
      d.resolve(rslt.length);
    })
    return d.promise;
  },
  isDenied: function(username) {
    var d = q.defer();
    var sql = "select * from sellrequest,user where f_id=f_id_user and f_username=? order by f_time desc";
    db.query(sql, [username], function(err, rslt) {
      if (err)  {
        d.reject(err);
      }
      else {
        d.resolve(rslt);
      }
    });
    return d.promise;
  }
}

module.exports = profile;
