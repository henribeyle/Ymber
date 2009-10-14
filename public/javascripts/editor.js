(function($) {
  var defaults={
    rows: 20,
    text: '',
    title: 'none',
    close: null,
    buttons: []
  }

  $.editor = function(o) {
    var opts = $.extend(defaults, o || {})

    var last_selection=''

    var input_handler = function(e) {
      //log('[editor]? '+e.which+' type '+e.type)
      if(!my_event(e)) return
      //log('[editor] '+e.which+' type '+e.type)

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

      opts.buttons.each(function(x) {
        if(typeof x.accel == 'function' && x.accel(e))
          close(x.click)
      })
    }

    function close(func) {
      if($('#editor-ui').length == 0) {
        $.error('editor is not opened')
        return
      }

      restore_input_handler()

      var ta=$('#editor-ui textarea')
      var text=ta.val()
      var sel=ta[0].value.substring(ta[0].selectionStart,ta[0].selectionEnd)

      $('#editor-ui-overlay,#editor-ui-wrapper').remove()

      if(typeof func == 'function')
        func(text,sel)
      if(typeof opts.close == 'function')
        opts.close(text,sel)
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

    opts.buttons.each(function(x) {
      button_row.append($('<img>').
          attr('src',x.img).
          attr('title',x.title).
          addClass('button').
          click(function() {
            close(x.click)
          }))
    })

    $('<div>').
      attr('id','editor-ui-wrapper').
      append(editor_div).
      appendTo('body')

    editor_div.show().css('left',($(window).width()-editor_div.width())/2)

    save_input_handler(
      function() { $(document).bind('keyup mouseup',input_handler) },
      function() { $(document).unbind('keyup mouseup',input_handler) }
    )

    $('#editor-ui textarea').focus()
  }
})(jQuery)
