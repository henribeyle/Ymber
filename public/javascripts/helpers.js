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

function get_id(name) {
  return name.replace(/^(item|tag)-/,'')
}

function add_button() {
  return $('<img>').
    attr('src','/images/Add.png').
    addClass('add')
}

function delete_button() {
  return $('<img>').
    attr('src','/images/Minus_Red_Button.png').
    addClass('delete')
}

function accept_button() {
  return $('<img>').
    attr('src','/images/Clear_Green_Button.png').
    addClass('accept')
}

function cancel_button() {
  return $('<img>').
    attr('src','/images/Stop_Red_Button.png').
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

function clear_selection() {
  if(document.selection && document.selection.empty) {
    document.selection.empty()
  } else if(window.getSelection) {
    var sel=window.getSelection()
    if(sel && sel.removeAllRanges)
      sel.removeAllRanges()
  }
}
