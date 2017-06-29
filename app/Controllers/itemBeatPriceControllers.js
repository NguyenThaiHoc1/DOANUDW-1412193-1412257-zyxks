var beatpriceDB = require("../models/beatprice.js");
var Gmails = require("../Object/Emailer.js");
var momment=require("moment");
var randstr = require("randomstring");

var beatpriceController  = {
    sendEmailConfirmBid: function (req, res, next) {
      var idItem = req.params.id;
      var user = req.session.user;
      var email = user.Email;
      var price = req.body.price; // gia cua san pham
      var name = req.body.name; // ten cua san pham

      var contentEmail = 'You beat product '+ name +'\nWith beat price of product: '+price+'\nClick link below to confirm:\n' +
      'http://' + req.headers.host + '/item/'+ idItem +'/bidbeatprice?price='+price
      var SendEmailsx = new Gmails(email, contentEmail);
      SendEmailsx.SendEmail();
      res.send({});
    },
    bid: function (req, res, next) {
        if(req.session.user !== undefined)
        {
          var user = req.session.user;
          var idItem = req.params.id;
          var price = req.query.price;  // gia request gui
          var timebid=momment().format('YYYY/MM/DD H:mm:ss');
          beatpriceDB.getProductByID(idItem).then(function (dataResulf) {
                if(dataResulf.length > 0)
                {
                    var Objects = {
                      productid : idItem,
                      userid :user.IdUser,
                      timeBID: timebid,
                      beatprice: price,
                      Proname:dataResulf[0].proname
                    }
                    beatpriceDB.bid(Objects).then(function (data) {
                        var stringDate = new Date();
                        var year = stringDate.getYear() + 1900;
                        var month = stringDate.getMonth() + 1;
                        var day = stringDate.getDate();
                        var hours = stringDate.getHours();
                        var minute = stringDate.getMinutes();
                        var second = stringDate.getSeconds() + 8;

                        var stringResulf = year + '/' + month + '/' + day + ' ' + hours + ':' + minute + ':' + second;
                        var timebid1=momment(stringResulf).format('YYYY/MM/DD H:mm:ss');
                        var Objecthello = {
                          timeBID1:  timebid1,
                          productid: idItem
                        }
                        beatpriceDB.updateProduct(Objecthello).then(function (data1) {
                            req.flash("messagesSuccess", "Beat Price Product is successed");
                            return res.redirect('/item/'+idItem);
                        }).fail(function (err) {
                          next();
                        });
                   }).fail(function (err) {
                      next();
                   });
              }
              else {
                next();
              }
         });

      }
      else {
          res.redirect('/login');
      }
    }

}

module.exports = beatpriceController;
