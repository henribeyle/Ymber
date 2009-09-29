function Data(this_tag, all_tags, all_items) {
  var self=this
  self.tags=[]
  self.items=[]
  self.filters=[]
  self.filter_type=true
  self.main_tag=null
  self.item_show=null

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

  $.each(all_tags,function(i,x) {
    var t=new Tag(x.tag.value,x.tag.extra,x.tag.id)
    self.tags.push(t)
  })

  // reordering tags (in, next and waiting first)
  $.each(['waiting','next','in'],function(i,x) {
    var ind=$.index(self.tags,this_value(x))
    if(ind!=0) {
      self.tags[0].mui.before(self.tags[ind].mui)
      var tag=self.tags.splice(ind,1).shift()
      self.tags.splice(0,0,tag)
    }
  })

  try {
    self.main_tag=self.tag_value(this_tag)
  } catch(excp) {}

  $.each(all_items,function(i,x) {
    var item=new Item(x.item.value,x.item.id)
    self.add_item(item)
    $.each(x.item.tags,function(it,t) {
      var tag=self.tag_id(t.id)
      item.add_tag(tag)
      tag.add(item)
      item.tag_ui(tag)
    })
  })
}

// adding and removing items, tags and filters

Data.prototype.add_item = function(item) {
  if(this.has_item(item))
    assert_failed('item '+item.value+' is already in data')
  this.items.push(item)
}
Data.prototype.rm_item = function(item) {
  this.items.splice(this.item(item),1)
}

Data.prototype.add_tag = function(tag) {
  if(this.has_tag(tag))
    assert_failed('tag '+tag.value+' is already in data')
  this.tags.push(tag)
}
Data.prototype.rm_tag = function(tag) { this.tags.splice(this.tag(tag),1) }

Data.prototype.add_filter = function(flt) {
  if(this.has_filter(flt))
    assert_failed('filter '+flt.value+' is already in data')
  this.filters.push(flt)
}
Data.prototype.rm_filter = function(flt) { this.filters.splice(this.filter(flt),1) }

// searching and indexing items, tags and filters

Data.prototype.item = function(item) {
  return $.index(this.items,this_value(item.value))
}

Data.prototype.item_id = function(id) {
  return this.items[$.index(this.items,this_id(id))]
}

Data.prototype.has_item = function(item) {
  return $.exists(this.items,this_value(item.value))
}

Data.prototype.tag = function(tag) {
  return $.index(this.tags,this_value(tag.value))
}

Data.prototype.tag_id = function(id) {
  return this.tags[$.index(this.tags,this_id(id))]
}

Data.prototype.tag_value = function(value) {
  return this.tags[$.index(this.tags,this_value(value))]
}

Data.prototype.has_tag = function(tag) {
  return $.exists(this.tags,this_value(tag.value))
}

Data.prototype.filter = function(tag) {
  return $.index(this.filters,this_value(tag.value))
}

Data.prototype.has_filter = function(tag) {
  return $.exists(this.filters,this_value(tag.value))
}

Data.prototype.update_filter = function() {
  var self=this
  var tf=$('#tag_filters').empty()
  var len=self.filters.length

  if(len > 0) span('sep','&&').appendTo(tf)
  if(len > 1) span('sep','(').appendTo(tf)

  $.each(self.filters,function(i,x) {
    span('tag_filter',x.value).drag_deleter({
      on_delete: function() { tag_unfilter(x) }
    }).appendTo(tf)
    if(i<len-1) {
      if(self.filter_type)
        span('andor','&&').click(function() { or_filtering() }).appendTo(tf)
      else
        span('andor','||').click(function() { and_filtering() }).appendTo(tf)
    }
  })

  if(len > 1)
    span('sep',')').appendTo(tf)

  $.each(self.items,function(i,item) {
    self.check_filtering(item)
  })
  self.save_filters_cookie()
}

Data.prototype.filter_status = function(item) {
  if(this.filters.length==0)
    return false
  return !(this.filter_type ? $.and : $.or)(this.filters,related_to_item(item))
}

Data.prototype.check_filtering = function(item) {
  if(this.filter_status(item)) {
    if(item==this.item_show) {
      item.show_mark(false)
      this.item_show=null
    }
    item.mui.hide()
  }
  else
    item.mui.show()
}

Data.prototype.next = function(item) {
  var pos=-1
  if(item!=null)
    pos=_d.item(item)
  for(var i=pos+1;i<_d.items.length;i++) {
    if(!_d.filter_status(_d.items[i])) {
      return _d.items[i]
    }
  }
  return null
}

Data.prototype.prev = function(item) {
  var pos=_d.items.length
  if(item!=null)
    pos=_d.item(item)
  for(var i=pos-1;i>=0;i--) {
    if(!_d.filter_status(_d.items[i])) {
      return _d.items[i]
    }
  }
  return null
}

Data.prototype.order_from_cookie = function() {
  var self=this
  var o=cr(this_tag+'_order')
  if(o!=null)
    $.each(o.split(','),function(i,x) {
      try {
        item_move_after(self.item_id(x),self.items[self.items.length-1])
      } catch(e) {}
    })
  self.save_order_cookie()
}

Data.prototype.save_order_cookie = function() {
  cs(this_tag+'_order',$.map(this.items,function(x) { return x.id }).join(','))
}

Data.prototype.filters_from_cookie = function() {
  var self=this
  var t=cr(this_tag+'_ftype')
  var f=cr(this_tag+'_filters')
  if(t=='or') or_filtering()
  if(t=='and') and_filtering()

  if(f==null) return
  $.each(f.split(','),function(i,x) {
    try { tag_filter(self.tag_id(x)) } catch(e) {}
  })
}

Data.prototype.save_filters_cookie = function() {
  cs(this_tag+'_ftype',this.filter_type?'and':'or')
  if(this.filters.length==0)
    cd(this_tag+'_filters')
  else
    cs(this_tag+'_filters',$.map(this.filters,function(x) { return x.id }).join(','))
}
