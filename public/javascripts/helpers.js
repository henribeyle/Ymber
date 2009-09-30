function log(x)  {
  var l=$('#log').show()
  if(l.size()!=0) {
    l.html(x+"<br/>"+l.html())
  }
}

function terrible_error(request,error) {
  request.abort()
  //log('terrible error happened: '+error)
  $.error('Error contacting server: '+error)
}

function te(nF) {
  return function(r,e) {
    terrible_error(r,e)
    nF && nF()
  }
}

function suc(nT,nF,cont) {
  return function(a) {
    if(a=parse(a)) {
      cont(a)
      nT && nT()
    } else {
      nF && nF()
    }
  }
}

function normal_error(error) {
  //log('normal error happened: '+error)
  $.warning('Warning: '+error)
}

function assert_failed(what) {
  //log('assert_failed: '+what)
  $.warning('Assert failed: '+what)
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

function span(className,html) {
  var s=$('<span>')
  if(className)
    s.addClass(className)
  if(html)
    s.html(html)
  return s
}

function show_mark() {
  return $('<img>').
    attr('src','/images/Play.png').
    addClass('show')
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

function cs(p,v) { $.cookie(p,v,{expires: 1000}) }
function cr(p) { return $.cookie(p) }
function cd(p) { $.cookie(p,null) }

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
  return function(tag) { return item.has(tag) }
}

function related_to_tag(tag) {
  return function(item) { return tag.has(item) }
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

function first_line(s) {
  return s.replace(/\n(.|\n)*/,'')
}

function formatted(s) {
  var url = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?|www\.([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/g
  return s.
    replace(url,'<a href="$&">$&</a>').
    replace(/href="www/,'href="http://www').
    replace(/\{\d+\.\d+,\d+\.\d+\}/,'<span class="map-popup">$&</span>').
    replace(/\n\s\s+- (.*)/g,"\n<li>$1</li>").
    replace(/\n/g,'<br/>').
    replace(/<\/li><br\/>/g,'</li>')
}

function today() {
  var t=new Date()
  var d=t.getDate()
  var m=t.getMonth()+1
  var y=t.getFullYear()
  return (d < 10 ? "0" + d : d ) + '/' +
    (m < 10 ? "0" + m : m ) + '/' +
    y
}

var all_events=[]

function save_input_handler(on,off) {
  if(all_events.length > 0)
    all_events[all_events.length-1].offH()
  on()
  all_events.push({ onH: on, offH: off })
}

function restore_input_handler() {
  all_events.pop().offH()
  all_events[all_events.length-1].onH()
}



// function save_input_events() {
//   log('A.all_events.length='+all_events.length)
//   all_events.push($(document).data("events"))
//   log('B.all_events.length='+all_events.length)
//   $(document).data("events",{})
// }
//
// function restore_input_events() {
//   log('C.all_events.length='+all_events.length)
//   $(document).data("events",all_events.pop())
//   log('D.all_events.length='+all_events.length)
// }

function my_event(e) {
  var h=e.originalEvent["handled"]
  e.originalEvent["handled"]=true
  return h!==true
}
