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
      var tid=$(ui.draggable).oid()
      //log('dropped '+tid+' into title')
      var pos=_d.find_tag_by_id(tid)
      if(pos==-1) {
        assert_failed('unknown tag id: '+xt.id)
        return
      }
      _d.tags[pos].filter()
    }
  })

  $('#dump').click(function() { _d.log() })
})
