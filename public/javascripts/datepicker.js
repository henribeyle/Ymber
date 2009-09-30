(function($) {
  var date_regex=/^(\d{2})\/(\d{2})\/(\d{4})$/

  $.is_date = function(d) {
    return date_regex.test(d)
  }

  $.select_date = function(start_date,func) {
    var dp=$('<input>').attr('type','text').attr('id','datepicker').appendTo($('body'))
    dp.datepicker({
      dateFormat: 'dd/mm/yy',
      firstDay: 1
    })

    var day=new Date()
    if(start_date) {
      var m=date_regex.exec(start_date)
      day=new Date(m[3],m[2]-1,m[1])
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
