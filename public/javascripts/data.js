function Data(this_tag, all_tags, all_items) {
  var self=this
  self.tags=[]
  self.items=[]
  self.filters=[]
  self.filter_type=true
  self.main_tag=null
  self.item_show=null
  self.undo_levels=[]
  self.review_items=[]
  self.review_tags=[]
  self.review=false
  self.saving_cookies=false

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

  all_tags.sort(tag_compare).each(function(x) {
    var t=new Tag(x.value,x.extra,x.id,x.item_count)
    self.tags.push(t)
  });

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
    item_disappear(item)
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
  if(!this.saving_cookies) return
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
  if(!this.saving_cookies) return
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
  if(!this.saving_cookies) return
  if(this.undo_levels.length==0)
    cd('undo')
  else
    css('undo',this.undo_levels.join(','))
}

Data.prototype.review_on = function() {
  $('#review').show()
  this.review=true
  this.save_review_cookie()
  if(this.main_tag)
    this.review_tag(this.main_tag.id)
}

Data.prototype.review_off = function() {
  $('#review').hide()
  this.review=false
  this.review_items=[]
  this.review_tags=[]
  $('.review-item').removeClass('review-item')
  $('.review-tag').removeClass('review-tag')
  this.save_review_cookie()
}

Data.prototype.save_review_cookie = function() {
  if(!this.saving_cookies) return
  if(this.review)
    css('review',true)
  else
    cd('review')
  if(this.review_items.length==0)
    cd('review_items')
  else
    css('review_items',this.review_items.join(','))
  if(this.review_tags.length==0)
    cd('review_tags')
  else
    css('review_tags',this.review_tags.join(','))
}

Data.prototype.review_from_cookie = function() {
  var self=this
  self.review_items=[]
  self.review_tags=[]
  self.review=false
  if(cr('review')!=null)
    self.review=true
  if(self.review) {
    var o=cr('review_items')
    var ot=cr('review_tags')
    if(o!=null) {
      o.split(',').each(function(x) {
        self.review_item(x)
      })
    }
    if(ot!=null) {
      ot.split(',').each(function(x) {
        self.review_tag(x)
      })
    }
    self.review_on()
  }
}

Data.prototype.review_item = function(x) {
  if(!this.review) return
  $('.item','#item-'+x).addClass('review-item')
  this.review_items.include(x)
  this.save_review_cookie()
}

Data.prototype.review_tag = function(x) {
  if(!this.review) return
  $('.value','#tag-'+x).addClass('review-tag')
  this.review_tags.include(x)
  this.save_review_cookie()
}

Data.prototype.cookie_status = function() {
  this.order_from_cookie()
  this.filters_from_cookie()
  this.undo_from_cookie()
  this.review_from_cookie()
  this.saving_cookies=true
  this.save_order_cookie()
  this.save_filters_cookie()
  this.save_undo_cookie()
  this.save_review_cookie()
}
