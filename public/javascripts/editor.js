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

TextArea.prototype.start =function(x) {
  var self=this
  if(x == undefined)
    return self.ta.selectionStart
  else
    self.ta.selectionStart=x
}

TextArea.prototype.end =function(x) {
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

TextArea.prototype.focus = function() {
  var self=this
  self.taj.focus()
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
  self.focus()
}

TextArea.prototype.goto_start = function(x) {
  var self=this
  var s=self.r_start
  if(x != undefined)
    s+=x
  self.start(s)
  self.end(s)
  self.focus()
}

TextArea.prototype.goto_end = function(x) {
  var self=this
  var e=self.r_end
  if(x != undefined)
    e+=x
  self.start(e)
  self.end(e)
  self.focus()
}

;(function($) {
  var defaults={
    rows: 20,
    text: '',
    title: 'none',
    close: null,
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
          if(x.regex && m && is_fun(x.rfunc)) process_func(x.rfunc,m)
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
          if(is_fun(x.func)) process_func(x.func)
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

      ta.clean_text()
      var text=ta.value()
      var s=ta.start()
      var e=ta.end()

      $('#editor-ui-overlay,#editor-ui-wrapper').remove()

      history.save()

      if(is_fun(func))
        func(text,s,e)
      if(is_fun(opts.close))
        opts.close(text,s,e)
    }

    function process_func(func,extra) {
      ta.clean_text()
      var sc=ta.scroll()
      var a=func(ta.value(),ta.start(),ta.end(),extra)
      if(a!=null) {
        ta.value(a[0])
        if(a.length>2) {
          ta.start(a[1])
          ta.end(a[2])
        }
        ta.scroll(sc)
      }
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
              if(is_fun(x.func)) process_func(x.func,x.need_input)
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
