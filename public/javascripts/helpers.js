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

function ajax_tag_create(x,cont) {
  $.ajax({
    type: "POST",
    url: "/tags",
    data: { 'tag[value]': x },
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
}

function ajax_tag_destroy(id,cont) {
  $.ajax({
    type: "DELETE",
    url: "/tags/"+id,
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
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

function ajax_item_create(x,main_tag,cont) {
  var post_data={'item[value]': x}
  if(main_tag) {
    post_data['tag[]']=main_tag.id
  }

  $.ajax({
    type: "POST",
    url: "/items",
    data: post_data,
    success: function(a) { if(a=parse(a)) cont(a) },
    error: terrible_error
  })
}

function ajax_item_destroy(id,cont) {
  $.ajax({
    type: "DELETE",
    url: "/items/"+id,
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

function distance(x,y) {
  return Math.sqrt(Math.pow((x.left-y.left),2)+
    Math.pow((x.top-y.top),2))
}
