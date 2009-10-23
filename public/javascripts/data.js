function Data(this_tag, all_tags, all_items) {
  var self=this
  self.tags=[]
  self.items=[]
  self.filters=[]
  self.filter_type=true
  self.main_tag=null
  self.item_show=null
  self.undo_levels=[]

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

  to_a(all_tags).each(function(x) {
    var t=new Tag(x.value,x.extra,x.id)
    self.tags.push(t)
  });

  // reordering tags (in, next, waiting, someday first)
  ['someday','waiting','next','in'].each(function(x) {
    var ind=self.tags.index(this_value(x))
    if(ind!=0) {
      self.tags[0].ui.before(self.tags[ind].ui)
      var tag=self.tags.splice(ind,1).shift()
      self.tags.splice(0,0,tag)
    }
  })

  try {
    self.main_tag=self.tag_value(this_tag)
  } catch(excp) {}

  all_items.each(function(x) {
    var item=new Item(x.value,x.id)
    self.add_item(item)
    x.tags.each(function(t) {
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
  return this.items.index(this_value(item.value))
}

Data.prototype.item_id = function(id) {
  return this.items[this.items.index(this_id(id))]
}

Data.prototype.has_item = function(item) {
  return this.items.contains(this_value(item.value))
}

Data.prototype.tag = function(tag) {
  return this.tags.index(this_value(tag.value))
}

Data.prototype.tag_id = function(id) {
  return this.tags[this.tags.index(this_id(id))]
}

Data.prototype.tag_value = function(value) {
  return this.tags[this.tags.index(this_value(value))]
}

Data.prototype.has_tag = function(tag) {
  return this.tags.contains(this_value(tag.value))
}

Data.prototype.filter = function(tag) {
  return this.filters.index(this_value(tag.value))
}

Data.prototype.has_filter = function(tag) {
  return this.filters.contains(this_value(tag.value))
}

Data.prototype.update_filter = function() {
  var self=this
  var tf=$('#tag_filters').empty()
  var len=self.filters.length

  if(len > 0) span('sep','&&').appendTo(tf)
  if(len > 1) span('sep','(').appendTo(tf)

  self.filters.each(function(x,i) {
    span('tag_filter',x.value_or_extra()).drag_deleter({
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

  self.items.each(function(item) {
    self.check_filtering(item)
  })
  self.save_filters_cookie()
}

Data.prototype.filter_status = function(item) {
  if(this.filters.length==0)
    return false
  return !(this.filter_type ?
    this.filters.all(related_to_item(item)) :
    this.filters.any(related_to_item(item)))
}

Data.prototype.check_filtering = function(item) {
  if(this.filter_status(item)) {
    if(item==this.item_show) {
      item.show_mark(false)
      this.item_show=null
    }
    item.ui.hide()
  }
  else
    item.ui.show()
}

Data.prototype.next = function(item) {
  var self=this
  var pos=-1
  if(item!=null)
    pos=self.item(item)
  for(var i=pos+1;i<self.items.length;i++) {
    if(!self.filter_status(self.items[i])) {
      return self.items[i]
    }
  }
  return null
}

Data.prototype.prev = function(item) {
  var self=this
  var pos=self.items.length
  if(item!=null)
    pos=self.item(item)
  for(var i=pos-1;i>=0;i--) {
    if(!self.filter_status(self.items[i])) {
      return self.items[i]
    }
  }
  return null
}

Data.prototype.order_from_cookie = function() {
  var self=this
  var o=cr(this_tag+'_order')
  if(o!=null)
    o.split(',').each(function(x) {
      try {
        item_move_after(self.item_id(x),self.items[self.items.length-1])
      } catch(e) {}
    })
  self.save_order_cookie()
}

Data.prototype.save_order_cookie = function() {
  cs(this_tag+'_order',this.items.map(get_id).join(','))
}

Data.prototype.filters_from_cookie = function() {
  var self=this
  var t=cr(this_tag+'_ftype')
  var f=cr(this_tag+'_filters')
  if(t=='or') or_filtering()
  if(t=='and') and_filtering()

  if(f==null) return
  f.split(',').each(function(x) {
    try { tag_filter(self.tag_id(x)) } catch(e) {}
  })
}

Data.prototype.save_filters_cookie = function() {
  cs(this_tag+'_ftype',this.filter_type?'and':'or')
  if(this.filters.length==0)
    cd(this_tag+'_filters')
  else
    cs(this_tag+'_filters',this.filters.map(get_id).join(','))
}

Data.prototype.add_undo = function(lev) {
  if(lev == 0) return
  this.undo_levels.push(lev || 1)
  //log('undo level='+this.undo_levels.join(', '))
  this.save_undo_cookie()
}

Data.prototype.join_undos = function(lev) {
  //log('join undo levels (last '+lev+')')
  var sum=0
  for(var i=0;i<lev;i++) {
    sum+=this.undo_levels.pop()
  }
  this.add_undo(sum)
}

Data.prototype.last_undo = function() {
  if(this.undo_levels.length==0)
    return 0
  var l=this.undo_levels.pop()
  this.save_undo_cookie()
  return l
}

Data.prototype.undo_from_cookie = function() {
  var self=this
  var o=cr('undo')
  self.undo_levels=[]
  if(o!=null)
    o.split(',').each(function(x) { self.undo_levels.push(x) })
  self.save_undo_cookie()
}

Data.prototype.save_undo_cookie = function() {
  if(this.undo_levels.length==0)
    cd('undo')
  else
    cs('undo',this.undo_levels.join(','))
}
