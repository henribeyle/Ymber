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
    replace(/\{\d+\.\d+,\d+\.\d+\}/g,'<span class="map-popup">$&</span>').
    replace(/\n\s-\s(.*)/g,"\n<li>$1</li>").
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
      search_and_replace_expression_command(),
      grep_expression_command(),
      grep_v_expression_command(),
      {
        img: '/images/add.png',
        title: 'add',
        accel:  ctrl_enter,
        close: function(ts) {
          item_new(ts.text,[_d.main_tag],p_mess('new item'))
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
        close: function(ts) { tag_new(ts.text,p_mess('new tag')) }
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

function divide(ts,item_prefix) {
  function have_prefix(x) {
    return x.length<item_prefix.length ||
      x.substring(0,item_prefix.length)==item_prefix
  }
  var many_elements=true
  ts.each_line(function(x) {
    if(!have_prefix(x))
      many_elements=false
    return x
  })

  if(many_elements) {
    var data=[]
    data.push(ts.prev_l_text()+ts.next_l_text())
    ts.each_line(function(x) {
      data.push(x.substr(item_prefix.length))
      return x
    })
    return data
  }
  else {
    var data=[]
    data.push(ts.prev_p_text()+ts.next_p_text())
    ts.each_paragraph(function(x) {
      data.push(x)
      return x
    })
    return data
  }
}
