(function($) {

   var main_opts = {
      'position': 'fixed',
      'display': 'none',
      'top': '10px',
      'right': '10px',
      'border': 'none',
      'padding': '10px 10px 10px 45px',
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

      $('<div>').attr('id','notice-ui').css({
         zIndex: 500,
         position: 'fixed',
         display: 'none'
      }).append(notice_node.show()).
         appendTo('body').
         fadeIn(500, function() {
            setTimeout(function() {
               notice_node.fadeOut(1000,function() {
                  notice_node.remove()
                  $('#notice-ui').remove()
                  notice_node=null
               })
            },timeout)
         })
   }

   $.error = function(msg,timeout) {
      if(!msg) return
      var no=$.extend(main_opts, { 'background-image': 'url("/images/Red_Ball.png")' })
      var v=$('<div>').css(no).append($('<span>').html(msg))
      $.notice(v,timeout)
   }
   $.warning = function(msg,timeout) {
      if(!msg) return
      var no=$.extend(main_opts, { 'background-image': 'url("/images/Orange_Ball.png")' })
      var v=$('<div>').css(no).append($('<span>').html(msg))
      $.notice(v,timeout)
   }
   $.message = function(msg,timeout) {
      if(!msg) return
      var no=$.extend(main_opts, { 'background-image': 'url("/images/Green_Ball.png")' })
      var v=$('<div>').css(no).append($('<span>').html(msg))
      $.notice(v,timeout)
   }
})(jQuery)
