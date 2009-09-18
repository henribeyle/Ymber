var _d=null

function add_tag() {
  ajax_tag_create($('#add_tag_text').val(),function(x) {
    var t=new Tag(x.tag.value,x.tag.id)
    t.show()
    _d.add_tag(t)
    $('#add_tag_text').val('').focus()
  })
}

function add_item() {
  ajax_item_create($('#add_item_text').val(),_d.main_tag,function(x) {
    var i=new Item(x.item.value,x.item.id)
    i.show()
    _d.add_item(i)
    $('#add_item_text').val('').focus()
    $.each(x.item.tags,function(it,xt) {
      var pos=_d.find_tag_by_id(xt.id)
      if(pos==-1) {
        assert_failed('unknown tag id: '+xt.id)
        return
      }
      i.add_tag(_d.tags[pos])
    })
  })
}

$(function() {
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

  $('#add_item_text').quick_editor({
      name: 'add_item_text',
      ctrlenter: add_item
  })
  $('#add_tag_text').quick_editor({
      name: 'add_tag_text',
      ctrlenter: add_tag
  })

  $('#add_tag').append(add_button().click(add_tag))
  $('#add_item').append(add_button().click(add_item))

  $('#title').droppable({
    accept: '.tag',
    hoverClass: 'dropping-into-item',
    drop: function(event, ui) {
      var tid=$(ui.draggable).oid()
      log('dropped '+tid+' into title')
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
