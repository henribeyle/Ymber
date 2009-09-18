function Tag(value,id) {
  var self=this

  self.value=value
  self.id=id
  self.items=[]
  self.filtering=false

  self.ui=$('<div>').attr('id','tag-'+self.id).addClass('tag')
  self.ui.append($('<span>').addClass('value').html(self.value))
  self.ui.append(go_button().click(function() { go_to(self.value) }))
  self.ui.hide()
  self.ui.appendTo('#tags')

  self.ui.fixClick(function() {
    //log('click:'+self.value)
    self.toggle_filter()
  },function() {
    //log('double click:'+self.value)
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
  self.uie.append($('<textarea>').
    attr('name','edit-tag-'+self.id).
    quick_editor({
      name: 'tag-id-'+self.id,
      ctrlenter: function() { self.edit_accept() },
      esc: function() { self.edit_cancel() },
      ctrldel: function() { tag_delete(self) }
  }))
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.append(delete_button().click(function() { tag_delete(self) }))
  self.uie.hide()
  self.uie.appendTo('#tags')
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
  _d.update_filter()
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
  return $.pos(this.items,this_value(value))
}

Tag.prototype.toggle_filter = function() {
  this.filtering ? this.unfilter() : this.filter()
}

Tag.prototype.filter = function() {
  if(_d.filter(this)) {
    this.filtering=true
    $('.value',this.ui).addClass('filter')
  }
}

Tag.prototype.unfilter = function() {
  if(_d.unfilter(this)) {
    this.filtering=false
    $('.value',this.ui).removeClass('filter')
  }
}
