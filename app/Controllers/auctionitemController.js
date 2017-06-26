var auctionitemdb = require("../models/auction_item.js");
var momment=require("moment");
var Qs = require('q');
var handle = require('handlebars'); // --- module mới dùng để xử lý helpers
var EmailGmail = require("../Object/Emailer.js");
var randstr = require("randomstring");


var auctionitemController = {
  loadWithID : function (req, res) {
    var usersx;
    var CheckedSellerItem;
    var CheckingElimaneti;
    if(req.session.user === undefined) {
        usersx = undefined;
        CheckedSellerItem = undefined;
    }else {
      usersx = (req.session.user.Permission === 'seller') ? true : undefined;
    }
    var proId = req.params.id;
    Qs.all([auctionitemdb.loadWithID(proId), auctionitemdb.loadSellerInfo(proId), auctionitemdb.loadHighestBuyerInfo(proId), auctionitemdb.loadTotalItemSeller(proId),
                    auctionitemdb.loadTotalPersonBid(proId), auctionitemdb.loadBidHistory(proId), auctionitemdb.loadComment(proId),auctionitemdb.getMaxBidAndStep(proId)
                    , auctionitemdb.getCatogory(), auctionitemdb.loadingUserBuyer(proId)])
                    .spread(function (item, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9, temp10) {
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
      // item 1 giu ID thang ban nao ?

      if (req.session.user !== undefined) {
        if(req.session.user.IdUser === item.sellerid) {
            CheckedSellerItem = true;
        }

        for(var i = 0 ; i < temp10.length; ++i ){
            if(req.session.user.IdUser === temp10[i].f_ID) {
                if(temp10[i].state_User === '1'){
                  CheckingElimaneti = true;
                  break;
                }
            }
        }

      }

      res.render("_productAuction/item", {
        user : user,
        checkingSeller: usersx,
        checkingSellerItem: CheckedSellerItem,
        catogorylist : temp9,
        BuyerAuction : temp10,
        CheckElimanate : CheckingElimaneti,
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
        isRatingNotAvailable: (isRatingNotAvailable === true) ? undefined : isRatingNotAvailable,
        helpers: {
            CheckingState: function (state_User) {
              if(state_User === '0'){
                return new handle.SafeString('<button button-add="addfriendBTN" type="button" class="btn btn-danger glyphicon glyphicon-remove"></button>');
              } else {
                return new handle.SafeString('<button button-unlock="unlockAccount" type="button" class="btn btn-success glyphicon glyphicon-ok"></button>');
              }
            }
        }
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
        var bidType = req.params.bidType;
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
            text: 'You bid \"'+idItem+'\"\nWith price '+price+'\nClick link below to confirm:\n' +
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
            var bidType = req.params.bidType;
            var idUser = user.IdUser;
            var booleand = true;
            auctionitemdb.loadHighestBuyerInfo(idItem).then(function (data) {
                  if(data.length > 0){
                    var timebid=momment().format('YYYY/MM/DD H:mm:ss');
                    var priccGuess = (price - data[0].price);
                    if (priccGuess <= 0 || priccGuess % data[0].step !== 0) {
                      booleand = false;
                    }
                    if(booleand === true) {
                      auctionitemdb.Bid(idUser, idItem, price, timebid, bidType, req.headers.host).then(function () {
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
                            auctionitemdb.Bid(idUser, idItem, price, timebid, bidType, req.headers.host).then(function () {
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
    },
    eliminateUser: function (req, res) {
      auctionitemdb.getEmailUser(req.body.iduserblock).then(function (data1) {
        auctionitemdb.eliminateUserDB(req.body).then(function (data) {
            var Email =  new EmailGmail(data1[0].f_Email,
               'Your Account (' + data1[0].f_Name +') is Block By Seller (' + req.session.user.Firstname + ' ' + req.session.user.Lastname + ')');
            Email.SendEmail();
            req.flash("messagesSuccess", "Eliminate User success");
            res.send();
        }).fail(function () {
          console.log(err);
          res.end('fail');
        });
      }).fail(function () {
        console.log(err);
        res.end('fail');
      });
    },
    unblockElimanate: function (req, res) {
      auctionitemdb.getEmailUser(req.body.iduserblock).then(function (data1) {
          auctionitemdb.unlockAccount(req.body).then(function (data) {
              var Email =  new EmailGmail(data1[0].f_Email,
               'Your Account (' + data1[0].f_Name +') is Unlock By Seller (' + req.session.user.Firstname + ' ' + req.session.user.Lastname + ')');
              Email.SendEmail();
              req.flash("messagesSuccess", "Unlock User success");
              res.send();
          }).fail(function () {
            console.log(err);
            res.end('fail');
          });
      });
    },
    publish: function (req, res) {
        var sku = randstr.generate(7);
        var tinyDes = req.body.tinydes;
        var sellerid = req.session.user.IdUser;
        var datepost=momment().format('YYYY/MM/DD H:mm:ss');
        var proname=req.body.proname;
        var fulldes=req.body.fulldes;
        var datefinish=momment(req.body.datefinish).format('YYYY/MM/DD H:mm:ss');
        var startprice=req.body.startprice;
        var step=req.body.step;
        var beatprice=req.body.beatprice;
        var autoextend=req.body.autoextend==="on";
        var catid=req.body.catid;
        var image1 = req.files[0]?req.files[0].filename:undefined;
        var image2 = req.files[1]?req.files[1].filename:undefined;
        var image3 = req.files[2]?req.files[2].filename:undefined;
        auctionitemdb.publish(sku, sellerid, datepost, proname, tinyDes, fulldes, datefinish,startprice , step, beatprice, autoextend,catid, image1, image2, image3).then(function () {
            req.flash("messagesSuccess", "Product is Ported !");
            res.redirect("/testtingO");
        }).fail(function (err) {
            req.flash("messagesFail", "Product is not Ported !");
            res.redirect("/testtingO");
        });
    }
};
module.exports = auctionitemController;
