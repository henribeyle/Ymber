(function($) {
  var filtered=[]
  var values=[]
  var selected=null
  var content=''
  var fire=true

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

  function modal_hide() {
    if($('#selector-ui').length == 0) {
      $.error('modal hide on no elements')
      return
    }

    $(document).unbind('mousedown mouseup keydown keypress', modal_handler)
    $(document).unbind('keypress', keys)
    $('#selector-ui-overlay,#selector-ui-wrapper').remove()

    fire && selected && selected()
  }

  function modal_handler(e) {
    return $(e.target).
      parents('#selector-ui-overlay,#selector-ui-wrapper').
      length > 0
  }

  var keys = function(e) {
    if(e.ctrlKey || e.altKey || e.metaKey)
      return true

    if(e.which == 0) return false
    if(e.which == 8 ) {
      if(content!='')
        content=content.substr(0,content.length-1)
      change()
      return false
    }
    if(e.which == 13) {
      if(filtered.length == 1 ) {
        fire=false
        modal_hide()
        selected && selected(filtered[0].replace(/<\/?[^>]+>/gi, ''))
      } else {
        var pos=$.inArray(content, values)
        if(pos!=-1) {
          fire=false
          modal_hide()
          selected && selected(values[pos])
        }
      }
      return false
    }

    content=content+String.fromCharCode(e.which)
    change()

    return false
  }

  $.selector = function(title,values2,selected2) {
    if($('#selector-ui').length != 0) {
      $.error('cant have more than one selector')
      return
    }

    values=values2
    selected=selected2

    filtered=[]
    content=''
    fire=true

    $('<div>').attr('id','selector-ui-overlay').
      attr('title','Click to close').click(modal_hide).appendTo('body')

    var selector_div=$('<div>').attr('id','selector-ui')
    $('<div>').attr('id','selector-ui-title').html(title).appendTo(selector_div)
    $('<div>').attr('id','selector-ui-input').appendTo(selector_div)
    $('<hr>').appendTo(selector_div)
    $('<div>').attr('id','selector-ui-values').appendTo(selector_div)


    $('<div>').attr('id','selector-ui-wrapper').append(selector_div).appendTo('body')

    selector_div.show().css('left',($(window).width()-selector_div.width())/2)

    change()

    $(document).bind('mousedown mouseup keydown keypress', modal_handler).
      bind('keyup', 'esc', modal_hide )

    $(document).bind('keypress', keys)
  }
})(jQuery)
