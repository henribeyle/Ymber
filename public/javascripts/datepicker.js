(function($) {
  $.select_date = function(start_date,func) {
    var dp=$('<input>').attr('type','text').attr('id','datepicker').appendTo($('body'))
    dp.datepicker({
      dateFormat: 'dd/mm/yy',
      firstDay: 1
    })

    var day=null
    if(start_date) {
      var m=/(\d{2})\/(\d{2})\/(\d{4})/.exec(start_date)
      day=new Date(m[3],m[2]-1,m[1])
    } else {
      day=new Date()
    }
    dp.css('visibility','visible')
    dp.datepicker('setDate',day)
    dp.datepicker('option','onClose',function(d) {
      dp.remove()
      func(d)
    })
    dp.focus()
  }
})(jQuery)
