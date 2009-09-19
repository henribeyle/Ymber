function Item(value,id,data) {
  var self=this

  self.value=value
  self.id=id
  self.tags=[]

  self.ui=$('<div>').attr('id','item-'+self.id).addClass('item')
  self.ui.append(span('value',self.value))
  self.ui.appendTo('#items')
  $('.value',self.ui).dblclick(function(e) {
    clear_selection()
    //log('double click:'+self.id)
    self.edit_start()
  })
  self.ui.droppable({
    accept: '.tag',
    hoverClass: 'dropping-into-item',
    drop: function(event, ui) {
      item_add_tag(self,_d.tag_id($(ui.draggable).oid()))
    }
  })

  self.uie=$('<div>').attr('id','edit-item-'+self.id).addClass('edititem')
  self.textarea=$('<textarea>').
    attr('name','edit-item-'+self.id).
    quick_editor({
      name: 'item-id-'+self.id,
      ctrlenter: function() { self.edit_accept() },
      esc: function() { self.edit_cancel() },
      ctrldel: function() { item_delete(self) }
    })
  self.uie.append(self.textarea)
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.append(delete_button().click(function() { item_delete(self) }))
  self.uie.hide()
  self.uie.appendTo('#items')
}

Item.prototype.add_tag = function(tag) { 
  if(this.has_tag(tag))
    assert_failed('tag '+tag.value+' is already in item '+this.value)
  this.tags.push(tag) 
}
Item.prototype.rm_tag = function(tag) { this.tags.splice(this.tag(tag),1) }

Item.prototype.tag = function(tag) {
  return $.index(this.tags,this_value(tag.value))
}

Item.prototype.has_tag = function(tag) {
  return $.exists(this.tags,this_value(tag.value))
}

// these have to do with ui

Item.prototype.edit_start = function() {
  this.ui.hide()
  this.uie.show()
  this.textarea.val(this.value).focus()
}

Item.prototype.edit_accept = function() {
  var self=this
  item_update(self,self.textarea.val(),function() { self.edit_cancel() })
}

Item.prototype.edit_cancel = function() {
  this.uie.hide()
  this.ui.show()
}

Item.prototype.tag_ui = function(tag) {
  var self=this
  var t1=span('stag').addClass('tag-id-'+tag.id)
  var t2=span('content',tag.value)
  t1.drag_deleter({
    on_delete: function() { item_remove_tag(self,tag) }
  })
  t1.append(t2)
  self.ui.append(t1)
}

Item.prototype.update = function(value) {
  $('.value',this.ui).html(this.value=value)
}

Item.prototype.update_tag = function(tag) {
  $('.tag-id-'+tag.id+' .content',this.ui).html(tag.value)
}

Item.prototype.rm_tag_ui = function(tag) {
  $('.tag-id-'+tag.id,this.ui).remove()
}
