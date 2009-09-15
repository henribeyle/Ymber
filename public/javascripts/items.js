function Item(value,id,data) {
  var self=this

  self.value=value
  self.id=id
  self.tags=[]

  self.ui=$('<div>').attr('id','item-'+self.id).addClass('item')
  self.ui.append(delete_button().click(function() { self.destroy() }))
  self.ui.append($('<span>').addClass('value').html(self.value))
//   $.each(e.sub.g,function(i,x) {
//     var t1=$('<span>').addClass('tag').addClass('tag-id-'+x.id)
//     var t2=$('<span>').addClass('content').html(x.value)
//     t1.append(t2)
//     d.append(t1)
//   })
  self.ui.hide()
  self.ui.appendTo('#items')
  self.ui.dblclick(function(e) {
    clear_selection()
    //log('double click:'+self.id)
    self.edit_start()
  })

  self.uie=$('<div>').attr('id','edit-item-'+self.id).addClass('edititem')
  self.uie.append($('<textarea>'))
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
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
    self.ui.empty()
    self.uie.empty()
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
  log('edit_start.item:'+this.id)
  $('textarea',this.uie).val(this.value)
  this.ui.hide()
  this.uie.show()
}

Item.prototype.edit_accept = function() {
  var self=this
  var nv=$('textarea',self.uie).val()
  log('edit_accept.item:'+self.id+' into '+nv)
  ajax_item_update(self.id,nv,self.tags,function(a) {
    self.update(a.item.value)
    //need to update tags
    self.edit_cancel()
  })
}

Item.prototype.edit_cancel = function() {
  log('edit_cancel.item:'+this.id)
  this.uie.hide()
  this.ui.show()
}

Item.prototype.update = function(new_value) {
  var self=this
  var prev=self.value
  self.value=new_value
  $('.value',self.ui).html(self.value)
}

// E.prototype.add = function(s) {
//   if(this.sub.find(s.value)!=-1)
//     assert_failed("adding subelement twice")
//   if(s.sub.find(this.value)!=-1)
//     assert_failed("adding subelement twice (in sub)")
//   this.sub.add(s)
//   s.sub.add(this)
// }

// E.prototype.remove = function(s) {
//   var pi=this.sub.find(s.value)
//   if(pi==-1) {
//     assert_failed("trying to remove but it is not here")
//   }
//   else {
//     this.sub.remove(pi)
//   }
//   var pj=s.sub.find(this.value)
//   if(pj==-1) {
//     assert_failed("trying to remove but it is not here (in sub)")
//   } else {
//     s.sub.remove(pj)
//   }
// }

// E.prototype.clear = function() {
//   var self=this
//   $.each(this.sub.g,function(i,x) {
//     var pj=x.sub.find(self.value)
//     if(pj==-1) {
//       assert_failed("trying to remove me from others (but not there)")
//     } else {
//       x.sub.remove(pj)
//     }
//   })
// }
