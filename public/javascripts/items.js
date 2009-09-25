function Item(value,id,data) {
  var self=this

  self.value=value
  self.id=id
  self.tags=[]

  self.mui=$('<div>').attr('id','item-'+self.id).appendTo('#items')

  self.ui=$('<div>').addClass('item')
  self.ui.append(show_mark().css('visibility','hidden'))
  self.ui.append(span('value',self.value))
  self.ui.appendTo(self.mui)
  $('.value',self.ui).fixClick(function() {
    item_show(self)
  },function() {
    clear_selection()
    self.edit_start()
  })
  self.ui.droppable({
    accept: '.tag',
    hoverClass: 'dropping-into-item',
    drop: function(event, ui) {
      item_add_tag(self,_d.tag_id($(ui.draggable).oid()))
    }
  })

  self.uie=$('<div>')
  self.uie.append($('<textarea>').
    attr('rows','20').
    quick_editor({
      name: 'item-id-'+self.id,
      ctrlenter: function() { self.edit_accept() },
      esc: function() { self.edit_cancel() },
      ctrldel: function() { item_delete(self) }
    }))
  self.uie.append(delete_button().click(function() { item_delete(self) }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.hide()
  self.uie.appendTo(self.mui)
}

Item.prototype.add_tag = function(tag) {
  if(this.has(tag))
    assert_failed('tag '+tag.value+' is already in item '+this.value)
  this.tags.push(tag)
}
Item.prototype.rm = function(tag) { this.tags.splice(this.tag(tag),1) }

Item.prototype.tag = function(tag) {
  return $.index(this.tags,this_value(tag.value))
}

Item.prototype.has = function(tag) {
  return $.exists(this.tags,this_value(tag.value))
}

// these have to do with ui

Item.prototype.edit_start = function() {
  this.ui.hide()
  this.uie.show()
  $('textarea',this.uie).val(this.value).focus()
}

Item.prototype.edit_accept = function() {
  var self=this
  item_update(self,$('textarea',self.uie).val(),function() { self.edit_cancel() })
}

Item.prototype.edit_cancel = function() {
  $('textarea',this.uie).blur()
  this.uie.hide()
  this.ui.show()
}

Item.prototype.tag_ui = function(tag) {
  var self=this
  span('stag').
    addClass('tag-id-'+tag.id).
    append(span('content',tag.value)).
    drag_deleter({ on_delete: function() { item_remove_tag(self,tag) } }).
    appendTo(self.ui)
}

Item.prototype.update = function(value) {
  $('.value',this.ui).html(this.value=value)
}

Item.prototype.update_tag = function(tag) {
  $('.tag-id-'+tag.id+' .content',this.ui).html(tag.value)
}

Item.prototype.rm_ui = function(tag) {
  $('.tag-id-'+tag.id,this.ui).remove()
}

Item.prototype.destroy_ui = function() {
  this.mui.remove()
}

Item.prototype.show_mark = function(on) {
  $('img.show',this.ui).css('visibility',on?'visible':'hidden')
}
