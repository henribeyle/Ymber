function History(m) {
  var self=this
  self.elems=[]
  self.pos=-1
  self.max=m
}

History.prototype.up = function() {
  var self=this
  if(self.pos > 0)
    self.pos--
}

History.prototype.down = function() {
  var self=this
  if(self.pos < self.elems.length)
    self.pos++
}

History.prototype.it = function() {
  var self=this
  if(self.pos >=0 && self.pos < self.elems.length)
    return self.elems[self.pos]
  return ''
}

History.prototype.push = function(x) {
  var self=this
  if(self.elems.contains(x))
    self.elems.erase(x)
  self.elems.push(x)
  self.pos=self.elems.length
}

History.prototype.save = function() {
  var self=this
  if(self.elems.length>self.max)
    self.elems.splice(0,self.elems.length-self.max)
  $.cookie('editor_history',self.elems.join('\n'),{expires: 1000})
}

History.prototype.load = function() {
  var self=this
  var o=$.cookie('editor_history')
  if(o) {
    self.elems=o.split('\n')
    self.pos=self.elems.length
  }
}

function TextArea(id) {
  var self=this
  self.taj=$(id)
  self.ta=self.taj[0]
  self.r_start=0
  self.r_end=0
}

TextArea.prototype.scroll = function(x) {
  var self=this
  if(x == undefined)
    return self.taj.scrollTop()
  else
    self.taj.scrollTop(x)
}

TextArea.prototype.start = function(x) {
  var self=this
  if(x == undefined)
    return self.ta.selectionStart
  else
    self.ta.selectionStart=x
}

TextArea.prototype.end = function(x) {
  var self=this
  if(x == undefined)
    return self.ta.selectionEnd
  else
    self.ta.selectionEnd=x
}

TextArea.prototype.prev = function() {
  var self=this
  return self.ta.value.substr(0,self.start())
}

TextArea.prototype.selection = function() {
  var self=this
  return self.ta.value.substring(self.start(),self.end())
}

TextArea.prototype.next = function() {
  var self=this
  return self.ta.value.substr(self.end())
}

TextArea.prototype.value = function(x) {
  var self=this
  if(x == undefined)
    return self.ta.value
  else
    self.ta.value=x
}

TextArea.prototype.just_written = function(x) {
  var self=this
  var start=self.start()
  if(start < x.length) return false
  var t=self.value().substring(start-x.length,start)
  return t == x
}

TextArea.prototype.clean_text = function() {
  var self=this
  var text=self.value()
  var start=self.start()
  var end=self.end()
  var i,changed
  for(changed=true;changed;) {
    for(changed=false;;changed=true) {
      i=text.indexOf(" \n",i)
      if(i==-1) break
      text=text.slice(0,i)+text.slice(i+1)
      if(i<=start) start--
      if(i<=end) end--
    }
  }
  while(text[text.length-1]=='\n') {
    text=text.slice(0,text.length-1)
  }
  if(end>text.length) end=text.length

  self.value(text)
  self.start(start)
  self.end(end)
}

TextArea.prototype.replace = function(x,y) {
  var self=this
  self.ta.value = self.ta.value.replace(x,y)
}

TextArea.prototype.readjust_height = function(h) {
  var self=this
  self.taj.height(h)
}

TextArea.prototype.remember_position = function() {
  var self=this
  self.r_start=self.start()
  self.r_end=self.end()
}

TextArea.prototype.restore_position = function() {
  var self=this
  self.start(self.r_start)
  self.end(self.r_end)
  self.taj.focus()
}

TextArea.prototype.goto_start = function(x) {
  var self=this
  var s=self.r_start
  if(x != undefined)
    s+=x
  self.start(s)
  self.end(s)
  self.taj.focus()
}

TextArea.prototype.goto_end = function(x) {
  var self=this
  var e=self.r_end
  if(x != undefined)
    e+=x
  self.start(e)
  self.end(e)
  self.taj.focus()
}

TextArea.prototype.apply = function(x) {
  var self=this
  if(x) {
    self.value(x.text)
    self.start(x.start)
    self.end(x.end)
    self.scroll(x.scroll)
  }
}

function TextSegment(ta) {
  var self=this
  ta.clean_text()
  self.text=ta.value()
  self.start=ta.start()
  self.end=ta.end()
  self.scroll=ta.scroll()

  function poss(divider) {
    var sep=new RegExp(divider)
    var items=self.text.split(sep)
    var sepl=divider.length
    var sum=0
    var nstart=-1
    var nend=-1
    for(var i=1;i<items.length;i++) {
      sum+=items[i-1].length + sepl
      if(nstart==-1 && self.start < sum)
        nstart=i-1
      if(nend==-1 && nstart!=-1 && self.end <= sum)
        nend=i-1
    }
    if(nstart==-1) nstart=i-1
    if(nend==-1) nend=i-1
    var prev=[]
    var sel=[]
    var next=[]
    for(var i=0;i<nstart;i++)
      prev.push(items[i])
    for(var i=nstart;i<=nend;i++)
      sel.push(items[i])
    for(var i=nend+1;i<items.length;i++)
      next.push(items[i])
    return [prev,sel,next]
  }

  var l=poss("\n")
  self.prev_l=l[0]
  self.sel_l=l[1]
  self.next_l=l[2]

  var p=poss("\n\n")
  self.prev_p=p[0]
  self.sel_p=p[1]
  self.next_p=p[2]
}

TextSegment.prototype.each_line = function(f) {
  var self=this
  self.sel_l=self.sel_l.map(f)
}

TextSegment.prototype.each_paragraph = function(f) {
  var self=this
  self.sel_p=self.sel_p.map(f)
}

TextSegment.prototype.prev_l_text = function() {
  var self=this
  var p=self.prev_l.join('\n')
  if(p!='') p+='\n'
  return p
}

TextSegment.prototype.sel_l_text = function() {
  var self=this
  return self.sel_l.join('\n')+'\n'
}

TextSegment.prototype.next_l_text = function() {
  var self=this
  return self.next_l.join('\n')
}

TextSegment.prototype.prev_p_text = function() {
  var self=this
  var p=self.prev_p.join('\n\n')
  if(p!='') p+='\n\n'
  return p
}

TextSegment.prototype.sel_p_text = function() {
  var self=this
  return self.sel_p.join('\n\n')+'\n\n'
}

TextSegment.prototype.next_p_text = function() {
  var self=this
  return self.next_p.join('\n\n')
}


TextSegment.prototype.reset_from_lines = function() {
  var self=this
  var p=self.prev_l_text()
  var s=self.sel_l_text()
  var n=self.next_l_text()
  self.text=p+s+n
  self.start=p.length
  self.end=(p+s).length-1
}

TextSegment.prototype.reset_from_paragraphs = function() {
  var self=this
  var p=self.prev_p_text()
  var s=self.sel_p_text()
  var n=self.next_p_text()
  self.text=p+s+n
  self.start=p.length
  self.end=(p+s).length-2
}

TextSegment.prototype.goto = function(x) {
  var self=this
  self.start=x
  self.end=x
}

;(function($) {
  var defaults={
    rows: 20,
    text: '',
    title: 'none',
    disallow_spaces: false,
    commands: []
  }

  $.editor = function(o) {
    var opts = $.extend(defaults, o || {})

    var command_working=false
    var last_selection=''
    var history=new History(50)

    var keydown_handler = function(e) {
      //log('[editor-keydown]? '+e.which+' type '+e.type)
      if(!my_event(e)) return
      //log('[editor-keydown] '+e.which+' type '+e.type)

      if(opts.disallow_spaces && e.which==32)
        return false

      if(e.which==9) {
        if(!command_working) {
          ta.remember_position()
          ta.value(ta.prev()+'  '+ta.next())
          ta.goto_start(2)
        }
        return false;
      }

      if(e.which == 38 && command_working) {
        history.up()
        $('#editor-ui-command').val(history.it())
      }

      if(e.which == 40 && command_working) {
        history.down()
        $('#editor-ui-command').val(history.it())
      }

      return true
    }

    var command_input_handler = function(e) {
      if(e.which==27) {
        command_working=false
        $('#editor-ui-command').hide()
        ta.restore_position()
      }
      if(e.which==13) {
        command_working=false
        var c=$('#editor-ui-command')
        var comm=c.val()
        c.hide()
        ta.restore_position()
        history.push(comm)
        opts.commands.each(function(x) {
          var m=comm.match(x.regex)
          if(x.regex && m && is_fun(x.func))
            ta.apply(x.func(new TextSegment(ta),m))
        })
      }
      return false
    }

    var input_handler = function(e) {
      //log('[editor]? '+e.which+' type '+e.type)
      if(!my_event(e)) return
      //log('[editor] '+e.which+' type '+e.type)

      if(command_working) {
        command_input_handler(e)
        return false
      }

      var sel=ta.selection()
      ta.remember_position()
      if(sel!='' && sel!=last_selection) {
        if($.is_date(sel)) {
          $.select_date(sel,function(x) {
            ta.value(ta.prev()+x+ta.next())
            ta.goto_end()
          })
        }
        if($.is_map(sel)) {
          $.map_show(sel,function(lat,lng) {
            if(!lat) return
            ta.value(ta.prev()+'{'+lat+','+lng+'}'+ta.next())
            ta.goto_end()
          })
        }
        last_selection=sel
        return false
      }

      if(e.which==50 && ta.just_written('d@')) {
        $.select_date(null,function(x) {
          ta.replace('d@', x)
          ta.goto_start(x.length-2)
        })
        return false
      }
      if(e.which==50 && ta.just_written('m@')) {
        $.map_show(null,function(lat,lng) {
          if(!lat) return
          var r='{'+lat+','+lng+'}'
          ta.replace('m@', r);
          ta.goto_start(r.length-2)
        })
        return false
      }

      if(e.which==27 && !e.ctrlKey) {
        command_working=true
        $('#editor-ui-command').show().focus().select()
        ta.remember_position()
        return false
      }

      opts.commands.each(function(x) {
        if(is_fun(x.accel) && x.accel(e)) {
          if(is_fun(x.close)) close(x.close)
          if(is_fun(x.func)) ta.apply(x.func(new TextSegment(ta)))
        }
      })
    }

    function close(func) {
      if($('#editor-ui').length == 0) {
        $.error('editor is not opened')
        return
      }

      $.map_hide()
      restore_input_handler()

      var ts=new TextSegment(ta)

      $('#editor-ui-overlay,#editor-ui-wrapper').remove()

      history.save()

      if(is_fun(func))
        func(ts)
    }

    if($('#editor-ui').length != 0) {
      $.error('cant have more than one editor')
      return
    }

    $('<div>').
      attr('id','editor-ui-overlay').
      attr('title','Click to close').
      click(close).
      appendTo('body')

    var editor_div=$('<div>').
      attr('id','editor-ui').
      append($('<div>').attr('id','editor-ui-title').html(opts.title)).
      append($('<textarea spellcheck="false">').
        attr('rows',opts.rows).
        val(opts.text))

    var button_row=$('<div>').addClass('button-row').appendTo(editor_div)

    opts.commands.each(function(x) {
      if(x.img) {
        button_row.append($('<img>').
            attr('src',x.img).
            attr('title',x.title).
            addClass('button').
            click(function() {
              if(is_fun(x.close)) close(x.close)
              if(is_fun(x.func)) ta.apply(x.func(new TextSegment(ta)))
            }))
      }
    })
    button_row.append($('<input type="text">').attr('id','editor-ui-command'))

    $('<div>').
      attr('id','editor-ui-wrapper').
      append(editor_div).
      appendTo('body')

    var wwidth=$(window).width()
    editor_div.show().width(wwidth*0.8)
    editor_div.css('left',(wwidth-editor_div.width())/2)
    var ta=new TextArea('#editor-ui textarea')

    var wheight=$(window).height()
    var eheight=editor_div.height()

    if(eheight>wheight) {
      ta.readjust_height(wheight-100)
      editor_div.css('top',0).height(wheight)
    }else {
      editor_div.css('top',(wheight-editor_div.height())/2)
    }

    save_input_handler(
      function() {
        $(document).bind('keyup mouseup',input_handler)
        $(document).bind('keydown',keydown_handler)
      },
      function() {
        $(document).unbind('keyup mouseup',input_handler)
        $(document).unbind('keydown',keydown_handler)
      }
    )

    history.load()

    ta.restore_position()
  }
})(jQuery)

function justify_paragraph_command() {
  return {
    accel: ctrl_j,
    func: function(ts) {
      ts.each_paragraph(function(x) { return justify(x,72) })
      ts.reset_from_paragraphs()
      ts.goto((ts.prev_p_text()+ts.sel_p_text()).length)
      return ts
    }
  }
}

function unindent_lines_command() {
  return {
    accel: ctrl_9,
    func: function(ts) {
      ts.each_line(function(x) { return x.replace(/^  ?/,'') })
      ts.reset_from_lines()
      return ts
    }
  }
}

function make_into_a_list_command() {
  return {
    accel: ctrl_l,
    func: function(ts) {
      function have_prefix(x) { return x.length<3 || x.substring(0,3)==' - ' }
      function add_prefix(x) { return x!='' ? " - "+x : x }
      function rm_prefix(x) { return x.replace(/^ - /,'') }
      var all_have=true
      ts.each_line(function(x) {
        if(!have_prefix(x))
          all_have=false
        return x
      })
      ts.each_line(all_have ? rm_prefix : add_prefix )
      ts.reset_from_lines()
      return ts
    }
  }
}

function indent_lines_command() {
  return {
    accel: ctrl_0,
    func: function(ts) {
      ts.each_line(function(x) { return "  "+x })
      ts.reset_from_lines()
      return ts
    }
  }
}

function search_and_replace_expression_command() {
  return {
    regex: /^\s*s\/(.*)\/(.*)\/([gi])?\s*$/,
    func: function(ts,matches) {
      var regex=new RegExp(matches[1],matches[3])
      ts.each_line(function(x) { return x.replace(regex,matches[2]) })
      ts.reset_from_lines()
      return ts
    }
  }
}

function grep_expression_command() {
  return {
    regex: /^\s*\/(.*)\/!D\s*$/,
    func: function(ts,matches) {
      ts.each_line(function(x) { return x.match(matches[1]) ? x : null })
      ts.reset_from_lines()
      return ts
    }
  }
}

function grep_v_expression_command() {
  return {
    regex: /^\s*\/(.*)\/D\s*$/,
    func: function(ts,matches) {
      ts.each_line(function(x) { return !x.match(matches[1]) ? x : null })
      ts.reset_from_lines()
      return ts
    }
  }
}
