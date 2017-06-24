var q = require('q');
var db = require("./database.js");
var mustache = require('mustache');
var item = {
  loadWithID : function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
    var sql = mustache.render('select * from product where proid = {{proID}}',obj);
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      results[0].datepost = results[0].datepost.toLocaleString("en-GB");
      results[0].datefinish = results[0].datefinish.toLocaleString("en-GB");
      d.resolve(results[0]);
    });
    return d.promise;
  },
  loadSellerInfo : function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
    var sql = mustache.render('SELECT user.f_ImageUrl, user.f_Username, user.f_Name, user.f_Email  FROM product,user where product.sellerid = user.f_ID and proid = {{proID}}',obj);
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results[0]);
    });
    return d.promise;
  },
  loadHighestBuyerInfo : function (proId) {
    var d = q.defer();
    var sql = 'select b.f_ImageUrl ,b.f_Name, a.price, f.step from bidhistory a, user b ,product f\
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
  loadTotalItemSeller : function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
    var sql = mustache.render('SELECT count(proid) as totalitems FROM product where sellerid in (select sellerid from product where proid = {{proID}})',obj);
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results[0]);
    });
    return d.promise;
  },
  loadTotalPersonBid : function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
    var sql = mustache.render('select count(userid) as count from bidhistory where productid = {{proID}}',obj);
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results[0]);
    });
    return d.promise;
  },
  loadBidHistory : function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
      var sql = 'SELECT user.f_Name, bidhistory.timebid, bidhistory.price \
                FROM bidhistory, user \
                where bidhistory.productid = ?\
                and bidhistory.userid = user.f_ID\
                and not exists( select * \
                				from favorite favo\
                                where favo.idproduct = ? and favo.iduser = user.f_ID\
                			   )\
                order by timebid desc;';
      db.query(sql, [proId, proId], function (error, results) {
      if (error){
        d.reject(error);
      }
      for (var i = 0;i< results.length;i++){
        results[i].timebid = results[i].timebid.toLocaleString("en-GB");
      }
      d.resolve(results);
    });
    return d.promise;
  },
  loadComment : function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
    var sql = mustache.render('SELECT user.f_ImageUrl ,user.f_Name, comment.datepost, comment.content FROM comment, user where productid = {{proID}} and comment.userid = user.f_ID order by datepost desc',obj);
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      for (var i = 0;i< results.length;i++){
        results[i].datepost = results[i].datepost.toLocaleString("en-GB");
      }
      d.resolve(results);
    });
    return d.promise;
  },
  getMaxBidAndStep : function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
    var sql = 'SELECT step, max(price) as maxprice, startprice, count(*) as bidcount \
    FROM bidhistory, product \
    where bidhistory.productid = ? and product.proid = bidhistory.productid\
    and not exists (select * from dackweb.favorite favo\
				where favo.idproduct = ? and bidhistory.userid = favo.iduser);';
    db.query(sql, [proId, proId], function (error, results) {
      if (error){
        d.reject(error);
      }
      if (results[0].maxprice == null){
          results[0].maxprice =results[0].startprice;
      }
      d.resolve(results[0]);
    });
    return d.promise;
  },
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
  addComment: function (userid, productid, content, datepost) {
      var d = q.defer();
      var sql = 'insert into comment (userid, productid, content, datepost) values (?, ?, ?, ?);';
      db.query(sql, [userid, productid, content, datepost],function (error, results) {
          if (error){
              d.reject(error);
          }
          d.resolve(results);
      });
      return d.promise;
  },
  bid: function (userid, productid, price, timebid) {
    var d = q.defer();
    var sql = 'insert into bidhistory (userid, productid, price, timebid) values (?, ?, ?, ?);';
    db.query(sql, [userid, productid, price, timebid],function (error, results) {
        if (error){
            d.reject(error);
        }
        d.resolve(results);
    });
    return d.promise;
  },
  loadingUserBuyer: function (proId) {
    var d = q.defer();
    var obj = {
      proID: proId
    };
    var sql = 'SELECT distinct bidhistory.productid, user.f_ID, user.f_ImageUrl, \
              user.f_Username, user.f_Name, user.positiverating, \
              user.negativerating, DATE_FORMAT(user.f_DOB,\'%Y-%m-%d\') sogiay ,\
              case \
				when (not exists (select * from dackweb.favorite favo\
              				where favo.idproduct = ? and favo.iduser = user.f_ID)) = true then \'0\'\
				when (not exists (select * from dackweb.favorite favo\
              				where favo.idproduct = ? and favo.iduser = user.f_ID)) = false then \'1\'\
			  end state_User\
              FROM bidhistory, user \
              where bidhistory.productid = ?\
              and bidhistory.userid = user.f_ID;';
    db.query(sql,[proId, proId, proId], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  eliminateUserDB: function (Objective) {
    var d = q.defer();
    var sql = 'insert into dackweb.favorite(idproduct, iduser) values (?, ?);';
    db.query(sql, [Objective.idproductblock, Objective.iduserblock], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  unlockAccount: function (Objective) {
    var d = q.defer();
    var sql = 'delete from dackweb.favorite where idproduct = ? and iduser = ?';
    db.query(sql, [Objective.idproductblock, Objective.iduserblock], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  getEmailUser: function (UserID) {
    var d = q.defer();
    var sql = 'select * from dackweb.user where f_ID = ?';
    db.query(sql, [UserID], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  },
  CheckingUserBlock: function (ProID, UserID) {
    var d = q.defer();
    var sql = 'select * from dackweb.user a, favorite b where a.f_ID = b.iduser and b.idproduct = ? and a.f_ID = ?;';
    db.query(sql, [ProID, UserID], function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results);
    });
    return d.promise;
  }
};

module.exports = item;
