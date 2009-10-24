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

function go_to(tag) {
  location.href=tag
}

function cs(p,v) { $.cookie(p,v,{expires: 1000}) }
function css(p,v) { $.cookie(p,v,{expires: null }) }
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
    replace(/^(.{90}).*/,'$1')
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

  var lines=new_selection.split(/\n/)

  var many_elements=true
  for(var i=0;i<lines.length;i++) {
    if(lines[i].substr(0,item_prefix.length) != item_prefix) {
      //log('many elements false on '+lines[i])
      many_elements=false
      break
    }
  }

  if(!many_elements) {
    // we search prev for more lines in this paragraph
    var lines=prev.split(/\n/)
    var lastline=lines.pop()
    if(lastline != '') lines.push(lastline)
    while(lines.length!=0) {
      lastline=lines.pop()
      if(lastline == '') {
        lines.push(lastline)
        break
      } else {
        new_selection=lastline+"\n"+new_selection
      }
    }
    prev=lines.join("\n")

    // we search next for more lines in this paragraph
    var lines=next.split(/\n/)
    var firstline=lines.shift()
    if(firstline != '') lines.push(firstline)
    while(lines.length!=0) {
      firstline=lines.shift()
      if(firstline == '') {
        lines.slice(0,0,lastline)
        break
      } else {
        new_selection=new_selection+"\n"+firstline
      }
    }
    next=lines.join("\n")
    var total=(prev != '' && next != '') ? prev+"\n"+next : prev+next
    return [total].concat([new_selection])
  }
  else {
    var data=[prev+next]
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

function p_mess(mess) {
  var m=mess
  return function() {
    $.message(m)
  }
}

function add_item_helper() {
  $.editor({
    title: 'New item',
    rows: 20,
    text: '',
    commands: [ {
        img: '/images/cancel.png',
        title: 'cancel',
        accel: esc,
        close: function() {}
      }, {
        img: '/images/add.png',
        title: 'add',
        accel:  ctrl_enter,
        close: function(x) {
          item_new(x,[_d.main_tag],p_mess('new item'))
        }
      }
    ]
  })
}

function add_tag_helper() {
  $.editor({
    title: 'New tag',
    text: '',
    rows: 1,
    commands: [ {
        img: '/images/cancel.png',
        title: 'cancel',
        accel: esc
      }, {
        img: '/images/add.png',
        title: 'add',
        accel:  enter,
        close: function(x) { tag_new(x,p_mess('new tag')) }
      }
    ]
  })
}

function show_help() {
  $.modal('<div style="font-size: 20px;font-weight: bold;">Keyboard shortcuts</div>'+
'<table style="border-spacing: 3px; text-align: left;"><tr>'+
'<td>gi</td><td>go to in</td>'+
'<td>tn</td><td>new tag</td>'+
'<td colspan="2"><div style="font-size: 18px;font-weight: bold;">inside editor</div></td>'+
'</tr><tr>'+
'<td>gn</td><td>go to next</td>'+
'<td>te</td><td>edit tag</td>'+
'<td>ctrl+enter</td><td>save</td>'+
'</tr><tr>'+
'<td>gw</td><td>go to waiting</td>'+
'<td>ft</td><td>filter</td>'+
'<td>escape</td><td>cancel</td>'+
'</tr><tr>'+
'<td>gs</td><td>go to someday</td>'+
'<td>fr</td><td>remove filter</td>'+
'<td>ctrl+del</td><td>delete</td>'+
'</tr><tr>'+
'<td>gt</td><td>go to tag (select one)</td>'+
'<td>fc</td><td>clear all filters</td>'+
'<td>ctrl+.</td><td>split</td>'+
'</tr><tr>'+
'<td>j</td><td>go down one item</td>'+
'<td>fo</td><td>set filtering method to or</td>'+
'<td>ctrl+y</td><td>split and send to next</td>'+
'</tr><tr>'+
'<td>k</td><td>go up one item</td>'+
'<td>fa</td><td>set filtering method to and</td>'+
'<td>m@</td><td>insert map coordinates</td>'+
'</tr><tr>'+
'<td>J</td><td>move item down</td>'+
'<td>c</td><td>open your calendar</td>'+
'<td>d@</td><td>insert date</td>'+
'</tr><tr>'+
'<td>K</td><td>move item up</td>'+
'<td>uu</td><td>undo</td>'+
'</tr><tr>'+
'<td>9</td><td>collapse all items</td>'+
'<td>ur</td><td>redo</td>'+
'</tr><tr>'+
'<td>0</td><td>expand all items</td>'+
'<td>ctrl+.</td><td>split selection</td>'+
'</tr><tr>'+
'<td>n</td><td>new item</td>'+
'<td>y</td><td>(yank) move item (or selection) to next</td>'+
'</tr><tr>'+
'<td>e</td><td>edit this item</td>'+
'<td>w</td><td>move item to waiting (only if in inbox)</td>'+
'</tr><tr>'+
'<td>o</td><td>open this item</td>'+
'<td>s</td><td>move item to someday</td>'+
'</tr><tr>'+
'<td>a</td><td>add a tag to this item</td>'+
'<td>@s</td><td>move item to someday with date</td>'+
'</tr><tr>'+
'<td>r</td><td>remove a tag from this item</td>'+
'</tr></table>'
)
}
