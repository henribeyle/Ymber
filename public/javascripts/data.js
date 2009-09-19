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
    var t=new Tag(x.tag.value,x.tag.id)
    self.tags.push(t)
  })

  try {
    self.main_tag=self.tags[$.index(self.tags,this_value(this_tag))]
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
Data.prototype.rm_item = function(item) { this.items.splice(this.item(item),1) }

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

Data.prototype.has_item = function(item) {
  return $.exists(this.items,this_value(item.value))
}

Data.prototype.tag = function(tag) {
  return $.index(this.tags,this_value(tag.value))
}

Data.prototype.tag_id = function(id) {
  return this.tags[$.index(this.tags,this_id(id))]
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
    item.ui.hide()
  }
  else
    item.ui.show()
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

Data.prototype.put_after = function(item1,item2) {
  //log('want to put '+item1.value+' after '+item2.value)
  this.rm_item(item1)
  this.items.splice(this.item(item2)+1,0,item1)

  item2.uie.after(item1.uie)
  item2.uie.after(item1.ui)
}

Data.prototype.put_before = function(item1,item2) {
  //log('want to put '+item1.value+' before '+item2.value)
  this.rm_item(item1)
  this.items.splice(this.item(item2),0,item1)

  item2.ui.before(item1.ui)
  item2.ui.before(item1.uie)
}
