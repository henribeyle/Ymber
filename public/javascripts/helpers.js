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
    disallow_spaces: false,
    commands: [ {
        img: '/images/cancel.png',
        title: 'cancel',
        accel: ctrl_esc,
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
        accel: ctrl_esc,
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


var primera=[
  ['gi','go to in'],
  ['gn','go to next'],
  ['gw','go to waiting'],
  ['gs','go to someday'],
  ['gt','go to tag (select one)'],
  ['j','go down one item'],
  ['k','go up one item'],
  ['Home','go to start of list'],
  ['End','go to end of list'],
  ['J','move item down'],
  ['K','move item up'],
  ['shift+Home','move item to start'],
  ['shift+End','move item to end'],
  ['9','collapse all items'],
  ['0','expand all items'],
  ['R','refresh data'],
  ['c','open your calendar'],
  ['h','show this help'],
  ['uu','undo'],
  ['ur','redo'],
  ['alt+r','start/stop reviewing']]

var segunda=[
  ['n','new item'],
  ['e','edit this item'],
  ['o','open this item'],
  ['dd','delete this item'],
  ['a','add a tag'],
  ['r','remove a tag'],
  ['tn','new tag'],
  ['te','edit tag'],
  ['ft','filter (select tag)'],
  ['fr','remove filter'],
  ['fc','clear all filters'],
  ['fo','set filtering method to or'],
  ['fa','set filtering method to and'],
  ['ctrl+.','split selection'],
  ['i','move item to inbox'],
  ['y','(yank) move item (or selection) to next'],
  ['w','move item to waiting'],
  ['s','move item to someday'],
  ['@s','move item to someday with date']]

var tercera=[
  null,
  ['ctrl+enter','save'],
  ['ctrl+escape','cancel'],
  ['ctrl+del','delete'],
  ['ctrl+.','split'],
  ['ctrl+y','split and send to next'],
  ['ctrl+l','list/unlist selection lines'],
  ['ctrl+j','justify selection'],
  ['ctrl+9','unindent lines'],
  ['ctrl+0','indent lines'],
  ['escape','process expression'],
  ['d@','insert date'],
  ['m@','insert map coordinates']]

function show_help() {
  var text='<div style="font-size: 20px;font-weight: bold;">Keyboard shortcuts</div>'
  text+='<table style="border-spacing: 3px; text-align: left;"><tr>'

  text+='<td>'+primera[0][0]+'</td><td>'+primera[0][1]+'</td>'
  text+='<td>'+segunda[0][0]+'</td><td>'+segunda[0][1]+'</td>'
  text+='<td colspan="2">'
  text+='<div style="font-size: 18px;font-weight: bold;">'
  text+='inside editor</div></td></tr>'

  var cont=true
  for(var i=1;i<primera.length || i<segunda.length || i<tercera.length;i++) {
    function print_if(arr) {
      if(i<arr.length)
        text+='<td>'+arr[i][0]+'</td><td>'+arr[i][1]+'</td>'
    }
    text+='<tr>'
    print_if(primera)
    print_if(segunda)
    print_if(tercera)
    text+='</tr>'
  }
  text+='</table>'
  $.modal(text)
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

function all_selection_lines(x,s,e,f) {
  var same=false
  var back=false
  if(s == e) {
    same=true
    if(x.charAt(s)=='\n') {
      back=true
      s--
    } else
      e++
  }
  var pl=prev_lines(x,s,"\n").join('\n')
  if(pl != '') pl=pl+'\n'
  var nl=next_lines(x,e,"\n").join('\n')
  var sl=selection_lines(x,s,e,"\n")
  var v=f(sl)
  if(back) s++
  s=s+v[1]
  e=e+v[2]
  if(same) e=s
  return [pl+v[0].join('\n')+'\n'+nl,s,e]
}

function make_into_a_list_command() {
  return {
    accel: ctrl_l,
    func: function(x,s,e) {
      return all_selection_lines(x,s,e,function(sl) {
        var op=1
        if(sl.all(function(x) { return x.substring(0,3)==' - ' })) {
          sl=sl.map(function(x) { return x.replace(/^ - /,'') })
          op=-1
        } else
          sl=sl.map(function(x) { return x!='' ? " - "+x : x })
        return [sl,3*op,3*op*sl.length]
      })
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
      var np=(pl+sl).length
      return [pl+sl+nl,np,np] // go to start of next paragraph
    }
  }
}

function unindent_lines_command() {
  return {
    accel: ctrl_9,
    func: function(x,s,e) {
      return all_selection_lines(x,s,e,function(sl) {
        return [sl.map(function(x) { return x.replace(/^  ?/,'') }),
          -2,-2*sl.length]
      })
    }
  }
}

function indent_lines_command() {
  return {
    accel: ctrl_0,
    func: function(x,s,e) {
      return all_selection_lines(x,s,e,function(sl) {
        return [sl.map(function(x) { return "  "+x }),
          2,2*sl.length]
      })
    }
  }
}
