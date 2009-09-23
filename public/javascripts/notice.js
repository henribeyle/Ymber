(function($) {

   var main_opts = {
      'position': 'relative',
      'float': 'right',
      'display': 'block',
      'border': 'none',
      'padding': '10px 10px 10px 45px',
      'margin-bottom': '10px',
      'opacity': '0.8',
      'font-weight': 'bold',
      'color': '#fff',
      'background': 'black no-repeat 5px 3px',
      '-moz-border-radius': '10px'
   }

   $.notice = function(msg,timeout) {
      if(!msg) return
      var notice_node=msg
      if(timeout==null)
         timeout=3000

      var nui= $('#notice-ui')
      if(nui.length==0)
        nui=$('<div>').attr('id','notice-ui').appendTo('body').css({
         zIndex: 500,
         position: 'fixed',
        'top': '20px',
        'right': '20px',
      })

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
      var no=$.extend(main_opts, { 'background-image': 'url("/images/Red_Ball.png")' })
      $.notice($('<div>').css(no).html(msg),timeout)
   }
   $.warning = function(msg,timeout) {
      if(!msg) return
      var no=$.extend(main_opts, { 'background-image': 'url("/images/Orange_Ball.png")' })
      $.notice($('<div>').css(no).html(msg),timeout)
   }
   $.message = function(msg,timeout) {
      if(!msg) return
      var no=$.extend(main_opts, { 'background-image': 'url("/images/Green_Ball.png")' })
      $.notice($('<div>').css(no).html(msg),timeout)
   }
})(jQuery)
