var _d=null

$(function() {
  //window.onerror=catch_all
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

  _d=new Data(this_tag,all_tags,all_items)
  _d.order_from_cookie()
  _d.filters_from_cookie()
  _d.undo_from_cookie()

  if(_d.main_tag)
    $('#title .main').html(_d.main_tag.value_or_extra())

  if(this_tag == 'in') {
    $('<img>').
      attr('src',"/images/empty.png").
      addClass('button').
      appendTo('#title')
    $('<img>').
      attr('src',"/images/add_to_someday.png").
      attr('title','send to Someday').
      addClass('button').
      appendTo('#title').
      click(function() {
        if(_d.item_show) {
          $.select_date(null,function(x) {
            item_send_to_someday(_d.item_show,x,p_mess('item sent to someday'))
          })
        }
      })
     $('<img>').
      attr('src',"/images/add_to_waiting.png").
      attr('title','send to Waiting').
      addClass('button').
      appendTo('#title').
      click(function() {
        if(_d.item_show)
          item_send_to_waiting(_d.item_show,p_mess('item sent to waiting'))
      })
    $('<img>').
      attr('src',"/images/add_to_next.png").
      attr('title','send to Next').
      addClass('button').
      appendTo('#title').
      click(function() {
        if(_d.item_show)
          item_send_to_next(_d.item_show,p_mess('item sent to next'))
      })
  }

  $('#add_item_button').click(add_item_helper)
  $('#add_tag_button').click(add_tag_helper)
  $('#undo_button').click(undo)
  $('#redo_button').click(redo)
  $('#help_button').click(function() { alert('coming') })

  $('#title').droppable({
    accept: '.tag',
    hoverClass: 'dropping-into-item',
    drop: function(event, ui) {
      tag_filter(_d.tag_id($(ui.draggable).oid()))
    }
  })

  $("#items").sortable({
    handle: '.item-handler',
    cursor: 'move',
    opacity: 0.5,
    placeholder: 'items-sortable-placeholder',
    stop: function(e, ui) {
      var prev=null
      var oid=null

      if(ui.item[0].previousElementSibling) {
        oid=$(ui.item[0].previousElementSibling).oid()
        prev=true
      } else if(ui.item[0].nextElementSibling) {
        oid=$(ui.item[0].nextElementSibling).oid()
        prev=false
      }
      var myoid=$(ui.item[0]).oid()
      var item1=_d.item_id(myoid)
      var item2=_d.item_id(oid)
      $(this).sortable('cancel')
      if(prev)
        item_move_after(item1,item2)
      else
        item_move_before(item1,item2)
    }
  })

  $('.map-popup').live('click',function() {
    $.map_show($(this).text())
  })

  $('.more-stuff').live('click',function() {
    item_expand(_d.item_id($(this).oid()))
  })

  save_input_handler(
    function() { $(document).bind('keyup', main_key_handler) },
    function() { $(document).unbind('keyup', main_key_handler) }
  )

  function resize_handler() {
    function do_resize() {
      $('#left').width($('body').width()-$('#right').width())
    }
    do_resize.delay(500)
  }

  $(window).bind('resize', resize_handler)
  resize_handler()
})
