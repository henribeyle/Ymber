function G() {
  this.g=[]
}

G.prototype.to_s = function() {
  var s='{'
  for(var i=0;i<this.g.length;i++) {
    s+=this.g[i].to_s()
    if(i<this.g.length-1)
      s+=", "
  }
  s+='}'
  return s
}

G.prototype.find = function(value) {
  for(var i=0;i<this.g.length;i++) {
    if(this.g[i].value==value)
      return i
  }
  return -1
}

G.prototype.find_by_id = function(id) {
  for(var i=0;i<this.g.length;i++) {
    if(this.g[i].id==id)
      return i
  }
  return -1
}

G.prototype.add = function(s) { 
  this.g.push(s)
}

G.prototype.remove = function(pos) { 
  this.g.splice(pos,1)
}

////////////////////////////////////////////////////////////////////////////////

function E(value,id) {
  this.value=value
  this.id=id
  this.sub=new G
}

E.prototype.to_s = function() {
  return this.value+'['+this.id+']'
}

E.prototype.log = function(x) {
  log(( x ? x : "")+" "+this.to_s() + ' ' + this.sub.to_s())
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
