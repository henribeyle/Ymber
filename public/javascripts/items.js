function Item(value,id,data) {
  var self=this

  self.value=value
  self.id=id
  self.tags=[]

  self.ui=$('<div>').attr('id','item-'+self.id).addClass('item')
  self.ui.append($('<span>').addClass('value').html(self.value))
  self.ui.hide()
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
      var tid=$(ui.draggable).oid()
      //log('dropped '+tid+' into '+self.id)
      var pos=_d.find_tag_by_id(tid)
      if(pos==-1) {
        assert_failed('unknown tag id: '+xt.id)
        return
      }
      if(self.find_tag(_d.tags[pos].value)==-1)
        ajax_item_add_tag(self.id,tid,function(a) {
          self.add_tag(_d.tags[pos])
        })
    }
  })

  self.uie=$('<div>').attr('id','edit-item-'+self.id).addClass('edititem')
  self.uie.append(editor($('<textarea>').attr('name','edit-item-'+self.id),
    'tag-id-'+self.id,
    function() { self.edit_accept() },
    function() { self.edit_cancel() },
    function() { self.destroy() }))
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.append(delete_button().click(function() { self.destroy() }))
  self.uie.hide()
  self.uie.appendTo('#items')
}

Item.prototype.destroy = function() {
  var self=this
  //log('destroy.item:'+self.id)
  ajax_item_destroy(self.id,function(a) {
    //log('destroyed.item:'+self.id)
    $.each(self.tags,function(i,x) {
      x.remove_item(self.value)
    })
    _d.remove_item(self.value)
    self.ui.remove()
    self.uie.remove()
  })
}

Item.prototype.show = function() {
  //log('show.item:'+this.id)
  this.ui.show()
}

Item.prototype.hide = function() {
  //log('hide.item:'+this.id)
  this.ui.hide()
}

Item.prototype.edit_start = function() {
  //log('edit_start.item:'+this.id)
  this.ui.hide()
  this.uie.show()
  $('textarea',this.uie).val(this.value).focus()
}

Item.prototype.edit_accept = function() {
  var self=this
  var nv=$('textarea',self.uie).val()
  //log('edit_accept.item:'+self.id+' into '+nv)
  ajax_item_update(self.id,nv,self.tags,function(a) {
    self.update(a.item.value)
    var previous_tags=$.map(self.tags,function(x,i) { return x.value })
    $.each(previous_tags,function(i,x) { self.remove_tag(x) })
    $.each(a.item.tags,function(it,xt) {
      var pos=_d.find_tag_by_id(xt.id)
      if(pos==-1) {
        assert_failed('unknown tag id: '+xt.id)
        return
      }
      self.add_tag(_d.tags[pos])
    })
    self.edit_cancel()
  })
}

Item.prototype.edit_cancel = function() {
  //log('edit_cancel.item:'+this.id)
  this.uie.hide()
  this.ui.show()
}

Item.prototype.update = function(new_value) {
  var self=this
  var prev=self.value
  self.value=new_value
  $('.value',self.ui).html(self.value)
}

Item.prototype.add_tag = function(tag) {
  var self=this
  //log('add_tag.item:'+self.id+' '+tag.value)
  if(self.find_tag(tag.value)!=-1)
    assert_failed("adding existing tag twice "+tag.value)
  if(tag.find_item(self.value)!=-1)
    assert_failed("adding existing item twice "+self.value)
  self.tags.push(tag)
  tag.items.push(self)

  var t1=$('<span>').addClass('stag').addClass('tag-id-'+tag.id)
  var t2=$('<span>').addClass('content').html(tag.value)

  var max_dist=60
  t1.draggable({ 
    opacity: 0.5,
    helper: function(event) {
      return t1.clone().attr('id','draghelper')
    },
    cursor: 'move',
    drag: function(e,ui) {
      var d=distance($(this).offset(),ui.position)
      if(d>max_dist) {
        $('#draghelper').addClass('tobedeleted')    
      } else {
        $('#draghelper').removeClass('tobedeleted')    
      }
    },
    stop: function(e, ui) {
      var d=distance($(this).offset(),ui.position)
      if(d>max_dist) {
        ajax_item_remove_tag(self.id,tag.id,function(a) {
          self.remove_tag(tag.value)
          if(tag.value == _d.main_tag.value) {
            _d.remove_item(self.value)
            self.ui.remove()
            self.uie.remove()
          }
        })
      }
    },
    revert: true
  })
  t1.append(t2)
  self.ui.append(t1)
}

Item.prototype.remove_tag = function(value) {
  //log('remove_tag.item:'+this.id+' '+value)
  var self=this
  var pos=this.find_tag(value)
  var tag_id=this.tags[pos].id
  if(pos!=-1) {
    this.tags[pos].remove_item(this.value)
    this.tags.splice(pos,1)
  } else
    assert_failed('item.remove_tag "unknown tag" '+value)
  $('.tag-id-'+tag_id,this.ui).remove()
}

Item.prototype.update_tag = function(tag) {
  //log('update_tag.item:'+this.id+' '+tag.value)
  $('.tag-id-'+tag.id+' .content',self.ui).html(tag.value)
}

Item.prototype.find_tag = function(value) {
  for(var i=0;i<this.tags.length;i++) {
    if(this.tags[i].value==value)
      return i
  }
  return -1
}
