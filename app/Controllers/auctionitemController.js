var auctionitemdb = require("../models/auction_item.js");
var momment=require("moment");
var Qs = require('q');

var auctionitemController = {
  loadWithID : function (req, res) {
    var usersx;
    if(req.session.user === undefined) {
        usersx = undefined;
    }else {
      usersx = (req.session.user.Permission === 'seller') ? true : undefined;
    }
    var proId = req.params.id;
    Qs.all([auctionitemdb.loadWithID(proId), auctionitemdb.loadSellerInfo(proId), auctionitemdb.loadHighestBuyerInfo(proId), auctionitemdb.loadTotalItemSeller(proId),
                    auctionitemdb.loadTotalPersonBid(proId), auctionitemdb.loadBidHistory(proId), auctionitemdb.loadComment(proId),auctionitemdb.getMaxBidAndStep(proId)
                    , auctionitemdb.getCatogory()])
                    .spread(function (item, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9) {
      var user = req.session.user;
      var moment_now = momment(new Date);
      var moment_post = momment(item.datepost);
      var moment_finish = momment(item.datefinish);
      var isTimeNotAvailable = !(moment_post.isBefore(moment_now) && moment_now.isBefore(moment_finish));
      var isRatingNotAvailable = false;
      var Stringresulf = (temp3.length > 0) ? temp3[0].f_Name : 'No Bid';
      var StringUrlBuyerBest = (temp3.length > 0)  ? temp3[0].f_ImageUrl : undefined;
      if (user){
          isRatingNotAvailable = user.Positiverating / (user.Negativerating + user.Positiverating) < 0.8;
      }
      res.render("_productAuction/item", {
        user : user,
        checkingSeller: usersx,
        catogorylist : temp9,
        layout : "application",
        item : item,
        seller : temp2,
        successMess : res.locals.Success,
        FailMess : res.locals.Fail,
        highestbuyerid : Stringresulf,
        highesybuyerIMG : StringUrlBuyerBest,
        sellertotalitems : temp4,
        totalPersonBid : temp5,
        bidhistory : temp6,
        comment : temp7,
        maxbidandstep : temp8,
        isTimeNotAvailable: (isTimeNotAvailable === true) ? undefined : isTimeNotAvailable,
        isRatingNotAvailable: (isRatingNotAvailable === true) ? undefined : isRatingNotAvailable
      });
    });
  },
    addComment: function (req, res) {
        var idItem = req.params.id;
        var idUser = req.session.user.IdUser;
        var datepost=momment().format('YYYY/MM/DD H:mm:ss');
        auctionitemdb.addComment(idUser, idItem, req.body.content,datepost).then(function () {
            return res.redirect('back');
        }).fail(function (err) {
            console.log(err);
            res.end('fail');
        });
    },
    sendEmailConfirmBid: function (req, res) {
        var idItem = req.params.id;
        var user = req.session.user;
        var email = user.Email;
        var price = req.body.price;
        var name = req.body.name;

        const nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dackweb0@gmail.com',
                pass: 'wtf935730'
            }
        });
        var mailOptions = {
            from: 'dackweb0@gmail.com',
            to: email,
            subject: 'Confirm Bid Price',
            text: 'You bid \"'+'{{name}}'+'\"\nWith price '+price+'\nClick link below to confirm:\n' +
            'http://' + req.headers.host + '/item/'+idItem+'/bid?price='+price
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            //console.log('Message %s sent: %s', info.messageId, info.response);
        });
    },
    bid: function (req, res) {
        var user = req.session.user;
        if (user){
            var idItem = req.params.id;
            var price = req.query.price;  // gia request gui
            var idUser = user.IdUser;
            var booleand = true;
            auctionitemdb.loadHighestBuyerInfo(idItem).then(function (data) {
                  if(data.length > 0){
                    var timebid=momment().format('YYYY/MM/DD H:mm:ss');
                    var priccGuess = (price - data[0].priceAuction);
                    if (priccGuess < 0) {
                      booleand = false;
                    } else if ( (priccGuess % data[0].step) !== 0) {
                      booleand = false;
                    } else {
                      booleand = true;
                    }
                    if(booleand === true) {
                      auctionitemdb.bid(idUser, idItem, price, timebid).then(function () {
                          req.flash("messagesSuccess", "Bid Price is successed");
                          return res.redirect('/item/'+idItem);
                      }).fail(function (err) {
                          console.log(err);
                          res.end('fail');
                      });
                    } else {
                      req.flash("messagesFail", "Bid Price is not success ! Please try again");
                      res.redirect("/item/" + idItem);
                    }
                  }else {

                    auctionitemdb.loadWithID(idItem).then(function (data) {
                        if(price >= data.startprice) {
                            var timebid=momment().format('YYYY/MM/DD H:mm:ss');
                            auctionitemdb.bid(idUser, idItem, price, timebid).then(function () {
                                req.flash("messagesSuccess", "Bid Price is successed");
                                return res.redirect('/item/'+idItem);
                            }).fail(function (err) {
                                console.log(err);
                                res.end('fail');
                            });
                        }else {
                            req.flash("messagesFail", "Bid Price is not success ! Please try again");
                            res.redirect("/item/" + idItem);
                        }

                    }).fail(function (error) {
                      console.log(err);
                      res.end('fail');
                    });

                  }
            }).fail(function (err) {
              console.log(err);
              res.end('fail');
            });
        }
        else{
            res.end('fail');
        }
    }
};
module.exports = auctionitemController;
