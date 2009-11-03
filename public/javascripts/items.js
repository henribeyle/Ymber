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
        click(function() { item_toggle_expand(self) }))).
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
  for(var i=0;i<this.tags.length;i++) {
    if(tag_compare(this.tags[i],tag)>0)
      break
  }
  if(i==this.tags.length)
    this.tags.push(tag)
  else
    this.tags.splice(i,0,tag)
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
    disallow_spaces: false,
    commands: [ {
        img: '/images/split.png',
        title: 'split',
        accel: ctrl_dot,
        close: function(x,s,e) {
          if(x!=self.value)
            item_update(self,x,function() {
              item_split(self,s,e,[],function() {
                _d.join_undos(2)
                p_mess('item has been split')()
              })
            })
          else
            item_split(self,s,e,[],p_mess('item has been split'))
        }
      }, {
        accel: ctrl_y,
        close: function(x,s,e) {
          var mes=p_mess('item has been split (and sent to next)')
          if(x!=self.value)
            item_update(self,x,function() {
              item_split(self,s,e,[_d.tag_value('next')],function() {
                _d.join_undos(2)
                mes()
              })
            })
          else
            item_split(self,s,e,[_d.tag_value('next')],mes)
        }
      },
      make_into_a_list_command(),
      justify_paragraph_command(),
      unindent_lines_command(),
      indent_lines_command(),
      {
        img: '/images/delete.png',
        title: 'delete',
        accel: ctrl_del,
        close: function(x) { item_delete(self,p_mess('item deleted')) }
      }, {
        img: '/images/cancel.png',
        title: 'cancel',
        accel: ctrl_esc,
        close: function() {}
      }, {
        img: '/images/ok.png',
        title: 'accept',
        accel:  ctrl_enter,
        close: function(x) { item_update(self,x,p_mess('item updated')) }
      }
    ]
  })
}

Item.prototype.tag_ui = function(tag) {
  var self=this
  var el=span(tag.extra != '' ? 'itag' : 'stag').
    addClass('tag4item').
    addClass('tag-id-'+tag.id).
    append(span('content',tag.value_or_extra())).
    drag_deleter({ on_delete: function() {
        item_remove_tag(self,tag,p_mess('tag removed from item')) } })

  var position=self.tags.index(this_value(tag.value))
  if(position == self.tags.length-1)
    el.insertBefore($('.value',self.ui))
  else
    el.insertBefore($('.tag4item',self.ui)[position])
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
