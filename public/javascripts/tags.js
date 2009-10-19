function Tag(value,extra,id) {
  var self=this

  self.value=value
  self.extra=extra ? extra : ''
  self.id=id
  self.items=[]
  self.filtering=false

  self.ui=$('<span>').attr('id','tag-'+self.id).appendTo('#tags')

  $('<span>').
    addClass('tag').
    append(span('value',self.value_or_extra())).
    append(span('nobreak','&nbsp')).
    append($('<img>').
      attr('src','/images/go.png').
      attr('title','go').
      addClass('go').
      click(function() { go_to(self.value) })).
    appendTo(self.ui).
    fixClick(function() {
        self.filtering ? tag_unfilter(self) : tag_filter(self)
      },function() {
      clear_selection()
      self.edit()
    }).
    draggable({
      opacity: 0.5,
      helper: 'clone',
      cursor: 'move',
      revert: 'invalid'
    })
  //self.ui.width($('.tag',self.ui).width())
}

Tag.prototype.value_or_extra = function() {
  return this.extra != '' ? this.extra : this.value
}

Tag.prototype.add = function(item) {
  if(this.has(item))
    assert_failed('item '+item.value+' is already in tag '+this.value)
  this.items.push(item)
}
Tag.prototype.rm = function(item) { this.items.splice(this.item(item),1) }

Tag.prototype.item = function(item) {
  return this.items.index(this_value(item.value))
}

Tag.prototype.has = function(item) {
  return this.items.contains(this_value(item.value))
}

// these have to do with ui

Tag.prototype.edit = function() {
  var self=this
  $.editor({
    title: 'Edit tag',
    text: self.value,
    rows: 1,
    commands: [ {
        img: './images/delete.png',
        title: 'delete',
        accel: ctrl_del,
        click: function(x) { tag_delete(self,p_mess('tag deleted')) }
      }, {
        img: './images/cancel.png',
        title: 'cancel',
        accel: esc
      }, {
        img: './images/ok.png',
        title: 'accept',
        accel:  enter,
        click: function(x) { tag_update(self,x,p_mess('tag updated')) }
      }
    ]
  })
}

Tag.prototype.update = function(new_value) {
  this.value=new_value
  $('.value',this.ui).html(this.value_or_extra())
  self.ui.width($('.tag',self.ui).width())
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
  this.ui.remove()
}
