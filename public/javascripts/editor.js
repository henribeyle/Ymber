function editor(element,name,ctrlenter,esc,ctrldel) {
  var on=function(e) {
    e.bind('keyup', 'ctrl+return', function(){
      //log('ctrlenter at '+name)
      ctrlenter && ctrlenter() 
    })
    e.bind('keyup', 'esc', function(){
      //log('escape at '+name)
      esc && esc() 
    })
    e.bind('keyup', 'ctrl+del', function(){
      //log('ctrldel at '+name)
      ctrldel && ctrldel() 
    })
  }

  var off=function(e) {
    e.unbind('keyup', 'ctrl+return')
    e.unbind('keyup', 'esc')
    e.unbind('keyup', 'ctrl+del')
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
