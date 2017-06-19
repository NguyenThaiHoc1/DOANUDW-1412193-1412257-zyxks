$('[data-countdown]').each(function() {
  var $this = $(this),
      finalDate = $(this).data('countdown');
  $this.countdown(finalDate, function(event) {
    $this.html(event.strftime('%w weeks %D days %H:%M:%S'));
  });
});
