(function($) {
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

    var last_selection=''
    var command_working=false
    var last_start=null
    var last_end=null

    var keydown_handler = function(e) {
      if(opts.disallow_spaces && e.which==32)
        return false

      if(e.which==9) {
        if(!command_working) {
          var ta=$('#editor-ui textarea')[0]
          var start=ta.selectionStart
          var end=ta.selectionEnd
          ta.value=ta.value.substr(0,start)+'  '+ta.value.substr(end)
          ta.selectionStart=start+2
          ta.selectionEnd=start+2
        }
        return false;
      }
      return true
    }

    var add_to_history = function(v) {
      //log("'"+v+"' has been added to history")
    }

    var process_command = function(v) {
      //log("'"+v+"' is going to be processed")
      add_to_history(v)
    }

    var command_input_handler = function(e) {
      if(e.which==27) {
        command_working=false
        $('#editor-ui-command').hide()
        var ta=$('#editor-ui textarea')
        ta[0].selectionStart=last_start
        ta[0].selectionEnd=last_end
        ta.focus()
      }
      if(e.which==13) {
        command_working=false
        var c=$('#editor-ui-command')
        var comm=c.val()
        c.hide()
        var ta=$('#editor-ui textarea')
        ta[0].selectionStart=last_start
        ta[0].selectionEnd=last_end
        ta.focus()
        process_command(comm)
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

      var ta=$('#editor-ui textarea')[0]
      var start=ta.selectionStart
      var end=ta.selectionEnd
      var sel=ta.value.substring(start,end)
      var prev=ta.value.substr(0,start)
      var next=ta.value.substr(end)
      if(sel!='' && sel!=last_selection) {
        if($.is_date(sel)) {
          $.select_date(sel,function(x) {
            $(ta).val(prev+x+next).focus()
            ta.setSelectionRange(end, end)
          })
        }
        if($.is_map(sel)) {
          $.map_show(sel,function(t,g) {
            if(!t) return
            $(ta).val(prev+'{'+t+','+g+'}'+next).focus()
            ta.setSelectionRange(end, end)
          })
        }
        last_selection=sel
        return false
      }

      if(e.which==50 && start>=2 ) {
        if(ta.value.charAt(start-2)=='d') {
          $.select_date(null,function(x) {
            ta.value = ta.value.replace('d@', x)
            $(ta).focus()
          })
        }
        if(ta.value.charAt(start-2)=='m') {
          $.map_show(null,function(lat,lng) {
            if(!lat) return
            ta.value = ta.value.replace('m@', '{'+lat+','+lng+'}');
            $(ta).focus()
          })
        }
        return false
      }

      if(e.which==27 && !e.ctrlKey) {
        command_working=true
        $('#editor-ui-command').show().focus()
        var ta=$('#editor-ui textarea')[0]
        last_start=ta.selectionStart
        last_end=ta.selectionEnd
        return false
      }

      opts.commands.each(function(x) {
        if(is_fun(x.accel) && x.accel(e)) {
          if(is_fun(x.close)) close(x.close)
          if(is_fun(x.func)) process(x.func,x.need_input)
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

      var ta=$('#editor-ui textarea')
      var text=ta.val()
      var s=ta[0].selectionStart
      var e=ta[0].selectionEnd
      var v=clean_text(text,s,e)
      text=v[0]
      s=v[1]
      e=v[2]

      $('#editor-ui-overlay,#editor-ui-wrapper').remove()

      if(is_fun(func))
        func(text,s,e)
      if(is_fun(opts.close))
        opts.close(text,s,e)
    }

    function process(func,need_input) {
      var ta=$('#editor-ui textarea')
      var text=ta.val()
      var s=ta[0].selectionStart
      var e=ta[0].selectionEnd
      var v=clean_text(text,s,e)
      text=v[0],s=v[1],e=v[2]

      var sc=ta.scrollTop()
      var a=func(text,s,e)
      if(a!=null) {
        ta.val(a[0])
        if(a.length>2) {
          ta[0].selectionStart=a[1]
          ta[0].selectionEnd=a[2]
        }
        ta.scrollTop(sc)
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

    var ta=$('<textarea spellcheck="false">').
        attr('rows',opts.rows).
        val(opts.text)

    var editor_div=$('<div>').
      attr('id','editor-ui').
      append($('<div>').attr('id','editor-ui-title').html(opts.title)).
      append(ta)

    var button_row=$('<div>').addClass('button-row').appendTo(editor_div)

    opts.commands.each(function(x) {
      if(x.img) {
        button_row.append($('<img>').
            attr('src',x.img).
            attr('title',x.title).
            addClass('button').
            click(function() {
              if(is_fun(x.close)) close(x.close)
              if(is_fun(x.func)) process(x.func,x.need_input)
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

    var wheight=$(window).height()
    var eheight=editor_div.height()

    if(eheight>wheight) {
      ta.height(wheight-100)
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

    ta.focus()
    ta[0].selectionStart=0
    ta[0].selectionEnd=0
  }
})(jQuery)
