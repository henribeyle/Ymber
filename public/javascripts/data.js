function Data(this_tag, all_tags, all_items) {
  var self=this
  self.tags=[]
  self.items=[]
  self.filters=[]
  self.filter_type=true
  self.main_tag=null

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
    t.show()
    self.add_tag(t)
  })

  var tid=self.find_tag(this_tag)
  if(tid!=-1)
    self.main_tag=self.tags[tid]

  $.each(all_items,function(i,x) {
    var i=new Item(x.item.value,x.item.id)
    i.show()
    self.add_item(i)
    $.each(x.item.tags,function(it,xt) {
      var pos=self.find_tag_by_id(xt.id)
      if(pos==-1) {
        assert_failed('unknown tag id: '+xt.id)
        return
      }
      i.add_tag(self.tags[pos])
    })
  })
}

Data.prototype.add_tag = function(t) {
  this.tags.push(t)
}

Data.prototype.add_item = function(i) {
  this.items.push(i)
}

Data.prototype.remove_tag = function(value) {
  var pos=this.find_tag(value)
  if(pos!=-1)
    this.tags.splice(pos,1)
  else
    assert_failed('remove_tag "unknown tag" '+value)
  var posf=this.find_filter(value)
  if(posf!=-1)
    this.unfilter(this.filters[posf])
}

Data.prototype.remove_item = function(value) {
  var pos=this.find_item(value)
  if(pos!=-1)
    this.items.splice(pos,1)
  else
    assert_failed('remove_item "unknown item" '+value)
}

Data.prototype.find_tag = function(value) {
  return $.pos(this.tags,this_value(value))
}

Data.prototype.find_tag_by_id = function(id) {
  return $.pos(this.tags,this_id(id))
}

Data.prototype.find_item = function(value) {
  return $.pos(this.items,this_value(value))
}

Data.prototype.log = function() {
  console.dir(this)
}

Data.prototype.find_filter = function(value) {
  return $.pos(this.filters,this_value(value))
}

Data.prototype.filter = function(tag) {
  //log('filter: '+tag.value)
  var pos=this.find_filter(tag.value)
  if(pos!=-1) {
    assert_failed('unknown filter: '+tag.value)
    return
  }
  this.filters.push(tag)
  this.update_filter()
}

Data.prototype.unfilter = function(tag) {
  //log('unfilter: '+tag.value)
  var pos=this.find_filter(tag.value)
  if(pos==-1) {
    assert_failed('unknown filter (-): '+tag.value)
    return
  }
  this.filters.splice(pos,1)
  this.update_filter()
}

Data.prototype.update_filter = function() {
  var self=this
  var tf=$('#tag_filters')
  tf.empty()
  var len=self.filters.length

  if(len > 0) 
    $('<span>').addClass('sep').html('&&').appendTo(tf)
  if(len > 1) 
    $('<span>').addClass('sep').html('(').appendTo(tf)
    
  var ft=self.filter_type ? '&&' : '||'
  var ao=$('<span>').addClass('andor').html(ft).click(function() {
    self.filter_type=!self.filter_type
    self.update_filter()
  })
  $.each(self.filters,function(i,x) {
    $('<span>').addClass('tag_filter').html(x.value).appendTo(tf)
    if(i<len-1)
      ao.appendTo(tf)
  })
  if(len > 1) 
    $('<span>').addClass('sep').html(')').appendTo(tf)

  $.each(self.items,function(i,x) {
    var show=(self.filter_type ? $.and : $.or)(self.filters,related_to_item(x))
    len==0 || show ? x.show() : x.hide() 
  })
}
