var _d=null

$(function() {
  _d=new Data(this_tag,all_tags,all_items)

  $('#add_tag').append(add_button().click(function() { 
    ajax_tag_create($('#add_tag_text').val(),function(x) {
      var t=new Tag(x.tag.value,x.tag.id)
      t.show()
      _d.add_tag(t)
      $('#add_tag_text').val('').focus()
    })
  }))

  $('#add_item').append(add_button().click(function() { 
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
  }))

  $('#dump').click(function() { _d.log() })
})
