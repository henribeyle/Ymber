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

      self.focus(function(){ bind_all() })
      self.blur(function(){ unbind_all() })

      function bind_all() {
        self.bind('keyup', 'ctrl+return',function(){ ctrlenter && ctrlenter() })
        self.bind('keyup', 'esc', function(){ esc && esc() })
        self.bind('keyup', 'ctrl+del', function(){ ctrldel && ctrldel() })
        self.bind('keyup', '@', at_func)
        self.keyup(selection)
        self.mouseup(selection)
      }

      function unbind_all() {
        self.unbind('keyup', 'ctrl+return')
        self.unbind('keyup', 'esc')
        self.unbind('keyup', 'ctrl+del')
        self.unbind('keyup', '@')
        self.unbind('keyup', selection)
        self.unbind('mouseup', selection)
      }

      function at_func() {
        var self=this
        if(self.value.indexOf('f@')!=-1) {
          unbind_all()
          $.select_date(null,function(x) {
            bind_all()
            self.value = self.value.replace('f@', x);
            $(self).focus()
          })
        }
        if(self.value.indexOf('m@')!=-1) {
          unbind_all()
          $.map_show(function(lat,lng) {
            bind_all()
            if(!lat) return
            self.value = self.value.replace('m@', '{'+lat+','+lng+'}');
            $(self).focus()
          })
        }
      }

      function selection(e) {
        var sel=this.value.substring(this.selectionStart,this.selectionEnd)
        var prev=this.value.substr(0,this.selectionStart);
        var next=this.value.substr(this.selectionEnd);
        if(/\d{2}\/\d{2}\/\d{4}/.test(sel)) {
          unbind_all()
          $.select_date(sel,function(x) {
            bind_all()
            self.val(prev+x+next)
            self.focus()
          })
        }
        var mp=/\{(\d+\.\d+),(\d+\.\d+)\}/
        if(mp.test(sel)) {
          var m=mp.exec(sel)
          unbind_all()
          $.map_show(function(t,g) {
            bind_all()
            if(!t) return
            self.val(prev+'{'+t+','+g+'}'+next)
            self.focus()
          },m[1],m[2])
        }
      }

      return self
    })
  }
})(jQuery);
