(function($) {
  var calp=null
  var onclose=null

  var only_escape = function(e) {
    if(!my_event(e)) return
    if(e.which==27) {
      onclose && onclose()
      $.calendar_hide()
    }
  }

  $.calendar_show = function(cl) {
    onclose=cl
    save_input_handler(
      function() { $(document).bind('keyup',only_escape) },
      function() { $(document).unbind('keyup',only_escape) }
    )

    calp=$('#calendar-parent')
    if(calp.length==0) {
      calp=$('<div>').attr('id','calendar-parent').appendTo('body')
      var src="http://www.google.com/calendar/XXX"
      $('<iframe>').
        attr('id','calendar').
        attr('src',src).
        appendTo(calp)
    }

    calp.show()
  }

  $.calendar_hide = function() {
    if(calp == null) return
    calp.hide()
    calp=null
    restore_input_handler()
  }
})(jQuery)
