var countDownDatePost = new Date($("#datepost").text()).getTime();
var countDownFinish = new Date($("#datefinish").text()).getTime();

var datepost_timer = setInterval(function() {
    var moment_now = moment();
    var moment_post = moment(countDownDatePost);
    if (moment_now.isBefore(moment_post)) {
        document.getElementById("datepost_timer").innerHTML = moment.preciseDiff(moment_now, moment_post);
    }
    else{
        clearInterval(datepost_timer);
    }
}, 1000);

var datefinish_timer = setInterval(function() {
    var moment_now = moment();
    var moment_post = moment(countDownDatePost);
    var moment_finish = moment(countDownFinish);
    if (moment_post.isBefore(moment_now) && moment_now.isBefore(moment_finish)) {
        document.getElementById("datefinish_timer").innerHTML = moment.preciseDiff(moment_now, moment_finish);
    }
    else{
        clearInterval(datefinish_timer);
        if(moment_finish.isBefore(moment_now)){
            document.getElementById("datefinish_timer").innerHTML = "EXPIRED";
        }
    }
}, 1000);
