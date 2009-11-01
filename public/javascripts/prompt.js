function prompt(cb, q, a) {
  function remove_all() {
    overlay.remove()
    ww.remove()
  }

  function ok() {
    var val=input.val()
    remove_all()
    cb(val)
  }

  function cancel() {
    remove_all()
    cb(null)
  }

  var overlay=$('<div>').
    addClass('prompt-overlay').
    html('&nbsp;').
    appendTo('body')

  var input=$('<input type="text">').keypress(function(e) {
    if((e.keyCode==10)||(e.keyCode==13)) ok()
    if(e.keyCode==27) cancel()
  }).val(a)

  var ww=$('<div>').
    addClass('prompt-wrapper').
    append($('<div>').addClass('prompt-ui').
      append($('<span>').addClass('prompt-title').html(q)).
      append(input).
      append($('<div>').addClass('prompt-button-row').
        append($('<span>').addClass('prompt-button').html('OK').click(ok)).
        append($('<span>').addClass('prompt-button').html('Cancel').click(cancel)))).
    appendTo('body')

  input.focus().select()
}
