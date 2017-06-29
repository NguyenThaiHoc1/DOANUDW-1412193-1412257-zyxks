var publicDB = require("../models/public.js");
var handle = require('handlebars'); // --- module mới dùng để xử lý helpers
var totalRec = 0,

pageSize  = 12;

pageCount = 0;

var start       = 0;

var currentPage = 1;

var publicController = {

  defaultPage: function (req, res, next) {
      // truyen vao user
      var usernames = req.query.username;
      publicDB.CheckUser(usernames).then(function (data) {
        if(data.length > 0) {
            publicDB.Counterlistcommit(data[0].f_ID).then(function (data1) {

              totalRec      = data1.length;
              pageCount     =  Math.ceil(totalRec /  pageSize);
              if (typeof req.query.page !== 'undefined') {
                currentPage = req.query.page;
              }
              if(currentPage >= 1){
                start = (currentPage - 1) * pageSize;
              }
              publicDB.ListComment(data[0].f_ID, start, pageSize).then(function (data2) {
                res.render("publicComment",{
                  ListComment: data2,
                  User: data[0],
                  layout: "application",
                  helpers: {
                    TinhToanDiem: function () {
                      return (data[0].positiverating / (data[0].positiverating + data[0].negativerating) * 100);
                    },
                    foo: function () {
                      var html = '';
                      html += '<li><a href="/public/commentUser?username='+ usernames +'&page='+ 1 + '" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
                      for (var i = 1; i <= pageCount; i++) {
                          if(currentPage == i) {
                            html += '<li class="active"><a href= "/public/commentUser?username=' + usernames + '&page='+ i +'">' + i + ' </a></li>';
                          }else {
                            html += '<li><a href= "/public/commentUser?username=' + usernames + '&page='+ i +'">' + i + ' </a></li>';
                          }
                      }
                      html += '<li><a href="/public/commentUser?username=' + usernames + '&page='+ pageCount + '" aria-label="Previous"><span aria-hidden="true">&raquo;</span></a></li>';
                      return new handle.SafeString(html);
                    },
                    CheckingLike: function (state) {
                      if(state === 1){
                        return new handle.SafeString('<i class="fa fa-thumbs-up" style="color:red;"></i>');
                      } else {
                        return new handle.SafeString('<i class="fa fa-thumbs-down" style="color:#9400D3;"></i>');
                      }
                    }
                  }
                });
              });

            });
        }
        else {
          next();
        }
      });
  }
}


module.exports = publicController;
