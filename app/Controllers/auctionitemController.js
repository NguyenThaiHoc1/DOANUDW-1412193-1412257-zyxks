var auctionitemdb = require("../models/auction_item.js");
var momment=require("moment");
var Qs = require('q');

var auctionitemController = {
  loadWithID : function (req, res) {
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
      if (user){
          isRatingNotAvailable = user.Positiverating / (user.Negativerating + user.Positiverating) < 0.8;
      }
      res.render("_productAuction/item", {
        user : user,
        catogorylist : temp9,
        layout : "application",
        item : item,
        seller : temp2,
        highestbuyerid : temp3,
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
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    },
    bid: function (req, res) {
        var user = req.session.user;
        if (user){
            var idItem = req.params.id;
            var price = req.query.price;
            var idUser = user.IdUser;
            var moment_bid = momment();
            var timebid=moment_bid.format('YYYY/MM/DD H:mm:ss');
            auctionitemdb.bid(idUser, idItem, price, timebid).then(function (product){
                var moment_finish_5_minutes = momment(product.finish).subtract({minutes: 5});
                var moment_finish = momment(product.finish);
                if(product.autoextend == 1 && moment_bid.isBetween(moment_finish_5_minutes, product.finish)){
                    auctionitemdb.plusFinishTime(idItem, moment_finish);
                }
                auctionitemdb.updateHighestBuyer(idUser,idItem).then(function () {
                    return res.redirect('/item/'+idItem);
                });
            }).fail(function (err) {
                console.log(err);
                res.end('fail');
            });
        }
        else{
            res.end('fail');
        }
    },
    publish: function (req, res) {
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
        var image1=req.files[0]?req.files[0].filename:undefined;
        var image2=req.files[1]?req.files[1].filename:undefined;
        var image3=req.files[2]?req.files[2].filename:undefined;
        auctionitemdb.publish(sellerid, datepost, proname, fulldes, datefinish,startprice , step, beatprice, autoextend,catid, image1, image2, image3).then(function () {
            return res.redirect('/');
        }).fail(function (err) {
            console.log(err);
            res.end('fail');
        });
    }
};
module.exports = auctionitemController;
