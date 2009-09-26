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
        self.keyup(selection)
        self.mouseup(selection)
      })

      self.blur(function(){
        self.unbind('keyup', 'ctrl+return')
        self.unbind('keyup', 'esc')
        self.unbind('keyup', 'ctrl+del')
        self.unbind('keyup', '@')
        self.unbind('keyup', selection)
        self.unbind('mouseup', selection)
      })

      function at_func() {
        var self=this
        if(self.value.indexOf('f@')!=-1) {
          $.select_date(null,function(x) {
            self.value = self.value.replace('f@', x);
            $(self).focus()
          })
        }
      }

      function selection(e) {
        var sel=this.value.substring(this.selectionStart,this.selectionEnd)
        var prev=this.value.substr(0,this.selectionStart);
        var next=this.value.substr(this.selectionEnd);
        if(/(\d{2})\/(\d{2})\/(\d{4})/.test(sel)) {
          $.select_date(sel,function(x) {
            self.val(prev+x+next)
            self.focus()
          })
        }
      }

      return self
    })
  }
})(jQuery);
