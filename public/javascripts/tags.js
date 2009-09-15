function Tag(value,id) {
  var self=this

  self.value=value
  self.id=id
  self.items=[]

  self.ui=$('<div>').attr('id','tag-'+self.id).addClass('tag')
  self.ui.append(delete_button().click(function() { self.destroy() }))
  self.ui.append($('<span>').addClass('value').html(self.value))
  self.ui.hide()
  self.ui.appendTo('#tags')
  self.ui.dblclick(function(e) {
    clear_selection()
    //log('double click:'+self.id)
    self.edit_start()
  })

  self.uie=$('<div>').attr('id','edit-tag-'+self.id).addClass('edittag')
  self.uie.append($('<textarea>'))
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.hide()
  self.uie.appendTo('#tags')
}

Tag.prototype.destroy = function() {
  //log('destroy.tag:'+this.id)
  var self=this
  ajax_tag_destroy(self.id,function(a) {
    //log('destroyed.tag:'+self.id+' ')
    $.each(self.items,function(i,x) {
      x.remove_tag(self.value)
    })
    _d.remove_tag(self.value)
    self.ui.remove()
    self.uie.remove()
  })
}

Tag.prototype.show = function() {
  //log('show.tag:'+this.id)
  this.ui.show()
}

Tag.prototype.hide = function() {
  //log('hide.tag:'+this.id)
  this.ui.hide()
}

Tag.prototype.edit_start = function() {
  //log('edit_start.tag:'+this.id)
  this.ui.hide()
  this.uie.show()
  $('textarea',this.uie).val(this.value).focus()
}

Tag.prototype.edit_accept = function() {
  var self=this
  var nv=$('textarea',self.uie).val()
  //log('edit_accept.tag:'+self.id+' into '+nv)
  ajax_tag_update(self.id,nv,function(a) {
    self.update(a.tag.value)
    self.edit_cancel()
  })
}

Tag.prototype.edit_cancel = function() {
  //log('edit_cancel.tag:'+this.id)
  this.uie.hide()
  this.ui.show()
}

Tag.prototype.update = function(new_value) {
  var self=this
  self.value=new_value
  $('.value',self.ui).html(self.value)
  $.each(self.items,function(i,x) {
    x.update_tag(self)
  })
}

Tag.prototype.remove_item = function(value) {
  //log('remove_item.tag:'+this.id+' '+value)
  var pos=this.find_item(value)
  if(pos!=-1)
    this.items.splice(pos,1)
  else
    assert_failed('tag.remove_item "unknown item" '+value)
}

Tag.prototype.find_item = function(value) {
  for(var i=0;i<this.items.length;i++) {
    if(this.items[i].value==value)
      return i
  }
  return -1
}