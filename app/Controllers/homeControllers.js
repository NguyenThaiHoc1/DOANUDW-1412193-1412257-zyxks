var homeDB = require("../models/home.js");
var Qs = require('q');
var handle = require('handlebars'); // --- module mới dùng để xử lý helpers

var homeController = {
  homedefaultPage : function (req, res) {
      var usersx;
      if(req.session.user === undefined) {
          usersx = undefined;
      }else {
        usersx = (req.session.user.Permission === 'seller') ? true : undefined;
      }
      Qs.all([homeDB.top5mostauctionbid(), homeDB.top5bestprice() ,homeDB.top5cometoend(), homeDB.getCatogory()])
        .spread(function (temp1, temp2, temp3, temp4) {
        var fourPastHoursFromNow = new Date();
        fourPastHoursFromNow.setHours(fourPastHoursFromNow.getHours() - 4);
        for (var i = 0; i < temp1.length; i++)
          temp1[i].isNew = (temp1[i].datepost >= fourPastHoursFromNow) ? true : false;
        for (var i = 0; i < temp2.length; i++)
          temp2[i].isNew = (temp2[i].datepost >= fourPastHoursFromNow) ? true : false;
        for (var i = 0; i < temp3.length; i++)
          temp3[i].isNew = (temp3[i].datepost >= fourPastHoursFromNow) ? true : false;
        res.render("home", {
          user: req.session.user,
          checkingSeller: usersx,
          layout : "application",
          mostauctionbid : temp1,
          bestprice : temp2,
          cometoend : temp3,
          catogorylist : temp4,
          helpers: {
            trimString: function (passedString) {
              var theString = passedString.substring(0,20);
              if(passedString.length <= 20){
                return new handle.SafeString(passedString);
              } else {
                return new handle.SafeString(theString + "...");
              }
            },
            CheckDeadline: function (Parameter) {
              // <p class="DateEnd" style="font-size: 13px;">
              // <span class="countdown" data-countdown="{{this.sogiay}}">{{this.sogiay}}</span></p>
              var x = new Date(Parameter);
              var y = new Date();
              if(x > y){
                return new handle.SafeString('<span class="countdown" style="color:blue;" data-countdown="'+ Parameter +'">'+ Parameter +'</span>');
              } else {
                return new handle.SafeString('<span class="countdown" style="color:red;" >'+ 'Finished' +'</span>');
              }
            }
          }
        });
      });
  }
}
module.exports = homeController;
