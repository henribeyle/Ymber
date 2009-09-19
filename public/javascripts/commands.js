// commands are functions which make all the work in the gui
// but which can be called from different places
// they all accept two functions at the end (may be null)
// which will be called on success or on failure

function item_new(value,mtag,nT,nF) {
  var post_data={'item[value]': value}
  if(mtag)
    post_data['tag[]']=mtag.id

  $.ajax({
    type: "POST",
    url: "/items",
    data: post_data,
    success: suc(nT,nF,function(a) {
      var item=new Item(a.item.value,a.item.id)
      _d.add_item(item)
      $.each(a.item.tags,function(i,t) {
        var tag=_d.tag_id(t.id)
        item.add_tag(tag)
        tag.add(item)
        item.tag_ui(tag)
      })
      _d.check_filtering(item)
    }),
    error: te(nF)
  })
}

function item_delete(item,nT,nF) {
  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id,
    success: suc(nT,nF,function(a) {
      $.each(item.tags.concat(),function(i,tag) {
        tag.rm(item)
      })
      _d.rm_item(item)
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
    success: suc(nT,nF,function(a) { item.update(a.item.value) }),
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
    data: { 'tag[value]': value },
    success: suc(nT,nF,function(a) { _d.add_tag(new Tag(a.tag.value,a.tag.id)) }),
    error: te(nF)
  })
}

function tag_delete(tag,nT,nF) {
  $.ajax({
    type: "DELETE",
    url: "/tags/"+tag.id,
    success: suc(nT,nF,function(a) {
      $.each(tag.items.concat(),function(i,item) {
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
    data: { 'tag[value]' : value },
    success: suc(nT,nF,function(a) {
      tag.update(a.tag.value)
      $.each(tag.items,function(i,item) {
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
  _d.item_show.show_mark(true)
  nT && nT()
}

function item_show_next(nT,nF) {
  var pos=-1
  if(_d.item_show!=null) {
    pos=_d.item(_d.item_show)
  }
  for(var i=pos+1;i<_d.items.length;i++) {
    if(!_d.filter_status(_d.items[i])) {
      item_show(_d.items[i],nT,nF)
      return
    }
  }
  nF && nF()
}

function item_show_prev(nT,nF) {
  var pos=_d.items.length
  if(_d.item_show!=null) {
    pos=_d.item(_d.item_show)
  }
  for(var i=pos-1;i>=0;i--) {
    if(!_d.filter_status(_d.items[i])) {
      item_show(_d.items[i],nT,nF)
      return
    }
  }
  nF && nF()
}


