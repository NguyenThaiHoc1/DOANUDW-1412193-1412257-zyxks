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
    var sql = mustache.render('SELECT user.f_Username, user.f_Name, user.f_Email  FROM product,user where product.sellerid = user.f_ID and proid = {{proID}}',obj);
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
    var sql = mustache.render('SELECT user.f_Username, user.f_Name, user.f_Email  FROM product,user where product.highestbuyerid = user.f_ID and proid = {{proID}}',obj);
    db.query(sql,function (error, results) {
      if (error){
        d.reject(error);
      }
      d.resolve(results[0]);
    });
    return d.promise;
  },
  updateHighestBuyer: function (highestBuyer, productid) {
        var d = q.defer();
        var sql = 'update product set highestbuyerid = ? where proid = ?;';
        db.query(sql, [highestBuyer, productid],function (error, results) {
            if (error){
                d.reject(error);
            }
            d.resolve(results);
        });
        return d.promise;
  },
    plusFinishTime: function (productid,  moment_finish) {
        var d = q.defer();
        var sql = 'update product set datefinish = ? where proid = ?;';
        db.query(sql, [moment_finish.add({minutes: 10}).format('YYYY/MM/DD H:mm:ss'), productid],function (error, results) {
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
  bid: function (userid, productid, price, timebid) {
      var d = q.defer();
      var obj = {
          proID: productid
      };
      var sqlProduct = mustache.render('SELECT max(price) as maxprice, product.datefinish, product.autoextend FROM bidhistory, product where bidhistory.productid = {{proID}} and product.proid = bidhistory.productid',obj);
      db.query(sqlProduct,function (error, results) {
          if (error){
              return d.reject(error);
          }
          if(price<results[0].maxprice){
              return d.reject("bid price < max price");
          }
          var sql = 'insert into bidhistory (userid, productid, price, timebid) values (?, ?, ?, ?);';
          db.query(sql, [userid, productid, price, timebid],function (error, results2) {
              if (error){
                  return d.reject(error);
              }
              d.resolve(results[0], results2);
          });
      });
    return d.promise;
  },
  publish: function (sellerid, datepost, proname, fulldes, datefinish, startprice, step, beatprice, autoextend, catid, image1, image2, image3) {
      var d = q.defer();
      var sql = 'insert into product (sellerid, datepost, proname, fulldes, datefinish, startprice, step, beatprice, autoextend, catid, image1, image2, image3) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
      db.query(sql, [sellerid, datepost, proname, fulldes, datefinish, startprice, step, beatprice, autoextend, catid, image1, image2, image3],function (error, results) {
          if (error){
              d.reject(error);
          }
          d.resolve(results);
      });
      return d.promise;
  }
};

module.exports = item;
