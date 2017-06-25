var q = require('q');
var db = require("./database.js");
var emailer = require('../Object/Emailer.js');
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
  Bid: function (userid, productid, price, timebid, bidType, host) {
    var d = q.defer();
    price = parseInt(price);
    var prevMaxPrice = 0;
    var prevAutoBidUserId = 0;
    var prevTurnAutoBidUserId = 0;
    var prevTurnMaxPrice = 0;
    var prevBidderEmail = '';
    var step = 0;
    var index = 0;
    var sql ='';
    var mail;
    console.log("*** " + bidType + (typeof bidType));
    if (bidType == 'manual') {
      sql = 'insert into bidhistory (userid, productid, price, timebid) values (?, ?, ?, ?);';
      db.query(sql, [userid, productid, price, timebid],function (error, results) {
        if (error)
            d.reject(error);
        sql = 'select f_email,proname from user,product where f_id=sellerid and proid=?';
        db.query(sql, [productid], function(err01,rslt01) {
          if (err01)
            d.reject(err01);
          sql = 'select f_id,f_email from user,bidhistory where f_id=userid and productid=? order by timebid desc';
          db.query(sql,[productid], function(err02,rslt02) {
            if (err02)
              d.reject(err02);
            var currentMaxPrice = price;
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
                    currentMaxPrice = autobidPrice;
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
              mail = new emailer(rslt01[0].f_email, 'Đã có người đấu giá sản phẩm ' + rslt01[0].proname + 'của bạn\n \
                Giá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                http://' + host + '/item/'+productid);
              mail.SendEmail();
              for (index=0; index < rslt02.length; index++) {
                if (rslt02[index].f_id !== userid) {
                  prevBidderEmail = rslt02[index].f_email;
                  break;
                }
              }
              console.log("***prevbiddermail " + prevBidderEmail);
              if (prevBidderEmail != '') {
                mail = new emailer(prevBidderEmail, 'Đã có người đưa ra giá cao hơn bạn trong sản phẩm ' + rslt01[0].proname +
                  '\nGiá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                  http://' + host + '/item/'+productid);
                mail.SendEmail();
              }
            });
          })
        })
      });
    }
    else if (bidType == 'auto') {
      //lấy giá tiền cao nhất hiện tại
      var maxProductPrice = 0;
      sql = 'select f_email,proname from user,product where f_id=sellerid and proid=?';
      db.query(sql, [productid], function(err01,rslt01) {
        if (err01)
          d.reject(err01);
        sql = 'select f_id,f_email from user,bidhistory where f_id=userid and productid=? order by timebid desc';
        db.query(sql,[productid], function(err02,rslt02) {
          if (err02)
            d.reject(err02);
          for (index=0; index < rslt02.length; index++) {
            if (rslt02[index].f_id !== userid) {
              prevBidderEmail = rslt02[index].f_email;
              break;
            }
          }
          sql = 'SELECT step, max(price) as maxprice, startprice, count(*) as bidcount FROM bidhistory, product where bidhistory.productid=? and product.proid = bidhistory.productid';
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
                d.reject(err0);

              sql = 'insert into bidhistory(userid, productid, price, timebid) \
                values (?,?,?,?)';
              if (rslt0.length == 0) { //người đầu tiên đấu giá tự động
                db.query(sql, [userid, productid, maxProductPrice + step, timebid], function(err1,rslt1) {
                  if (err1)
                    d.reject(err1);
                  currentMaxPrice = maxProductPrice + step;
                  mail = new emailer(rslt01[0].f_email, 'Đã có người đấu giá sản phẩm ' + rslt01[0].proname + 'của bạn\n \
                    Giá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                    http://' + host + '/item/'+productid);
                  mail.SendEmail();
                  sql = 'insert into autobid(iduser,idproduct,maxprice) \
                    values (?,?,?)';
                  db.query(sql,[userid,productid,price], function(err2, rslt2) {
                    if (err2)
                      d.reject(err2);
                    console.log("***Done!");
                    d.resolve(rslt2);
                    mail = new emailer(prevBidderEmail, 'Đã có người đưa ra giá cao hơn bạn trong sản phẩm ' + rslt01[0].proname +
                      '\nGiá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                      http://' + host + '/item/'+productid);
                    mail.SendEmail();
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
                if ((prevTurnAutoBidUserId == userid && prevTurnMaxPrice > prevMaxPrice) || index > 0) { 
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
                        currentMaxPrice = max+step;
                        var whatToDecide = (prevAutoBidUserId == 0) ? userid : prevAutoBidUserId;
                        db.query(sql, [whatToDecide,productid,max+step,timebid], function(err3,rslt3) {
                          if (err3)
                            d.reject(err3);
                          d.resolve(rslt3);
                        })
                        mail = new emailer(rslt01[0].f_email, 'Đã có người đấu giá sản phẩm ' + rslt01[0].proname + 'của bạn\n \
                          Giá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                          http://' + host + '/item/'+productid);
                        mail.SendEmail();
                        mail = new emailer(prevBidderEmail, 'Đã có người đưa ra giá cao hơn bạn trong sản phẩm ' + rslt01[0].proname +
                          '\nGiá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                          http://' + host + '/item/'+productid);
                        mail.SendEmail();
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
                      currentMaxPrice = price+step;
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
                      mail = new emailer(rslt01[0].f_email, 'Đã có người đấu giá sản phẩm ' + rslt01[0].proname + 'của bạn\n \
                        Giá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                        http://' + host + '/item/'+productid);
                      mail.SendEmail();
                    });
                    console.log("***price < prevMaxPrice");
                  }
                  else if (price == prevMaxPrice) {
                    db.query(sql, [userid,productid,price,timebid], function(err1,rslt1) {
                      if (err1)
                        d.reject(err1);
                      sql = 'insert into bidhistory(userid, productid, price, timebid) \
                        values (?,?,?,? + interval 1 second)';
                      currentMaxPrice = price;
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
                      mail = new emailer(rslt01[0].f_email, 'Đã có người đấu giá sản phẩm ' + rslt01[0].proname + 'của bạn\n \
                        Giá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                        http://' + host + '/item/'+productid);
                      mail.SendEmail();
                    });
                    console.log("***price == prevMaxPrice");
                  }
                  else { //>
                    var whatToDecide = (prevMaxPrice > maxProductPrice) ? prevMaxPrice : maxProductPrice;
                    currentMaxPrice = whatToDecide+step;
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
                    if (prevBidderEmail != '') {
                      mail = new emailer(prevBidderEmail, 'Đã có người đưa ra giá cao hơn bạn trong sản phẩm ' + rslt01[0].proname +
                        '\nGiá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                        http://' + host + '/item/'+productid);
                      mail.SendEmail();
                    }
                    mail = new emailer(rslt01[0].f_email, 'Đã có người đấu giá sản phẩm ' + rslt01[0].proname + 'của bạn\n \
                      Giá hiện tại của sản phẩm là: ' + currentMaxPrice + '\nXem chi tiết: \
                      http://' + host + '/item/'+productid);
                    mail.SendEmail();
                    console.log("***price > prevMaxPrice; prev" + prevMaxPrice + " prevTurn" + prevTurnMaxPrice);
                  }
                }
              }
            });
          });
        });
      });
    }
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
  },
  publish: function (sku, sellerid, datepost, proname, tinydes, fulldes, datefinish, startprice, step, beatprice, autoextend, catid, image1, image2, image3) {
      var d = q.defer();
      var sql = 'insert into product (sku, tinydes, sellerid, datepost, proname, fulldes, datefinish, startprice, step, beatprice, autoextend, catid, image1, image2, image3) values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
      db.query(sql, [sku, tinydes, sellerid, datepost, proname, fulldes, datefinish, startprice, step, beatprice, autoextend, catid, image1, image2, image3],function (error, results) {
          if (error){
              d.reject(error);
          }
          d.resolve(results);
      });
      return d.promise;
  }
};

module.exports = item;
