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
  var url = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([-\w/_\.]*(\?\S+)?)?)?|www\.([-\w\.]+)+(:\d+)?(\/([-\w/_\.]*(\?\S+)?)?)?)/g
  return s.
    replace(url,'<a href="$&">$&</a>').
    replace(/href="www/,'href="http://www').
    replace(/\{\d+\.\d+,\d+\.\d+\}/,'<span class="map-popup">$&</span>').
    replace(/\n\s-\s(.*)/g,"\n<li>$1</li>").
    replace(/\n/g,'<br/>').
    replace(/<\/li><br\/>/g,'</li>')
}

// text && selection helpers

function translate_position(text,pos,divider) {
  var sep=new RegExp(divider)
  var lines=text.split(sep)
  var sepl=divider.length
  var sum=0
  for(var i=1;i<lines.length;i++) {
    sum+=lines[i-1].length + sepl
    if(pos < sum) return i-1
  }
  return i-1
}

function lines_interval(lines,ls,le) {
  var ext=[]
  if(ls==-1) ls=0
  if(le==-2) le=lines.length-1
  for(var i=ls;i<=le;i++)
    ext.push(lines[i])
  return ext
}

function selection_lines(text,start,end,divider) {
  var ls=translate_position(text,start,divider)
  var le=translate_position(text,end,divider)
  return lines_interval(text.split(divider),ls,le)
}

function prev_lines(text,start,divider) {
  var ls=translate_position(text,start,divider)
  return lines_interval(text.split(divider),0,ls-1)
}

function next_lines(text,end,divider) {
  var le=translate_position(text,end,divider)
  return lines_interval(text.split(divider),le+1,-2)
}

function divide(text,s,e,item_prefix) {
  var lines=selection_lines(text,s,e,"\n")

  var many_elements=true
  for(var i=0;i<lines.length;i++) {
    if(lines[i].substr(0,item_prefix.length) != item_prefix) {
      many_elements=false
      break
    }
  }

  if(many_elements) {
    var n=prev_lines(text,s,"\n").concat(next_lines(text,e,"\n"))
    var data=[n.join("\n")]
    for(var i=0;i<lines.length;i++)
      data.push(lines[i].substr(item_prefix.length))
    return data
  }
  else {
    var lines=selection_lines(text,s,e,"\n\n")
    var n=prev_lines(text,s,"\n\n").concat(next_lines(text,e,"\n\n"))
    var data=[n.join("\n\n")]
    for(var i=0;i<lines.length;i++)
      data.push(lines[i])
    return data
  }
}

function justify(text,max_line_length) {
  var lines=[]
  var w=text.split(/\s+/)
  var current_line=w[0]
  for(var i=1;i<w.length;i++) {
    if(current_line.length + 1 + w[i].length > max_line_length) {
      lines.push(current_line)
      current_line=w[i]
    } else {
      current_line+=" "+w[i]
    }
  }
  lines.push(current_line)
  return lines.join("\n").replace(/ +$/,'')
}

function clean_text(x,s,e) {
  var i,changed,start=s,end=e
  for(changed=true;changed;) {
    for(changed=false;;changed=true) {
      i=x.indexOf(" \n",i)
      if(i==-1) break
      x=x.slice(0,i)+x.slice(i+1)
      if(i<=start) start--
      if(i<=end) end--
    }
  }
  while(x[x.length-1]=='\n') {
    x=x.slice(0,x.length-1)
  }
  if(end>x.length) end=x.length
  return [x,start,end]
}

// text && selection helpers end

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
      },
      make_into_a_list_command(),
      justify_paragraph_command(),
      unindent_lines_command(),
      indent_lines_command(),
      {
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
    disallow_spaces: true,
    rows: 1,
    commands: [ {
        img: '/images/cancel.png',
        title: 'cancel',
        accel: esc,
        close: function() {}
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
'<td>ctrl+l</td><td>make a list of selection</td>'+
'</tr><tr>'+
'<td>J</td><td>move item down</td>'+
'<td>c</td><td>open your calendar</td>'+
'<td>ctrl+j</td><td>justify selection</td>'+
'</tr><tr>'+
'<td>K</td><td>move item up</td>'+
'<td>uu</td><td>undo</td>'+
'<td>d@</td><td>insert date</td>'+
'</tr><tr>'+
'<td>9</td><td>collapse all items</td>'+
'<td>ur</td><td>redo</td>'+
'<td>m@</td><td>insert map coordinates</td>'+
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
'<td>alt+r</td><td>start/stop reviewing</td>'+
'</tr></table>'
)
}

function tag_compare(x,y) {
  var type = x.extra ? "e" : "v"
  type += y.extra ? "e" : "v"
  switch(type) {
    case "ee": return x.id.to_i() - y.id.to_i()
    case "ev": return -1
    case "ve": return 1
    case "vv": return x.value < y.value ? -1 : 1
  }
  return type
}

function make_into_a_list_command() {
  return {
    accel: ctrl_l,
    func: function(x,s,e) {
      if(s == e) return null
      var pl=prev_lines(x,s,"\n").join('\n')
      if(pl != '') pl=pl+'\n'
      var nl=next_lines(x,e,"\n").join('\n')
      var sl=selection_lines(x,s,e,"\n").
        map(function(x) { return x!='' ? " - "+x : x }).join('\n')+'\n'
      return pl+sl+nl
    }
  }
}

function justify_paragraph_command() {
  return {
    accel: ctrl_j,
    func: function(x,s,e) {
      if(s == e) e=s+1
      var pl=prev_lines(x,s,"\n\n").join('\n\n')
      if(pl != '') pl=pl+'\n\n'
      var nl=next_lines(x,e,"\n\n").join('\n\n')
      var sl=selection_lines(x,s,e,"\n\n").
        map(function(x) { return justify(x,72) }).join('\n\n')+'\n\n'
      return pl+sl+nl
    }
  }
}

function unindent_lines_command() {
  return {
    accel: ctrl_9,
    func: function(x,s,e) {
      if(s == e) e=s+1
      var pl=prev_lines(x,s,"\n").join('\n')
      if(pl != '') pl=pl+'\n'
      var nl=next_lines(x,e,"\n").join('\n')
      var sl=selection_lines(x,s,e,"\n").
        map(function(x) { return x.replace(/^  /,'') }).join('\n')+'\n'
      return pl+sl+nl
    }
  }
}

function indent_lines_command() {
  return {
    accel: ctrl_0,
    func: function(x,s,e) {
      if(s == e) e=s+1
      var pl=prev_lines(x,s,"\n").join('\n')
      if(pl != '') pl=pl+'\n'
      var nl=next_lines(x,e,"\n").join('\n')
      var sl=selection_lines(x,s,e,"\n").
        map(function(x) { return "  "+x }).join('\n')+'\n'
      return pl+sl+nl
    }
  }
}
