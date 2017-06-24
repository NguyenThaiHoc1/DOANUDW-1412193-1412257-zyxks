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
    var obj = {
      proID: proId
    };
    var sql = mustache.render('select b.step, c.f_ImageUrl, c.f_Username, c.f_Name, \
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
                           when  (select count(*) \
                             from bidhistory history\
                             where history.productid = b.proid\
                             group by history.productid) is not null then (select count(*)  \
                                                 from bidhistory history\
                                                 where history.productid = b.proid\
                                                 group by history.productid)\
                  end as soluotdaugia\
                  from bidhistory a right join product b on a.productid = b.proid, dackweb.user c\
                  where a.userid = c.f_ID and b.proid = {{proID}} and not exists (\
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
                  order by \
                  case\
                      when a.price is null then b.startprice \
                      when a.price is not null then a.price\
                  end ASC;',obj);
    db.query(sql,function (error, results) {
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
    var sql = mustache.render('SELECT user.f_Name, bidhistory.timebid, bidhistory.price FROM bidhistory, user where bidhistory.productid = {{proID}} and bidhistory.userid = user.f_ID order by timebid desc',obj);
    db.query(sql,function (error, results) {
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
    var sql = mustache.render('SELECT user.f_Name, comment.datepost, comment.content FROM comment, user where productid = {{proID}} and comment.userid = user.f_ID order by datepost desc',obj);
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
    var sql = mustache.render('SELECT step, max(price) as maxprice, startprice, count(*) as bidcount FROM bidhistory, product where bidhistory.productid = {{proID}} and product.proid = bidhistory.productid',obj);
    db.query(sql,function (error, results) {
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
  Bid: function (userid, productid, price, timebid, bidType) {
    var d = q.defer();
    price = parseInt(price);
    var prevMaxPrice = 0;
    var prevAutoBidUserId = 0;
    var prevTurnAutoBidUserId = 0;
    var prevTurnMaxPrice = 0;
    var step = 0;
    var index = 0;
    console.log("*** " + bidType + (typeof bidType));
    if (bidType == 'manual') {
      var sql = 'insert into bidhistory (userid, productid, price, timebid) values (?, ?, ?, ?);';
      db.query(sql, [userid, productid, price, timebid],function (error, results) {
        if (error){
            d.reject(error);
        }
        sql = 'select iduser,maxprice from autobid where idproduct=? and iduser!=? order by id desc';
        db.query(sql, [productid,userid], function(err, rslt) {
          if (err)
            d.reject(err);
          if (rslt.length > 0) {
            prevMaxPrice = rslt[0]['maxprice'];
            prevAutoBidUserId = rslt[0]['iduser'];
            if (prevMaxPrice >= price && prevAutoBidUserId != userid) {
              sql = 'select step from product where proid=?';
              db.query(sql, [productid], function (err0, rslt0) {
                if (err0)
                  d.reject(err0);
                step = rslt0[0]['step'];
                sql = 'insert into bidhistory(userid, productid, price, timebid) \
                  values (?,?,?,? + interval 1 second)';
                var autobidPrice = (prevMaxPrice == price) ? price : (price+step);
                db.query(sql, [prevAutoBidUserId,productid,autobidPrice,timebid], function(err1,rslt1) {
                  if (err1)
                    d.reject(err1);
                  d.resolve(rslt1);
                });
              });
            }
            else
              d.resolve(rslt);
          }
          else
            d.resolve(rslt);
        });
      });
    }
    else if (bidType == 'auto') {
      //lấy giá tiền cao nhất hiện tại
      var maxProductPrice = 0;
      var sql = 'SELECT step, max(price) as maxprice, startprice, count(*) as bidcount FROM bidhistory, product where bidhistory.productid=? and product.proid = bidhistory.productid';
      db.query(sql,[productid], function (err, rslt) {
        if (err){
          d.reject(err);
        }
        if (rslt[0].maxprice == null)
          maxProductPrice = rslt[0].startprice;
        else {
          maxProductPrice = rslt[0].maxprice;
        }
        step = rslt[0].step;

        console.log("***Max product price: " + maxProductPrice);
        sql = 'select iduser,maxprice from autobid where idproduct=? order by id desc';
        db.query(sql, [productid], function(err0,rslt0) {
          if (err0)
            d.reject(err0);// + interval 7 day

          sql = 'insert into bidhistory(userid, productid, price, timebid) \
            values (?,?,?,?)';
          if (rslt0.length == 0) { //người đầu tiên đấu giá tự động
            db.query(sql, [userid, productid, maxProductPrice + step, timebid], function(err1,rslt1) {
              if (err1)
                d.reject(err1);
              sql = 'insert into autobid(iduser,idproduct,maxprice) \
                values (?,?,?)';
              db.query(sql,[userid,productid,price], function(err2, rslt2) {
                if (err2)
                  d.reject(err2);
                console.log("***Done!");
                d.resolve(rslt2);
              });
            });
            console.log("***Nguoi dau tien");
          }
          else { //đã có người tự động bid từ trước
            prevTurnAutoBidUserId = rslt0[0]['iduser'];
            prevTurnMaxPrice = rslt0[0]['maxprice'];
            for (i = 0; i < rslt0.length; i++) {
              if (rslt0[i]['iduser'] !== userid) {
                prevMaxPrice = rslt0[i]['maxprice'];
                prevAutoBidUserId = rslt0[i]['iduser'];
                break;
              }
            }
            console.log("***Da co nguoi bid tu dong tu truoc " + prevMaxPrice + " " + prevAutoBidUserId);
            if (prevTurnAutoBidUserId == userid && prevTurnMaxPrice > prevMaxPrice) { 
              //người dùng cập nhật maxbid
              var tmpsql = 'insert into autobid(iduser,idproduct,maxprice) \
                values (?,?,?)';
              db.query(tmpsql, [userid,productid,price], function(err1, rslt1) {
                if (err1)
                  d.reject(err1);
                sql = 'select userid from bidhistory order by timebid desc';
                db.query(sql, function(err2,rslt2) {
                  //console.log("****userid" + rslt2[0]['userid']);
                  if (err2)
                    d.reject(err2);
                  console.log("*****" + rslt2[0]['userid'] + userid + (rslt2[0]['userid'] !== userid));
                  if (price > maxProductPrice && rslt2[0]['userid'] !== userid) {
                    sql = 'insert into bidhistory(userid, productid, price, timebid) \
                      values (?,?,?,?)';
                    var max = (maxProductPrice > prevMaxPrice) ? maxProductPrice : prevMaxPrice; 
                    db.query(sql, [prevAutoBidUserId,productid,max+step,timebid], function(err3,rslt3) {
                      if (err3)
                        d.reject(err3);
                      d.resolve(rslt3);
                    })
                  }
                  else
                    d.resolve(rslt2);
                })
              })
              console.log("***Cap nhat autobid");
            }
            else {
              sql = 'insert into bidhistory(userid, productid, price, timebid) \
                values (?,?,?,?)';
              if (price < prevMaxPrice) {
                db.query(sql, [userid,productid,price,timebid], function(err1,rslt1) {
                  if (err1)
                    d.reject(err1);
                  sql = 'insert into bidhistory(userid, productid, price, timebid) \
                    values (?,?,?,? + interval 1 second)';
                  db.query(sql, [prevAutoBidUserId,productid,price + step,timebid], function(err2,rslt2) {
                    if (err2)
                      d.reject(err2);
                    sql = 'insert into autobid(iduser,idproduct,maxprice) \
                      values (?,?,?)';
                    db.query(sql,[userid,productid,price], function(err3, rslt3) {
                      if (err3)
                        d.reject(err3);
                      console.log("***Done!");
                      d.resolve(rslt3);
                    });
                  });
                });
                console.log("***price < prevMaxPrice");
              }
              else if (price == prevMaxPrice) {
                db.query(sql, [userid,productid,price,timebid], function(err1,rslt1) {
                  if (err1)
                    d.reject(err1);
                  sql = 'insert into bidhistory(userid, productid, price, timebid) \
                    values (?,?,?,? + interval 1 second)';
                  db.query(sql, [prevAutoBidUserId,productid,price, timebid], function(err2,rslt2) {
                    if (err2)
                      d.reject(err2);
                    sql = 'insert into autobid(iduser,idproduct,maxprice) \
                      values (?,?,?)';
                    db.query(sql,[userid,productid,price], function(err3, rslt3) {
                      if (err3)
                        d.reject(err3);
                      console.log("***Done!");
                      d.resolve(rslt3);
                    });
                  })
                });
                console.log("***price == prevMaxPrice");
              }
              else { //>
                var whatToDecide = (prevMaxPrice > prevTurnMaxPrice) ? prevMaxPrice : prevTurnMaxPrice;
                db.query(sql, [userid,productid,whatToDecide+step,timebid], function(err1,rslt1) {
                  if (err1)
                    d.reject(err1);
                  sql = 'insert into autobid(iduser,idproduct,maxprice) \
                    values (?,?,?)';
                  db.query(sql,[userid,productid,price], function(err2, rslt2) {
                    if (err2)
                      d.reject(err2);
                    console.log("***Done!");
                    d.resolve(rslt2);
                  });
                });
                console.log("***price > prevMaxPrice; prev" + prevMaxPrice + " prevTurn" + prevTurnMaxPrice);
              }
            }
          }
        });
      });
    }
    return d.promise;
  }
};

module.exports = item;
