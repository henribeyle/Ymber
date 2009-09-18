function Tag(value,id) {
  var self=this

  self.value=value
  self.id=id
  self.items=[]
  self.filtering=false

  self.ui=$('<div>').attr('id','tag-'+self.id).addClass('tag')
  self.ui.append($('<span>').addClass('value').html(self.value))
  self.ui.append(go_button().click(function() { go_to(self.value) }))
  self.ui.appendTo('#tags')

  self.ui.fixClick(function() {
    self.filtering ? tag_unfilter(self) : tag_filter(self)
  },function() {
    clear_selection()
    self.edit_start()
  })
  self.ui.draggable({ 
    opacity: 0.5,
    helper: 'clone',
    cursor: 'move',
    revert: 'invalid'
  })

  self.uie=$('<div>').attr('id','edit-tag-'+self.id).addClass('edittag')
  self.textarea=$('<textarea>').
    attr('name','edit-tag-'+self.id).
    quick_editor({
      name: 'tag-id-'+self.id,
      ctrlenter: function() { self.edit_accept() },
      esc: function() { self.edit_cancel() },
      ctrldel: function() { tag_delete(self) }
    })
  self.uie.append(self.textarea)
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.append(delete_button().click(function() { tag_delete(self) }))
  self.uie.hide()
  self.uie.appendTo('#tags')
}

Tag.prototype.edit_start = function() {
  //log('edit_start.tag:'+this.id)
  this.ui.hide()
  this.uie.show()
  this.textarea.val(this.value).focus()
}

Tag.prototype.edit_accept = function() {
  var self=this
  tag_update(self,self.textarea.val(),function() {
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
  _d.update_filter()
}

Tag.prototype.item = function(item) {
  return $.index(this.items,this_value(item.value))
}

Tag.prototype.has_item = function(item) {
  return $.exists(this.items,this_value(item.value))
}
