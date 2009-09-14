function E(value,id) {
  this.value=value
  this.id=id
  this.sub=new G
}

E.prototype.to_s = function(level) {
  if(level==null) level=2
  var s=''
  if(level>0)
    s=this.value+' ['+this.id+']'
  if(level>1)
    s+=' ' + this.sub.to_s(level-1)
  return s
}

E.prototype.log = function(x,level) {
  if(level==null) level=2
  log(( x ? x : "")+" "+this.to_s(level))
}

E.prototype.add = function(s) {
  if(this.sub.find(s.value)!=-1)
    assert_failed("adding subelement twice")
  if(s.sub.find(this.value)!=-1)
    assert_failed("adding subelement twice (in sub)")
  this.sub.add(s)
  s.sub.add(this)
}

E.prototype.remove = function(s) {
  var pi=this.sub.find(s.value)
  if(pi==-1) {
    assert_failed("trying to remove but it is not here")
  }
  else {
    this.sub.remove(pi)
  }
  var pj=s.sub.find(this.value)
  if(pj==-1) {
    assert_failed("trying to remove but it is not here (in sub)")
  } else {
    s.sub.remove(pj)
  }
}
