function editor(element,name,ctrlenter,esc) {
  var on=function(e) {
    e.bind('keyup', 'ctrl+return', function(){
      //log('ctrlenter at '+name)
      ctrlenter && ctrlenter() 
    })
    e.bind('keyup', 'esc', function(){
      //log('escape at '+name)
      esc && esc() 
    })
  }

  var off=function(e) {
    e.unbind('keyup', 'ctrl+return')
    e.unbind('keyup', 'esc')
  }
  
  element.focus(function(){ 
    //log('focus '+name) 
    on(element)
  })

  element.blur(function(){ 
    //log('blur '+name) 
    off(element)
  })
  return element
}
