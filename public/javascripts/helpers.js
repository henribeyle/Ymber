function log(x)  {
  var l=$('#log').show()
  if(l.size()!=0) {
    l.html(l.html()+"<br/>"+x)
  }
}

function terrible_error(request,error) {
  request.abort()
  log('terrible error happened: '+error)
}

function normal_error(error) {
  log('normal error happened: '+error)
}

function assert_failed(what) {
  log('assert_failed: '+what)
}

function catch_all(m,f,l) {
  //log('exception '+m+' '+f+' '+l)
  assert_failed(m.replace(/uncaught exception: /,''))
  return true
}

function get_response(a) {
  var r=null
  eval("r="+a)
  return r
}

function is_error(r) {
  return r.status == 'error'
}

function parse(a) {
  var b=get_response(a)
  if(is_error(b)) {
    normal_error(b.error)
    return false
  }
  else
    return b
}

function add_button() {
  return $('<img>').
    attr('src','/images/Add.png').
    attr('title','add').
    addClass('add')
}

function delete_button() {
  return $('<img>').
    attr('src','/images/Minus_Red_Button.png').
    attr('title','delete').
    addClass('delete')
}

function accept_button() {
  return $('<img>').
    attr('src','/images/Clear_Green_Button.png').
    attr('title','add').
    addClass('accept')
}

function cancel_button() {
  return $('<img>').
    attr('src','/images/Stop_Red_Button.png').
    attr('title','cancel').
    addClass('cancel')
}

function go_button() {
  return $('<img>').
    attr('src','/images/Transfer.png').
    attr('title','go').
    addClass('go')
}

function go_to(tag) {
  location.href=tag
}

function ajax_tag_update(id,x,cont) {
  $.ajax({
    type: "PUT",
    url: "/tags/"+id,
    data: { 'tag[value]' : x },
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
}

function ajax_item_update(id,value,tags,cont) {
  var p=$.param({'item[value]': value})
  p+=$.map(tags,function(x) {
    return '&'+'tag[]='+x.id
  }).join('')

  $.ajax({
    type: "PUT",
    url: "/items/"+id,
    data: p,
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
}

function ajax_item_add_tag(ii,ti,cont) {
  $.ajax({
    type: "PUT",
    url: "/items/"+ii+'/tag',
    data: 'tag[]='+ti,
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
}

function ajax_item_remove_tag(ii,ti,cont) {
  $.ajax({
    type: "DELETE",
    url: "/items/"+ii+'/tag',
    data: 'tag[]='+ti,
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
}

function ajax_item_split(id,els,cont) {
  var p=$.map(els,function(x) { 
    return encodeURIComponent('value[]='+x) }
  ).join('&')
  $.ajax({
    type: "POST",
    url: "/items/"+id+'/split',
    data: p,
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
}

function clear_selection() {
  if(document.selection && document.selection.empty) {
    document.selection.empty()
  } else if(window.getSelection) {
    var sel=window.getSelection()
    if(sel && sel.removeAllRanges)
      sel.removeAllRanges()
  }
}

function this_id(id) {
  return function(x) { return x.id == id } 
}

function this_value(value) {
  return function(x) { return x.value == value } 
}

function related_to_item(item) {
  return function(tag) { return item.find_tag(tag.value)!=-1 }
}

function related_to_tag(tag) {
  return function(item) { return tag.find_item(item.value)!=-1 } 
}

jQuery.extend({
  pos: function(elems,callback) {
    for(var i=0;i<elems.length;i++) {
      if(callback(elems[i]))
        return i
    }
    return -1
  },
  exists: function(elems,callback) {
    return this.pos(elems,callback)!=-1
  },
  index: function(elems,callback) {
    var p=this.pos(elems,callback)
    if(p==-1)
      throw "unfound object"
    return p
  },
  and: function(elems,callback) {
    for(var i=0;i<elems.length;i++)
      if(!callback(elems[i]))
        return false
    return true
  },
  or: function(elems,callback) {
    for(var i=0;i<elems.length;i++)
      if(callback(elems[i]))
        return true
    return false
  }
});
