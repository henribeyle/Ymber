function Item(value,id,data) {
  var self=this

  self.expanded=false
  self.value=value
  self.value_format=formatted(first_line(value))
  self.id=id
  self.tags=[]

  self.mui=$('<div>').attr('id','item-'+self.id).appendTo('#items')

  self.ui=$('<div>').addClass('item')
  self.ui.append(show_mark().css('visibility','hidden'))
  self.ui.append(span('value',self.value_format))
  self.ui.appendTo(self.mui)
  $('.value',self.ui).fixClick(function() {
    item_show(self)
  },function() {
    clear_selection()
    self.edit()
  })
  self.ui.droppable({
    accept: '.tag',
    hoverClass: 'dropping-into-item',
    drop: function(event, ui) {
      item_add_tag(self,_d.tag_id($(ui.draggable).oid()))
    }
  })
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

Item.prototype.edit = function() {
  var self=this
log('id is '+self.id)
  $.editor({
    title: 'Edit item',
    text: self.value,
    buttons: [ {
        img: './images/Minus_Red_Button.png',
        title: 'delete',
        accel: 'ctrl+del',
        click: function(x) { item_delete(self) }
      }, {
        img: './images/Stop_Red_Button.png',
        title: 'cancel',
        accel: 'esc',
        click: function(x) { log('id is '+self.id) }
      }, {
        img: './images/Clear_Green_Button.png',
        title: 'accept',
        accel: 'ctrl+return',
        click: function(x) { item_update(self,x) }
      }
    ]
  })
}

Item.prototype.tag_ui = function(tag) {
  var self=this
  var val=tag.extra != '' ? tag.extra: tag.value
  span('stag').
    addClass('tag-id-'+tag.id).
    append(span('content',val)).
    drag_deleter({ on_delete: function() { item_remove_tag(self,tag) } }).
    appendTo(self.ui)
}

Item.prototype.update = function(value) {
  this.value=value
  var v=this.expanded ? value : first_line(value)
  this.value_format=formatted(v)
  $('.value',this.ui).html(this.value_format)
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

Item.prototype.collapse = function() {
  this.expanded=false
  this.update(this.value)
}

Item.prototype.expand = function() {
  this.expanded=true
  this.update(this.value)
}
