(function($) {
  var empty_input='type here ...'
  var selector_div=null
  var input_div=null
  var values_div=null
  var filtered=[]
  var content=''
  var fire=true

  $.selector = function(title,values,selected) {
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

    var destroy = function() {
      if(selector_div) {
        $(document).unbind('keypress', keys)
        selector_div.remove()
        selector_div=null
      }
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

    destroy()
    init()

    selector_div=$('<div>').css({
      'position': 'fixed',
      'display': 'none',
      'border': 'none',
      'padding': '15px',
      'background-color': '#000',
      '-moz-border-radius': '10px',
      'color': '#fff',
      'text-align': 'center',
      'width': '40%',
      'top': '20%'
    }).appendTo($('body'))
    $('<div>').css({
      'position': 'relative',
      'font-size': '18px',
      'text-align': 'right',
      'font-weight': 'bold',
      'top': '-10px'
    }).html(title).appendTo(selector_div)
    input_div=$('<div>').css({
      'font-size': '34px',
      'font-weight': 'bold',
      'font-style': 'italic',
      'padding-bottom': '10px'
    }).appendTo(selector_div)
    $('<hr>').appendTo(selector_div)
    values_div=$('<div>').css({
      'font-size': '18px',
      'font-weight': 'bold',
      'padding-top': '20px'
    }).appendTo(selector_div)

    change()

    $.modal(selector_div,function() {
      destroy()
      fire && selected && selected()
    })

    $(document).bind('keypress', keys)
  }
})(jQuery)
