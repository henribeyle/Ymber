(function($) {
  var empty_input='type here ...'
  var selector_div=null
  var input_div=null
  var values_div=null
  var filtered=[]
  var values=[]
  var selected=null
  var content=''
  var fire=true

  var destroy = function() {
    if(selector_div) {
      $(document).unbind('keypress', keys)
      selector_div.remove()
      selector_div=null
    }
  }

  var colored = function(color,text) {
    return '<span style="color: '+color+';">'+text+'</span>'
  }

  var change = function() {
    filtered=$.map(values,function(x,i) {
      if(content == '') return x
      var nx=x.replace(content,colored('#80F73C',content))
      if(nx!=x) return nx
      return null
    })
    input_div.html(content=='' ? empty_input : content)
    if(filtered.length > 0)
      values_div.html(filtered.join(' '))
    else
      values_div.html(colored('#F7803C','no matches'))
  }

  var add_key = function(c) {
    content=content+c
    change()
  }

  var backspace = function() {
    if(content!='')
      content=content.substr(0,content.length-1)
    change()
  }

  function onclose() {
    destroy()
    fire && selected && selected()
  }

  $.modal_hide = function() {
    if(!selector_div) return
    selector_div.appendTo('body').hide()
    $(document).unbind('mousedown mouseup keydown keypress', modal_handler)
    $('#selector-ui-overlay,#selector-ui-wrapper').remove()
    onclose()
    selector_div=null
  }

  function modal_handler(e) {
    return $(e.target).
      parents('#selector-ui-overlay,#selector-ui-wrapper').
      length > 0
  }

  var init = function() {
    selector_div=null
    input_div=null
    values_div=null
    filtered=[]
    content=''
    fire=true
  }

  var keys = function(e) {
    if(e.ctrlKey || e.altKey || e.metaKey)
      return true

    if(e.which == 0) return false
    if(e.which == 8 ) {
      backspace()
      return false
    }
    if(e.which == 13) {
      if(filtered.length == 1 ) {
        destroy()
        fire=false
        $.modal_hide()
        selected && selected(filtered[0].replace(/<\/?[^>]+>/gi, ''))
      } else {
        var pos=$.inArray(content, values)
        if(pos!=-1) {
          destroy()
          fire=false
          $.modal_hide()
          selected && selected(values[pos])
        }
      }
      return false
    }

    var c=String.fromCharCode(e.which)
    //console.log("value :'"+c+"' = "+e.which)
    add_key(c)
    return false
  }

  $.selector = function(title,values2,selected2) {
    values=values2
    selected=selected2
    destroy()
    init()
    $.modal_hide()

    selector_div=$('<div>').attr('id','selector-ui').appendTo($('body'))
    $('<div>').attr('id','selector-ui-title').html(title).appendTo(selector_div)
    input_div=$('<div>').attr('id','selector-ui-input').appendTo(selector_div)
    $('<hr>').appendTo(selector_div)
    values_div=$('<div>').attr('id','selector-ui-values').appendTo(selector_div)

    change()

    $('<div>').attr('id','selector-ui-overlay').
      attr('title','Click to close').click($.modal_hide).appendTo('body')

    $('<div>').attr('id','selector-ui-wrapper').append(selector_div.
        css('left',($(window).width()-selector_div.width())/2).
        show()).
      appendTo('body')

    $(document).bind('mousedown mouseup keydown keypress', modal_handler).
      bind('keyup', 'esc', $.modal_hide )

    $(document).bind('keypress', keys)
  }
})(jQuery)
