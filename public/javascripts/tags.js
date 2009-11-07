function Tag(value,extra,id,count) {
  var self=this

  self.value=value
  self.extra=extra ? extra : ''
  self.id=id
  self.count=count
  self.items=[]
  self.filtering=false

  self.ui=$('<span>').attr('id','tag-'+self.id).appendTo('#tags')

  $('<a>').attr('href','/'+self.value).
    addClass('tag').
    append(span('value',self.value_or_extra())).
    appendTo(self.ui).
    fixClick(function(e) {
        go_to(self.value)
      },function(e) {
        clear_selection()
        self.edit()
    }).
    draggable({
      opacity: 0.5,
      helper: 'clone',
      cursor: 'move',
      revert: 'invalid'
    })

  $('[title]',self.ui).attr("title", "")
  var tt=$('<div>').addClass('tooltip')
  function remove_tooltip() { tt.remove() }
  self.ui.hover(function(e){
    $("body").append(tt)
    tt.css("left", e.pageX - 12 - tt.width()).
      css("top", e.pageY + 12).
      html(self.count+' items').
      fadeIn("medium")
    remove_tooltip.delay(2000)
  }, remove_tooltip)

  self.check_textual()
}

Tag.prototype.value_or_extra = function() {
  return this.extra != '' ? this.extra : this.value
}

Tag.prototype.check_textual = function() {
  var self=this
  if(self.extra == '')
    $('.value',self.ui).addClass('textual')
  else
    $('.value',self.ui).removeClass('textual')
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
    disallow_spaces: true,
    rows: 1,
    commands: [ {
        img: './images/delete.png',
        title: 'delete',
        close: function() { tag_delete(self,p_mess('tag deleted')) }
      }, {
        img: './images/cancel.png',
        title: 'cancel',
        accel: ctrl_esc,
        close: function() {}
      }, {
        img: './images/ok.png',
        title: 'accept',
        accel:  enter,
        close: function(ts) { tag_update(self,ts.text,p_mess('tag updated')) }
      }
    ]
  })
}

Tag.prototype.update = function(new_value) {
  var self=this
  self.value=new_value
  $('.value',self.ui).html(self.value_or_extra())
  self.check_textual()
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
