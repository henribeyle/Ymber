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
    self.tags.push(t)
  })

  try {
    var tid=$.index(this.tags,this_value(this_tag))
    self.main_tag=self.tags[tid]
  } catch(excp) {}

  $.each(all_items,function(i,x) {
    var i=new Item(x.item.value,x.item.id)
    i.show()
    self.items.push(i)
    $.each(x.item.tags,function(it,xt) {
      i.add_tag(self.tag_id(xt.id))
    })
  })
}

Data.prototype.item = function(item) {
  return $.index(this.items,this_value(item.value))
}

Data.prototype.tag = function(tag) {
  return $.index(this.tags,this_value(tag.value))
}

Data.prototype.tag_id = function(id) {
  return this.tags[$.index(this.tags,this_id(id))]
}

Data.prototype.filter = function(tag) {
  return $.index(this.filters,this_value(tag.value))
}

Data.prototype.has_filter = function(tag) {
  return $.exists(this.filters,this_value(tag.value))
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
  $.each(self.filters,function(i,x) {
    var z=$('<span>').addClass('tag_filter').html(x.value)
    z.drag_deleter({
      on_delete: function() { tag_unfilter(x) }
    })
    z.appendTo(tf)
    if(i<len-1) {
      $('<span>').addClass('andor').html(ft).click(function() {
        self.filter_type=!self.filter_type
        self.update_filter()
      }).appendTo(tf)
    }
  })

  if(len > 1)
    $('<span>').addClass('sep').html(')').appendTo(tf)

  $.each(self.items,function(i,x) {
    var show=(self.filter_type ? $.and : $.or)(self.filters,related_to_item(x))
    len==0 || show ? x.show() : x.hide()
  })
}
