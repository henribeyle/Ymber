// commands are functions which make all the work in the gui
// but which can be called from different places
// they all accept two functions at the end (may be null)
// which will be called on success or on failure

function item_new(value,mtag,nT,nF) {
  if(is_a(mtag)) {
    var dp=encodeURIComponent('item[value]='+value)
    dp+='&'+$.map(mtag,function(x) {
      return encodeURIComponent('tag[]='+x.id)
    }).join('&')
  } else if(typeof mtag == 'object') {
    var dp=$.param({'item[value]': value, 'tag[]': mtag.id })
  } else {
    var dp=$.param({'item[value]': value})
  }

  $.ajax({
    type: "POST",
    url: "/items",
    data: dp,
    success: suc(nT,nF,function(a) {
      var item=new Item(a.value,a.id)
      _d.add_item(item)
      a.tags.each(function(t) {
        var tag=_d.tag_id(t.id)
        item.add_tag(tag)
        tag.add(item)
        item.tag_ui(tag)
      })
      _d.check_filtering(item)
      _d.save_order_cookie()
    }),
    error: te(nF)
  })
}

function item_delete(item,nT,nF) {
  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id,
    success: suc(nT,nF,function(a) {
      item.tags.concat().each(function(tag) {
        tag.rm(item)
      })
      if(item==_d.item_show)
        _d.item_show=null
      _d.rm_item(item)
      _d.save_order_cookie()
      item.destroy_ui()
    }),
    error: te(nF)
  })
}

function item_update(item,value,nT,nF) {
  $.ajax({
    type: "PUT",
    url: "/items/"+item.id,
    data: {'item[value]': value},
    success: suc(nT,nF,function(a) { item.update(a.value) }),
    error: te(nF)
  })
}

function item_add_tag(item,tag,nT,nF) {
  if(item.has(tag)) return

  $.ajax({
    type: "PUT",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) {
      item.add_tag(tag)
      tag.add(item)
      item.tag_ui(tag)
    }),
    error: te(nF)
  })
}

function item_remove_tag(item,tag,nT,nF) {
  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) {
      item.rm(tag)
      tag.rm(item)
      item.rm_ui(tag)
      if(tag == _d.main_tag) {
        _d.rm_item(item)
        item.destroy_ui()
      }
      _d.check_filtering(item)
    }),
    error: te(nF)
  })
}

function tag_new(value,nT,nF) {
  $.ajax({
    type: "POST",
    url: "/tags",
    data: { 'tag[value]': value.replace(/\n/,'') },
    success: suc(nT,nF,function(a) {
      _d.add_tag(new Tag(a.value,a.extra,a.id))
    }),
    error: te(nF)
  })
}

function tag_delete(tag,nT,nF) {
  $.ajax({
    type: "DELETE",
    url: "/tags/"+tag.id,
    success: suc(nT,nF,function(a) {
      tag.items.concat().each(function(item) {
        item.rm(tag)
        tag.rm(item)
        item.rm_ui(tag)
      })
      tag_unfilter(tag)
      _d.rm_tag(tag)
      tag.destroy_ui()
      if(tag == _d.main_tag) go_to('')
    }),
    error: te(nF)
  })
}

function tag_update(tag,value,nT,nF) {
  $.ajax({
    type: "PUT",
    url: "/tags/"+tag.id,
    data: { 'tag[value]' : value.replace(/\n/,'') },
    success: suc(nT,nF,function(a) {
      tag.update(a.value)
      tag.items.each(function(item) {
        item.update_tag(tag)
      })
      if(tag==_d.main_tag)
        go_to(tag.value)
      if(tag.filtering)
        _d.update_filter()
    }),
    error: te(nF)
  })
}

function tag_filter(tag,nT,nF) {
  if(tag == _d.main_tag || _d.has_filter(tag)) {
    nF && nF()
    return
  }

  tag.filter_on()
  _d.add_filter(tag)
  _d.update_filter()
  nT && nT()
}

function tag_unfilter(tag,nT,nF) {
  if(tag == _d.main_tag || !_d.has_filter(tag)) {
    nF && nF()
    return
  }

  tag.filter_off()
  _d.rm_filter(tag)
  _d.update_filter()
  nT && nT()
}

function and_filtering(nT,nF) {
  if(_d.filter_type) {
    nF && nF()
  }
  _d.filter_type=true
  _d.update_filter()
  nT && nT()
}

function or_filtering(nT,nF) {
  if(!_d.filter_type) {
    nF && nF()
  }
  _d.filter_type=false
  _d.update_filter()
  nT && nT()
}

function item_show(item,nT,nF) {
  if(_d.item_show)
    _d.item_show.show_mark(false)
  _d.item_show=item
  if(_d.item_show) {
    _d.item_show.show_mark(true)
    nT && nT()
  } else {
    nF && nF()
  }
}

function item_show_next(nT,nF) {
  var item=_d.next(_d.item_show)
  if(item)
    item_show(item,nT,nF)
  else {
    nF && nF()
  }
}

function item_show_prev(nT,nF) {
  var item=_d.prev(_d.item_show)
  if(item)
    item_show(item,nT,nF)
  else {
    nF && nF()
  }
}

function item_expand(item,nT,nF) {
  item.expand()
  nT && nT()
}

function item_collapse(item,nT,nF) {
  item.collapse()
  nT && nT()
}

function item_toggle_expand(item,nT,nF) {
  item.toggle_expand()
  nT && nT()
}

function item_expand_all(nT,nF) {
  _d.items.each(function(item) { item_expand(item,nT,nF) })
}

function item_collapse_all(nT,nF) {
  _d.items.each(function(item) { item_collapse(item,nT,nF) })
}

function item_move_selection_down(nT,nF) {
  if(_d.item_show==null) {
    nF && nF()
    return
  }
  var item=_d.next(_d.item_show)
  if(item) {
    item_move_after(_d.item_show,item,nT,nF)
  }
  else {
    nF && nF()
  }
}

function item_move_selection_up(nT,nF) {
  if(_d.item_show==null) {
    nF && nF()
    return
  }
  var item=_d.prev(_d.item_show)
  if(item) {
    item_move_before(_d.item_show,item,nT,nF)
  }
  else {
    nF && nF()
  }
}

function item_move_before(item1,item2,nT,nF) {
  //log('want to put '+item1.value+' before '+item2.value)
  if(item1==item2) {
    nF && nF()
    return
  }

  _d.rm_item(item1)
  _d.items.splice(_d.item(item2),0,item1)

  item2.ui.before(item1.ui)
  _d.save_order_cookie()
  nT && nT()
}

function item_move_after(item1,item2,nT,nF) {
  //log('want to put '+item1.value+' after '+item2.value)
  if(item1==item2) {
    nF && nF()
    return
  }
  _d.rm_item(item1)
  _d.items.splice(_d.item(item2)+1,0,item1)

  item2.ui.after(item1.ui)
  _d.save_order_cookie()
  nT && nT()
}

function item_send_to_next(item,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_next=_d.tag_value('next')
  item_remove_tag(item,tag_in,function() {
    if(item==_d.item_show)
      _d.item_show=null
    item_add_tag(item,tag_next,function() {
      nT && nT()
    },nF)
  },nF)
}

function item_send_to_waiting(item,nT,nF) {
  var tag_in=_d.tag_value('in')
  var tag_waiting=_d.tag_value('waiting')
  item_update(item,'['+today()+'] '+item.value,function(){
    item_remove_tag(item,tag_in,function() {
      if(item==_d.item_show)
        _d.item_show=null
      item_add_tag(item,tag_waiting,function() {
        nT && nT()
      },nF)
    },nF)
  },nF)
}

function item_split(item,selection,nT,nF) {
  if(selection=='') {
    $.warning('selection cant be void in division')
    nF && nF()
    return
  }

  var data=divide(item.value,selection," - ")
  if(data==null) {
    $.warning('division produced errors')
    nF && nF()
    return
  }

//   for(var i=0;i<data.length;i++)
//      log("data ["+i+"]= '"+data[i]+"'")

  item_update(item,data[0],function(){
    for(var i=data.length-1;i>0;i--) {
      item_new(data[i],item.tags,function() {
        item_move_after(_d.items[_d.items.length-1],item)
      })
    }
  },nF)
  nT && nT()
}
