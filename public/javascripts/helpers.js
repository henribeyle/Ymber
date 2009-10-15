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
    is_fun(nF) && nF()
  }
}

function suc(nT,nF,cont) {
  return function(a) {
    if(a=parse(a)) {
      cont(a)
      is_fun(nT) && nT()
    } else {
      is_fun(nF) && nF()
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

function clear_selection() {
  if(document.selection && document.selection.empty) {
    document.selection.empty()
  } else if(window.getSelection) {
    var sel=window.getSelection()
    if(sel && sel.removeAllRanges)
      sel.removeAllRanges()
  }
}

function get_id(x) { return x.id }
function get_value(x) { return x.value }

function this_id(id) { return function(x) { return x.id == id } }
function this_value(value) { return function(x) { return x.value == value } }

function related_to_item(item) { return function(tag) { return item.has(tag) } }
function related_to_tag(tag) { return function(item) { return tag.has(item) } }

function not_main_tag(x) { return x != _d.main_tag }
function not_a_filter(tag) { return !_d.has_filter(tag) }
function not_has_tag(item) { return function(tag) { return !item.has(tag) } }

function first_line(s) {
  var fl=s.replace(/\n(.|\n)*/,'').
    replace(/^(.{120}).*/,'$1')
  return fl != s ? fl+'<span class="more-stuff">...</span>' : s
}

function formatted(s) {
  var url = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?|www\.([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/g
  return s.
    replace(url,'<a href="$&">$&</a>').
    replace(/href="www/,'href="http://www').
    replace(/\{\d+\.\d+,\d+\.\d+\}/,'<span class="map-popup">$&</span>').
    replace(/\n\s-\s(.*)/g,"\n<li>$1</li>").
    replace(/\n/g,'<br/>').
    replace(/<\/li><br\/>/g,'</li>')
}

function divide(value,selection,item_prefix) {
  var start=value.indexOf(selection)
  if(start==-1)
    return null

  // we have to put start just after \n
  while(value.charAt(start) == '\n') start++
  while(start>0 && value.charAt(start-1) != '\n')
    start--
  // now start points at \n-1 or start of value

  var end=start+selection.length
  // we have to put end just on top of \n
  while(end<value.length && value.charAt(end)!='\n') end++
  while(value.charAt(end-1)=='\n') end--
  // now end points at \n or end of value

  // we grab the augmented selection
  var new_selection=value.substring(start,end)
  //log("interval is ("+start+", "+end+") "+value.length)
  //log("selection is '"+s+"'")
  //log("value is '"+value+"'")
  //log("selection is all? "+(s==value))
  if(new_selection==value)
    return null

  var prev=value.substring(0,start)
  var next=value.substring(end,value.length)
  // log("division correct ? "+(prev+s+next==value))

  var new_value=prev+next
  var lines=new_selection.split(/\n/)

  var many_elements=true
  for(var i=0;i<lines.length;i++) {
    if(lines[i].substr(0,item_prefix.length) != item_prefix) {
      //log('many elements false on '+lines[i])
      many_elements=false
      break
    }
  }

  if(!many_elements)
    return [new_value].concat([new_selection])
  else {
    var data=[new_value]
    for(var i=0;i<lines.length;i++)
      data.push(lines[i].substr(item_prefix.length))
    return data
  }
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

var cancel_which=null
var cancel_type=null

function my_event(e) {
  var h=e.originalEvent["handled"]
  e.originalEvent["handled"]=true
  if(cancel_this(e))
    return false
  return h!==true
}

function cancel_this(e) {
  var c=cancel_which==e.which && cancel_type==e.type
  cancel_which=null
  cancel_type=null
  return c
}

function cancel_next(which,type) {
  cancel_which=which
  cancel_type=type
}

function p_mess(mess) {
  var m=mess
  return function() {
    $.message(m)
  }
}
