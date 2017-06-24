var sellerDB = require("../models/seller.js");
var Qs = require("q");
var handle = require('handlebars'); // --- module mới dùng để xử lý helpers

var sellerController = {
  Defaultpage : function (req, res) {
    // flow
    // Buoc 1 : ta can gi
    /*
      - ta can truyen vao bien user do
      - ta can danh sach san pham se hien thi ra (San pham nay la cua 1 nguoi nao do *itemPostAuction)
    */

    Qs.all([sellerDB.GetAuctionPosted(req.session.user.IdUser)]).spread(function (temp1) {
      res.render("_profile/profileSeller", {
        user: req.session.user,
        checkingSeller: (req.session.user.Permission === 'seller') ? true : undefined,
        successMess : res.locals.Success,
        FailMess : res.locals.Fail,
        checkingSeller: (req.session.user.Permission === 'seller') ? true : undefined,
        itemPostAuction: temp1,
        layout: "applicationnoHeader",
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
  },
  UpdateSellerDetail: function (req, res) {
    sellerDB.Getinfoproduct(req.body.fIDProduct).then(function (data) {
        if(data.length <= 0) {
          req.flash("messagesFail", "Update not success !");
          res.redirect(req.url);
        }else {
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();

          if(dd<10) {
              dd='0'+dd
          }

          if(mm<10) {
              mm='0'+mm
          }
          today = yyyy+'-'+mm+'-'+dd;

          var detailUpdate = data[0].fulldes + '<p style="color:red;">Edit: (' + today + ')</p>' + req.body.editUpdate;
          var objectsx = {
            productID: req.body.fIDProduct,
            fulldetail: detailUpdate
          };
          sellerDB.SaveDetail(objectsx).then(function () {
            req.flash("messagesSuccess", "Update is successed !");
            res.redirect('/testtingO');
          }).fail(function (err) {
            console.log(err);
            return;
          });
        }
    }).fail(function (err) {
      console.log(err);
      return;
    });
  }
}

module.exports = sellerController;
