var winningDB = require("../models/winning.js");
var Gemail = require("../Object/Emailer.js");

var winningChecking = {
    // he thong
    WrittingWinning : function () {
        // ban dau chung ta se checking
        winningDB.CheckingAllProduct().then(function (data) {
            if(data.length > 0) {
                // thuc hien cac hanh dong sau
                for(var i = 0 ;i < data.length; ++i) {
                  var Proidsx = data[i];
                  winningDB.loadHighestBuyerInfo(Proidsx.proid).then(function (data1) {
                      if(data1.length !== 0) {
                          // thuc hien qua trinh ghi
                          winningDB.writeWinning(Proidsx.proid, data1[0].f_ID).then(function (data) {
                              // khi thuc hien thanh cong
                              var ContentEmailNM = data1[0].f_Name + ' are A Winner in Auction Product: ' + Proidsx.proname
                              + '\n' + 'Your Price bid: ' + data1[0].price + '$'
                              + '\n' + 'Congratulations again'
                              + '\n' + 'Thank you for use We website';

                              var EmailNguoiMua = new Gemail(data1[0].f_Email, ContentEmailNM);
                              EmailNguoiMua.SendEmail();

                              var ContentEmailNB = 'Your Product Selled with price is ' + data1[0].price + '$'
                              + '\n' + 'By user: ' + data1[0].f_Name
                              + '\n' + 'Congratulations again'
                              + '\n' + 'Thank you for use Feture Auction in Our Website';
                              var EmailNguoiBan = new Gemail(Proidsx.f_Email, ContentEmailNB);
                              EmailNguoiBan.SendEmail();
                          }).fail(function (err) {
                          });
                      }
                      else {
                          // thuc hien qua trinh gui email
                          var ContentEmailNB = 'Your Product noOne Bid !! Sorry for this'
                          var EmailNguoiBan = new Gemail(Proidsx.f_Email, ContentEmailNB);
                          EmailNguoiBan.SendEmail();
                      }
                  }).fail(function (err) {
                  });
                }
            }
        });
    }
}
module.exports = winningChecking;
