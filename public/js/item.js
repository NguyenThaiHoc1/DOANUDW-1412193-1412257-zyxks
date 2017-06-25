var bidPrice = NaN;
var useSuggerPrice=false;

function showSuggest(max, step) {

  var html = '<ul>';
  for (i = 0; i < 5; i++) {
    var suggestPrice = max + step * (i+1);
    html += '<li><button type="button" class="btn btn-primary col-md-12 col-ms-12"  onclick=bidWithPrice('+suggestPrice+')  value="'+ suggestPrice +'">$' + suggestPrice + '</button></li>';
  }
  html += '</ul>';
  document.getElementById('show-suggest-price').innerHTML = html;

}



$(function () {
  $("#bid-warning1").hide()
  $('#myModal').on('shown.bs.modal', function() {
    $("#bid-warning1").hide()
  });
  $('#custom-price').on('input', function(){
      useSuggerPrice=false;
  });
});

$("#btn-bid1").click(function () {
    var currentPrice = parseInt($("#current-price").text());
    var customPrice = parseInt($("#custom-price").val());
    var bidStep = parseInt($("#bid-step").text());
    var bidWarning = $("#bid-warning1");
    if(isNaN(customPrice)) {
      bidWarning.show();
      bidWarning.text("Check your price");
      bidPrice = NaN;
    }
    else if (!isNaN(customPrice) && !useSuggerPrice){
        if(customPrice<=currentPrice){
            console.log("abc");
            bidWarning.show();
            bidWarning.text("Custom price must be larger current price")
            bidPrice = NaN;
        }
        else if((customPrice - currentPrice) % bidStep !== 0){
            console.log("abc");
            bidWarning.show();
            bidWarning.text("Custom price must be divisible by step")
            bidPrice = NaN;
        }
        else{
            bidWarning.hide();
            bidPrice=customPrice;
        }
    }
    if(!isNaN(bidPrice)){
        $('#myModal').modal('toggle');
        BootstrapDialog.show({
            title: 'Notify',
            message: 'Your price is:  '+bidPrice+"\n We will send you a email to confirm",
            buttons: [
                {
                    label: 'Close',
                    action: function(dialog){
                        dialog.close();
                    }
                },
                {
                label: 'Send me an email',
                cssClass: 'btn-primary',
                action: function(dialog) {
                    var idItem= $("#addwishlist").val();
                    var bidType= $("#checkboxIsAuto").is(':checked') ? 'auto' : 'manual';
                    var idName= $("#item-name").text();
                    $.ajax({
                        url: "/item/"+idItem+"/"+bidType+"/send_email_confirm_bid",
                        method: 'POST',
                        contentType : "application/json",
                        data: JSON.stringify({price: bidPrice, name: idName}),
                        success: function (data) {
                        }
                    });
                    dialog.close();
                }
            }
            ]
        });
    }
});

function bidWithPrice(price){
    bidPrice = price;
    useSuggerPrice=true;
}

$("#addwishlist").click(function () {
    var idProduct = $(this).val();
    var ajaxElement = {
        checking : true
    };
    var ObjectItem = {
        idItem : idProduct
    };
    $.ajax({
        url: "/wishlist",
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
});
