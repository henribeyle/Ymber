function Item(value,id,data) {
  var self=this

  self.expanded=false
  self.value=value
  self.value_format=formatted(first_line(value))
  self.id=id
  self.tags=[]

  self.ui=$('<div>').attr('id','item-'+self.id).appendTo('#items')

  $('<div>').
    addClass('item').
    append($('<span>').
      addClass('item-handler').
      append($('<img>').
        attr('src','/images/state_collapsed.png').
        addClass('show').
        css('visibility','hidden').
        click(function() { self.toggle_expand() }))).
    append(span('value',self.value_format)).
    appendTo(self.ui).
    droppable({
      accept: '.tag',
      hoverClass: 'dropping-into-item',
      drop: function(event, ui) {
        item_add_tag(self,_d.tag_id($(ui.draggable).oid()),
          p_mess('tag added to item'))
      }
    })

  $('.value',self.ui).fixClick(function() {
    item_show(self)
  },function() {
    clear_selection()
    self.edit()
  })
}

Item.prototype.add_tag = function(tag) {
  if(this.has(tag))
    assert_failed('tag '+tag.value+' is already in item '+this.value)
  this.tags.push(tag)
}
Item.prototype.rm = function(tag) { this.tags.splice(this.tag(tag),1) }

Item.prototype.tag = function(tag) {
  return this.tags.index(this_value(tag.value))
}

Item.prototype.has = function(tag) {
  return this.tags.contains(this_value(tag.value))
}

// these have to do with ui

Item.prototype.edit = function() {
  var self=this
  $.editor({
    title: 'Edit item',
    rows: 20,
    text: self.value,
    commands: [ {
        img: '/images/split.png',
        title: 'split',
        accel: ctrl_dot,
        click: function(x,s) {
          var split=function() { item_split(self,s) }
          if(x!=self.value)
            item_update(self,x,split)
          else
            split()
        }
      }, {
        img: '/images/delete.png',
        title: 'delete',
        accel: ctrl_del,
        click: function(x) { item_delete(self,p_mess('item deleted')) }
      }, {
        img: '/images/cancel.png',
        title: 'cancel',
        accel: esc
      }, {
        img: '/images/ok.png',
        title: 'accept',
        accel:  ctrl_enter,
        click: function(x) { item_update(self,x,p_mess('item updated')) }
      }
    ]
  })
}

Item.prototype.tag_ui = function(tag) {
  var self=this
  span(tag.extra != '' ? 'itag' : 'stag').
    addClass('tag-id-'+tag.id).
    append(span('content',tag.value_or_extra())).
    drag_deleter({ on_delete: function() {
        item_remove_tag(self,tag,p_mess('tag removed from item')) } }).
      insertBefore($('.value',self.ui))
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
  this.ui.remove()
}

Item.prototype.show_mark = function(on) {
  $('img.show',this.ui).css('visibility',on?'visible':'hidden')
}

Item.prototype.toggle_expand = function() {
  this.expanded ? this.collapse() : this.expand()
}

Item.prototype.collapse = function() {
  this.expanded=false
  this.update(this.value)
  $('img.show',this.ui).attr('src','/images/state_collapsed.png')
}

Item.prototype.expand = function() {
  this.expanded=true
  this.update(this.value)
  $('img.show',this.ui).attr('src','/images/state_expanded.png')
}
