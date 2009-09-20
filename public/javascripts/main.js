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

  function add_tag_from_textarea() {
    var v=$('#add_tag_text')
    tag_new(v.val(),function() { v.val('').focus() })
  }
  $('#add_tag_text').quick_editor({
      name: 'add_tag_text',
      ctrlenter: add_tag_from_textarea
  })
  $('#add_tag').append(add_button().click(add_tag_from_textarea))

  function add_item_from_textarea() {
    var v=$('#add_item_text')
    item_new(v.val(),_d.main_tag,function() { v.val('').focus() })
  }
  $('#add_item_text').quick_editor({
      name: 'add_item_text',
      ctrlenter: add_item_from_textarea
  })
  $('#add_item').append(add_button().click(add_item_from_textarea))

  $('#title').droppable({
    accept: '.tag',
    hoverClass: 'dropping-into-item',
    drop: function(event, ui) {
      tag_filter(_d.tag_id($(ui.draggable).oid()))
    }
  })

  $("#items")
    .sortable({
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
  }).disableSelection()


  $('#helperA').click(function() { item_show_prev() })
  $('#helperB').click(function() { item_show_next() })
  $('#helperC').click(function() { item_move_selection_up() })
  $('#helperD').click(function() { item_move_selection_down() })
})
