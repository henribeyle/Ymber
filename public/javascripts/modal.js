(function($) {

  var modal_node = null;
  var onclose = null;

  $.modal = function(msg,cl) {
    $.modal_hide()
    if(!msg) return
    modal_node=msg
    onclose=cl

    $('<div>').attr('id','modal-ui-overlay').
      attr('title','Click to close').click($.modal_hide).appendTo('body')

    $('<div>').attr('id','modal-ui').append(modal_node.
        css('left',($(window).width()-modal_node.width())/2).
        show()).
      appendTo('body')

    $(document).bind('mousedown mouseup keydown keypress', modal_handler).
      bind('keyup', 'esc', $.modal_hide )
  }

  $.modal_hide = function() {
    if(!modal_node) return
    modal_node.appendTo('body').hide()
    $(document).unbind('mousedown mouseup keydown keypress', modal_handler)
    $('#modal-ui-overlay,#modal-ui').remove()
    onclose && onclose()
    modal_node=null
    onclose=null
  }

  function modal_handler(e) {
    return $(e.target).parents('#modal-ui-overlay,#modal-ui').length > 0
  }

})(jQuery)
