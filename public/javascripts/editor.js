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

    var at_func = function(e) {
      //if(!my_event(e)) return

      var ta=$('#editor-ui textarea')[0]
      if(ta.value.indexOf('d@')!=-1) {
//         $.select_date(null,function(x) {
//           ta.value = ta.value.replace('d@', x);
//           $(ta).focus()
//         })
      }
      if(ta.value.indexOf('m@')!=-1) {
//         $.map_show(function(lat,lng) {
//           if(!lat) return
//           ta.value = ta.value.replace('m@', '{'+lat+','+lng+'}');
//           $(ta).focus()
//         })
      }
    }

    var selection=function(e) {
      //if(!my_event(e)) return
      var ta=$('#editor-ui textarea')[0]
      var start=ta.selectionStart
      var end=ta.selectionEnd
      var sel=ta.value.substring(start,end)
      var prev=ta.value.substr(0,start);
      var next=ta.value.substr(end);
      if(sel!='') log('start-end: '+start+'-'+end+" sel:'"+sel+"'")
      if(/\d{2}\/\d{2}\/\d{4}/.test(sel)) {
        log('date')
//         $.select_date(sel,function(x) {
//           $(ta).val(prev+x+next).focus()
//           ta.setSelectionRange(end, end)
//         })
      }
      var mp=/\{(\d+\.\d+),(\d+\.\d+)\}/
      if(mp.test(sel)) {
        log('map')
//         var m=mp.exec(sel)
//         $.map_show(function(t,g) {
//           if(!t) return
//           $(ta).val(prev+'{'+t+','+g+'}'+next).focus()
//           ta.setSelectionRange(end, end)
//         },m[1],m[2])
      }
    }

    function close(func) {
      if($('#editor-ui').length == 0) {
        $.error('editor is not opened')
        return
      }

//       $(document).
//         unbind('mouseup',selection).
//         unbind('keyup',selection).
//         unbind('keyup', '@', at_func).
//         unbind('mousedown mouseup keydown keypress keyup', disallow_all_others)

//       $(document).
//         unbind('mousedown').unbind('mouseup').
//         unbind('keyup').unbind('keydown').unbind('keypress')
//       $(document).
//         unbind('mousedown mouseup keydown keypress keyup', disallow_all_others).
//         unbind('keyup', '@', at_func).
//         unbind('keyup',selection).
//         unbind('mouseup',selection)
//       $.each(opts.buttons,function(i,x) {
//         if(x.accel)
//           $(document).unbind('keyup', x.accel)
//       })
      //restore_input_events()

      var text=$('#editor-ui textarea').val()
      $('#editor-ui-overlay,#editor-ui-wrapper').remove()

      if(typeof func == 'function')
        func(text)
      if(typeof opts.close == 'function')
        opts.close(text)
    }

    function disallow_all_others(e) {
      return $(e.target).
        parents('#editor-ui-overlay,#editor-ui-wrapper').
        length > 0
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

    $.each(opts.buttons,function(i,x) {
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

    //save_input_events()
    $(editor_div).
      //bind('mousedown mouseup keydown keypress keyup', disallow_all_others).
      bind('keyup', '@', at_func).
      bind('keyup',selection).
      bind('mouseup',selection)
    $.each(opts.buttons,function(i,x) {
      if(x.accel) {
        $(editor_div).bind('keyup', x.accel, function(e) {
          //if(!my_event(e)) return
          close(x.click)
          return false
        })
      }
    })

    $('#editor-ui textarea').focus()
  }
})(jQuery)
