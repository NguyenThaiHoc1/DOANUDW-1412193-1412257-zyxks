$(".item").on('click', '[button-add="addwishlist"]', function () {
    var spanItem = $(this).closest("span");
    var idProduct = spanItem.find(".idText").val();
    var urlServer = "/wishlist?idProduct=" + idProduct;
    var ajaxElement = {
        checking : true
    };
    var ObjectItem = {
        idItem : idProduct
    };
    $.ajax({
      url: "wishlist",
      method: 'POST',
      contentType : "application/json",
      data: JSON.stringify({ajax : ajaxElement, idItem : ObjectItem}),
      success: function (data) {
            // xet redirect
            if (typeof data.redirect == 'string') {
              window.location.replace(window.location.protocol + "//" + window.location.host + data.redirect);
            }
            else {
               // co nghia la da dang nhap va tra ve thanh cong
               // thanh cong minh se lam gi ?
               //1. minh se cho hien 1 cai popup len thong bao da thanh cong
               //2. neu minh da them san pham nay roi thi minh se in ra la da co san pham nay roi
               console.log(data.messagesFail);
               console.log(data.messagesSuccess);
               if( data.messagesFail !== undefined) {
                  // that bai
                  var bodymessage = $("#primary").find(".modal-body h3");
                  bodymessage.css("color", "red");
                  bodymessage.text(data.messagesFail);
                  $("#popupMessages").click();
               }
               else {
                  // thanh cong
                  var bodymessage = $("#primary").find(".modal-body h3");
                  bodymessage.css("color", "black");
                  console.log(data.messagesSuccess);
                  bodymessage.text(data.messagesSuccess);
                  $("#popupMessages").click();
               }
            }
      }
    });
})
