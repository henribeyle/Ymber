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
        tag.add_item(item)
        item.tag_ui(tag)
      })
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
        tag.rm_item(item)
      })
      _d.rm_item(item)
      item.ui.remove()
      item.uie.remove()
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
  if(item.has_tag(tag)) return

  $.ajax({
    type: "PUT",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) { 
      item.add_tag(tag) 
      tag.add_item(item)
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
      item.rm_tag(tag)
      tag.rm_item(item)
      item.rm_tag_ui(tag)
      if(tag == _d.main_tag) {
        _d.rm_item(item)
        item.ui.remove()
        item.uie.remove()
      }
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
        item.rm_tag(tag)
        tag.rm_item(item)
        item.rm_tag_ui(tag)
      })
      tag_unfilter(tag)
      _d.rm_tag(tag)
      if(tag == _d.main_tag) go_to('')
      tag.ui.remove()
      tag.uie.remove()
    }),
    error: te(nF)
  })
}

function tag_update(tag,value,nT,nF) {
  $.ajax({
    type: "PUT",
    url: "/tags/"+tag.id,
    data: { 'tag[value]' : value },
    success: suc(nT,nF,function(a) { tag.update(a.tag.value) }),
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
