function Tag(value,extra,id) {
  var self=this

  self.value=value
  self.extra=extra ? extra : ''
  self.id=id
  self.items=[]
  self.filtering=false

  self.mui=$('<span>').attr('id','tag-'+self.id).appendTo('#tags')

  self.ui=$('<span>').addClass('tag')
  if(self.extra == '')
    self.ui.append(span('value',self.value))
  else
    self.ui.append(span('value',self.extra))
  self.ui.append(go_button().click(function() { go_to(self.value) }))
  self.ui.appendTo(self.mui)

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

  self.uie=$('<div>')
  self.textarea=$('<textarea>').
    attr('rows',1).
    quick_editor({
      name: 'tag-id-'+self.id,
      ctrlenter: function() { self.edit_accept() },
      esc: function() { self.edit_cancel() },
      ctrldel: function() { tag_delete(self) }
    })
  self.uie.append(self.textarea)
  self.uie.append(delete_button().click(function() { tag_delete(self) }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.hide()
  self.uie.appendTo(self.mui)
}

Tag.prototype.add = function(item) {
  if(this.has(item))
    assert_failed('item '+item.value+' is already in tag '+this.value)
  this.items.push(item)
}
Tag.prototype.rm = function(item) { this.items.splice(this.item(item),1) }

Tag.prototype.item = function(item) {
  return $.index(this.items,this_value(item.value))
}

Tag.prototype.has = function(item) {
  return $.exists(this.items,this_value(item.value))
}

// these have to do with ui

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
  $('textarea',this.uie).blur()
  this.uie.hide()
  this.ui.show()
}

Tag.prototype.update = function(new_value) {
  $('.value',this.ui).html(this.value=new_value)
}

Tag.prototype.filter_on = function() {
  this.filtering=true
  $('.value',this.ui).addClass('filter')
}

Tag.prototype.filter_off = function() {
  this.filtering=false
  $('.value',this.ui).removeClass('filter')
}

Tag.prototype.destroy_ui = function() {
  this.mui.remove()
}
