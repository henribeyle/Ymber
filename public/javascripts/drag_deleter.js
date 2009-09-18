(function($) {
  var defaults = {
    opacity: 0.5,
    cursor: 'move',
    on_delete: null,
    on_intact: null,
    revert: true,
    max_dist: 60
  }

  $.fn.drag_deleter = function(o) {
    var go = $.extend(defaults, o || {})
    return this.each(function() {
      var self=$(this)
      var ondel=go.on_delete
      var onint=go.on_intact
      var max_dist=go.max_dist
      var mygo = $.extend(go,{
        helper: function() { return self.clone().attr('id','draghelper') },
        drag: function(e,ui) {
          var d=dist($(this).offset(),ui.position)
          if(d>max_dist)
            $('#draghelper').addClass('tobedeleted')
          else
            $('#draghelper').removeClass('tobedeleted')
        },
        stop: function(e, ui) {
          var d=dist($(this).offset(),ui.position)
          if(d>max_dist)
            ondel && ondel()
          else
            onint && onint()
        }
      })

      function dist(x,y) {
        return Math.sqrt(Math.pow((x.left-y.left),2)+
          Math.pow((x.top-y.top),2))
      }

      return self.draggable(mygo)
    })
  }
})(jQuery);

