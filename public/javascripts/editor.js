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
        self.bind('keyup', 'ctrl+return',function(){ ctrlenter && ctrlenter() })
        self.bind('keyup', 'esc', function(){ esc && esc() })
        self.bind('keyup', 'ctrl+del', function(){ ctrldel && ctrldel() })
        self.bind('keyup', '@', at_func)
      })

      self.blur(function(){
        self.unbind('keyup', 'ctrl+return')
        self.unbind('keyup', 'esc')
        self.unbind('keyup', 'ctrl+del')
      })

      function at_func() {
        var self=this
        if(self.value.substr('f@')!=-1) {
          log('found')
          $.select_date(null,function(x) { 
            self.value = self.value.replace('f@', x);
          })
        }
      }

      return self
    })
  }
})(jQuery);
