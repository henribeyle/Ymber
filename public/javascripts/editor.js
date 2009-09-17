(function($) { 
  var defaults = {
    name: 'none',
    ctrlenter: null,
    esc: null,
    ctrldel: null
  }

  $.fn.quick_editor = function(o) {
    o = $.extend(defaults, o || {});
    return this.each(function() {
      var self=$(this)
      var name=o.name
      var ctrlenter=o.ctrlenter
      var esc=o.esc
      var ctrldel=o.ctrldel

      self.focus(function(){ 
        //log('focus '+name) 
        on(self)
      })

      self.blur(function(){ 
        //log('blur '+name) 
        off(self)
      })

      function on(e) {
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

      function off(e) {
        e.unbind('keyup', 'ctrl+return')
        e.unbind('keyup', 'esc')
        e.unbind('keyup', 'ctrl+del')
      }
    })
  }
})(jQuery);
