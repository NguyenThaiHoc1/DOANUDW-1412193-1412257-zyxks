var searchDB = require("../models/search.js");
var Qs = require('q');
var handle = require('handlebars'); // --- module mới dùng để xử lý helpers

var totalRec = 0,

pageSize  = 12;

pageCount = 0;

var start       = 0;

var currentPage = 1;

var typePage = 0;

var searchController = {
  searchMenuPage : function (req, res) {
    var object = {
        searchinput : req.query.searchinput,
        catogory : req.query.catogory
    }
    var usersx;
    if(req.session.user === undefined) {
        usersx = undefined;
    }else {
      usersx = (req.session.user.Permission === 'seller') ? true : undefined;
    }
    Qs.all([searchDB.searchPage(object), searchDB.getCatogory()]).spread(function (temp1, temp2) {
            console.log('???!!!');
            // start phan trang
            var urlTemp = req.url.split("&page=")[0];
            totalRec      = temp1.length;
            pageCount     =  Math.ceil(totalRec /  pageSize);
            if (typeof req.query.page !== 'undefined') {
              currentPage = req.query.page;
            }
            if(currentPage >= 1){
              start = (currentPage - 1) * pageSize;
            }
            if(typeof req.query.type !== 'undefined'){
              typePage = req.query.type;
            }
            searchDB.getPageNumber(start, pageSize, object, typePage).then(function (data) {
              if (typeof req.query.type !== 'undefined') {
                  res.send(data);
              }else {
                var  breachcumGen = (object.catogory == 0) ? "All Catogory" : temp2[parseInt(object.catogory) - 1].catname;
                var fourPastHoursFromNow = new Date();
                fourPastHoursFromNow.setHours(fourPastHoursFromNow.getHours() - 4);                
                for (var i = 0; i < data.length; i++)
                  data[i].isNew = (data[i].datepost >= fourPastHoursFromNow) ? true : false;
                res.render("_productAuction/SPDAUGIA", {
                  user: req.session.user,
                  checkingSeller: usersx,
                  layout : "application",
                  catogorylist : temp2,
                  productlist : data,
                  catogoryChoose : req.body.catogory,
                  urlType : urlTemp,
                  breachcum : breachcumGen,
                  helpers: {
                        foo: function () {
                          var html = '';
                          html += '<li><a href="'+ urlTemp + '&page='+ 1 + '" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
                          for (var i = 1; i <= pageCount; i++) {
                              if(currentPage == i) {
                                html += '<li class="active"><a href= "'+ urlTemp + '&page='+ i +'">' + i + ' </a></li>';
                              }else {
                                html += '<li><a href= "'+ urlTemp + '&page='+ i +'">' + i + ' </a></li>';
                              }
                          }
                          html += '<li><a href="'+ urlTemp + '&page='+ pageCount + '" aria-label="Previous"><span aria-hidden="true">&raquo;</span></a></li>';
                          return new handle.SafeString(html);
                        },
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
              }
            });
          // end phan trang
    });
  }
}

module.exports = searchController;
