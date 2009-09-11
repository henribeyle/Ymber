function log(x)  {
  var l=$('#log').show()
  if(l.size()!=0) {
    l.html(l.html()+"<br/>"+x)
  }
}

function terrible_error(request,error) {
  request.abort()
  log('terrible error happened: '+error)
}

function normal_error(error) {
  log('normal error happened: '+error)
}

function assert_failed(what) {
  log('assert_failed: '+what)
}

function get_response(a) {
  var r=null
  eval("r="+a)
  return r
}

function is_error(r) {
  return r.status == 'error'
}
