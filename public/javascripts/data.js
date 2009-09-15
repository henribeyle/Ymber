function Data(this_tag, all_tags, all_items) {
  var self=this
  self.tags=[]
  self.items=[]
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

//   $.each(x.item.tags,function(it,xt) {
//     var tid=_tags.find_by_id(xt.id)
//     if(tid==-1) {
//       assert_failed('unknown tag id: '+xt.id)
//       return
//     }
//     e.add(_tags.g[tid])
//   })
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
}

Data.prototype.remove_item = function(value) {
  var pos=this.find_item(value)
  if(pos!=-1)
    this.items.splice(pos,1)
  else
    assert_failed('remove_item "unknown item" '+value)
}

Data.prototype.find_tag = function(value) {
  for(var i=0;i<this.tags.length;i++) {
    if(this.tags[i].value==value)
      return i
  }
  return -1
}

Data.prototype.find_item = function(value) {
  for(var i=0;i<this.items.length;i++) {
    if(this.items[i].value==value)
      return i
  }
  return -1
}

Data.prototype.log = function() {
  console.dir(this)
}
