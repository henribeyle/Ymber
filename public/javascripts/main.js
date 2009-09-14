var _items=null
var _tags=null
var _this_tag=null

function parse_new_tag(x) {
  var e=new E(x.tag.value,x.tag.id)
  _tags.add(e)
  return e
}

function parse_new_item(x) {
  var e=new E(x.item.value,x.item.id)
  _items.add(e)
  $.each(x.item.tags,function(it,xt) {
    var tid=_tags.find_by_id(xt.id)
    if(tid==-1) {
      assert_failed('unknown tag id: '+xt.id)
      return
    }
    e.add(_tags.g[tid])
  })
  return e
}

function build_db() {
  _items=new G()
  _tags=new G()

  if(this_tag == undefined) {
    assert_failed('this_tag is not defined')
    return
  }
  if(all_tags == undefined) {
    assert_failed('all_tags is not defined')
    return
  }
  if(all_items == undefined) {
    assert_failed('all_items is not defined')
    return
  }

  $.each(all_tags,function(i,x) { parse_new_tag(x) })

  var tid=_tags.find(this_tag)
  if(tid!=-1)
    _this_tag=_tags.g[tid]

  $.each(all_items,function(i,x) { parse_new_item(x) })
}

function item_create(x) {
  var post_data={'item[value]': x}
  if(_this_tag) {
    post_data['tag[]']=_this_tag.id
  }

  $.ajax({
    type: "POST",
    url: "/items",
    data: post_data,
    success: function(a) {
      if(a=parse(a))
        parse_new_item(a)
    },
    error: terrible_error
  })
}

function item_update(i,x) {
  var post_data=$.param({'item[value]': x})
  log(post_data)
  $.each(_items.g[i].sub.g,function(j,x) {
    post_data+='&'+'tag[]='+x.id
  })
  log(post_data)
  $.ajax({
    type: "PUT",
    url: "/items/"+_items.g[i].id,
    data: post_data,
    success: function(a) {
      if(a=parse(a)) {
        _items.remove(i)
        parse_new_item(a)
      }
    },
    error: terrible_error
  })
}

$(function() {
  build_db()

  $('#update_item_text').val(_items.g[0].value)
  $('#update_item_button').click(function() {
    item_update(0,$('#update_item_text').val())
  })

  $('#add_item_button').click(function() {
    item_create($('#add_item_text').val())
  })

  $('#show_all_items').click(function() {
    _items.log('all items:')
  })
  $('#show_all_tags').click(function() {
    _tags.log('all tags:')
  })
})
