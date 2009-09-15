// function E(value,id) {
//   this.value=value
//   this.id=id
//   this.sub=new G
// }
//
// E.prototype.to_s = function(level) {
//   if(level==null) level=2
//   var s=''
//   if(level>0)
//     s=this.value+' ['+this.id+']'
//   if(level>1)
//     s+=' ' + this.sub.to_s(level-1)
//   return s
// }
//
// E.prototype.log = function(x,level) {
//   if(level==null) level=2
//   log(( x ? x : "")+" "+this.to_s(level))
// }

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

////////////////////////////////////////////////////////////////////////////////

function Tag(value,id) {
  var self=this

  self.value=value
  self.id=id
  self.items=[]

  self.ui=$('<div>').attr('id','tag-'+self.id).addClass('tag')
  self.ui.append(delete_button().click(function() { self.destroy() }))
  self.ui.append($('<span>').addClass('value').html(self.value))
  self.ui.hide()
  self.ui.appendTo('#tags')
  self.ui.dblclick(function(e) {
    clear_selection()
    //log('double click:'+self.id)
    self.edit_start()
  })

  self.uie=$('<div>').attr('id','edit-tag-'+self.id).addClass('edittag')
  self.uie.append($('<textarea>'))
  self.uie.append(accept_button().click(function() { self.edit_accept() }))
  self.uie.append(cancel_button().click(function() { self.edit_cancel() }))
  self.uie.hide()
  self.uie.appendTo('#tags')
}

Tag.prototype.destroy = function() {
  //log('destroy.tag:'+this.id)
  var self=this
  ajax_tag_destroy(self.id,function(a) {
    //log('destroyed.tag:'+self.id+' ')
    $.each(self.items,function(i,x) {
      x.remove_tag(self.value)
    })
    _d.remove_tag(self.value)
    self.ui.empty()
    self.uie.empty()
  })
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
  $('textarea',this.uie).val(this.value)
  this.ui.hide()
  this.uie.show()
}

Tag.prototype.edit_accept = function() {
  var self=this
  //log('edit_accept.tag:'+self.id)
  var nv=$('textarea',self.uie).val()
  //log('edit_accept.tag into:'+nv)
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
  var prev=self.value
  self.value=new_value
  $('.value',self.ui).html(self.value)
  $.each(self.items,function(i,x) {
    x.update_tag(prev,new_value)
  })
}

////////////////////////////////////////////////////////////////////////////////

function Data() {
  this.tags=[]
  this.main_tag=null
}

Data.prototype.add_tag = function(t) {
  this.tags.push(t)
}

Data.prototype.remove_tag = function(value) {
  var pos=this.find_tag(value)
  if(pos!=-1)
    this.tags.splice(pos,1)
  else
    assert_failed('remove_tag "unknown tag" '+value)
}

Data.prototype.set_main_tag = function(value) {
  var tid=this.find_tag(value)
  if(tid!=-1)
    this.main_tag=this.tags[tid]
}

Data.prototype.find_tag = function(value) {
  for(var i=0;i<this.tags.length;i++) {
    if(this.tags[i].value==value)
      return i
  }
  return -1
}

Data.prototype.log = function() {
  console.dir(this)
}
