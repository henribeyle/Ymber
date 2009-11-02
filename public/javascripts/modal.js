(function($) {
  $.modal = function(what) {

    function close(val) {
      if($('#modal-ui').length == 0) {
        $.error('no modal found')
        return
      }

      restore_input_handler()
      $('#modal-ui-overlay,#modal-ui-wrapper').remove()
    }

    var keys = function(e) {
      //log('[modal]? '+e.which+' type '+e.type)
      if(!my_event(e)) return
      //log('[modal] '+e.which+' type '+e.type)

      if(e.which == 27)
        close()
    }

    if($('#modal-ui').length != 0) {
      $.error('cant have more than one modal')
      return
    }

    if(typeof what == 'string')
      what=$('<div>').html(what)

    var modal_div=$('<div>').
      attr('id','modal-ui').
      append(what)

    $('<div>').
      attr('id','modal-ui-wrapper').
      append(modal_div).
      appendTo('body')

    $('<div>').
      attr('id','modal-ui-overlay').
      attr('title','Click to close').
      click(close).
      appendTo('body')

    var wwidth=$(window).width()
    modal_div.show().width(wwidth*0.8)
    modal_div.css('left',(wwidth-modal_div.width())/2)

    var wheight=$(window).height()
    var eheight=modal_div.height()

    if(eheight>wheight) {
      modal_div.css('top',0).height(wheight)
    }else {
      modal_div.css('top',(wheight-modal_div.height())/2)
    }


    save_input_handler(
      function() { $(document).bind('keyup keypress',keys) },
      function() { $(document).unbind('keyup keypress',keys) }
    )
  }
})(jQuery)
