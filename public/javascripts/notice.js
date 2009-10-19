(function($) {
   $.notice = function(msg,timeout) {
      if(!msg) return
      var notice_node=msg
      if(timeout==null)
         timeout=3000

      var nui= $('#notice-ui')
      if(nui.length==0)
        nui=$('<div>').attr('id','notice-ui').appendTo('body')

      var notice_wrap=$('<div>').append(notice_node)
      nui.append(notice_wrap)

      notice_wrap.fadeIn(500, function() {
        setTimeout(function() {
          notice_node.fadeOut(1000,function() {
            notice_wrap.remove()
          })
        },timeout)
      })
   }

   $.error = function(msg,timeout) {
      if(!msg) return
      $.notice($('<div>').
        addClass('notice-main').
        css('background-image', 'url("/images/error.png")').
        html(msg),timeout)
   }
   $.warning = function(msg,timeout) {
      if(!msg) return
      $.notice($('<div>').
        addClass('notice-main').
        css('background-image', 'url("/images/warning.png")').
        html(msg),timeout)
   }
   $.message = function(msg,timeout) {
      if(!msg) return
      $.notice($('<div>').
        addClass('notice-main').
        css('background-image', 'url("/images/message.png")').
        html(msg),timeout)
   }
})(jQuery)
