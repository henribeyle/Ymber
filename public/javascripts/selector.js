(function($) {
  var filtered=[]
  var content=''

  $.selector = function(title,values,selected) {

    var change = function() {
      var colored = function(color,text) {
        return '<span style="color: '+color+';">'+text+'</span>'
      }
      filtered=$.map(values,function(x,i) {
        if(content == '') return x
        var nx=x.replace(content,colored('#80F73C',content))
        if(nx!=x) return nx
        return null
      })
      $('#selector-ui-input').html(content=='' ? 'type here ...' : content)
      if(filtered.length > 0)
        $('#selector-ui-values').html(filtered.join(' '))
      else
        $('#selector-ui-values').html(colored('#F7803C','no matches'))
    }

    function close(val) {
      if($('#selector-ui').length == 0) {
        $.error('no selector found')
        return
      }

      restore_input_handler()
      $('#selector-ui-overlay,#selector-ui-wrapper').remove()

      selected && selected(val)
    }

    function disallow_all_others(e) {
      return $(e.target).
        parents('#selector-ui-overlay,#selector-ui-wrapper').
        length > 0
    }

    var keys = function(e) {
      if(e.ctrlKey || e.altKey || e.metaKey || e.which == 0) return

      if(e.which == 27)
        close()
      if(e.type == 'keyup')
        return

      if(e.which == 8 ) {
        if(content!='') {
          content=content.substr(0,content.length-1)
          change()
        }
        return
      }
      if(e.which == 13) {
        if(filtered.length == 1 ) {
          close(filtered[0].replace(/<\/?[^>]+>/gi, ''))
        } else {
          var pos=$.inArray(content, values)
          if(pos!=-1)
            close(values[pos])
        }
        return
      }

      content=content+String.fromCharCode(e.which)
      change()
    }

    if($('#selector-ui').length != 0) {
      $.error('cant have more than one selector')
      return
    }

    content=''

    var selector_div=$('<div>').
      attr('id','selector-ui').
      append($('<div>').attr('id','selector-ui-title').html(title)).
      append($('<div>').attr('id','selector-ui-input')).
      append($('<hr>')).
      append($('<div>').attr('id','selector-ui-values')).
      show()

    $('<div>').
      attr('id','selector-ui-wrapper').
      append(selector_div).
      appendTo('body')

    $('<div>').
      attr('id','selector-ui-overlay').
      attr('title','Click to close').
      click(close).
      appendTo('body')

    selector_div.css('left',($(window).width()-selector_div.width())/2)

    change()

    save_input_handler(
      function() { $(document).bind('keyup keypress',keys) },
      function() { $(document).unbind('keyup keypress',keys) }
    )
  }
})(jQuery)
