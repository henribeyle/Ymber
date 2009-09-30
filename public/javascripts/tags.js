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
    append(span('value',self.extra=='' ? self.value : self.extra)).
    append(go_button().click(function() { go_to(self.value) })).
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

Tag.prototype.edit = function() {
  var self=this
  $.editor({
    title: 'Edit tag',
    text: self.value,
    rows: 1,
    buttons: [ {
        img: './images/Minus_Red_Button.png',
        title: 'delete',
        accel: function(e) { return e.which==46 && e.ctrlKey },
        click: function(x) { tag_delete(self) }
      }, {
        img: './images/Stop_Red_Button.png',
        title: 'cancel',
        accel: function(e) { return e.which==27 }
      }, {
        img: './images/Clear_Green_Button.png',
        title: 'accept',
        accel:  function(e) { return e.which==13 && e.ctrlKey },
        click: function(x) { tag_update(self,x) }
      }
    ]
  })
}

Tag.prototype.update = function(new_value) {
  this.value=new_value
  $('.value',this.ui).html(this.extra != '' ? this.extra : this.value)
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
