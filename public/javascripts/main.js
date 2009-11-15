var _d=null
var debug=false

$(function() {
  if(debug!==true)
    window.onerror=catch_all

  $.fn.extend({
    id: function() {
      var i=this.attr('id')
      if(i) return i
      var p=this.parents('[id]').eq(0)
      if(p) return p.attr('id')
      return null
    },
    oid: function() {
      return this.id().replace(/^(item|tag)-/,'')
    }
  })

  function resize_handler() {
    function do_resize() {
      $('#left').width($('body').width()-$('#right').width())
    }
    do_resize.delay(500)
  }

  save_input_handler(
    function() { $(document).bind('keyup', main_key_handler) },
    function() { $(document).unbind('keyup', main_key_handler) }
  )

  $(document).keydown(disable_ctrl_keys)

  $(window).bind('resize', resize_handler)
  resize_handler()

  $('#add_item_button').click(add_item_helper)
  $('#add_tag_button').click(add_tag_helper)
  $('#undo_button').click(undo)
  $('#redo_button').click(redo)
  $('#review_button').click(toggle_review)
  $('#help_button').click(show_help)

  $('#review').click(function() { _d.review_off() })

  load_data()
})
