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

G.prototype.to_sr = function() {
  var s='{'
  for(var i=0;i<this.g.length;i++) {
    s+=this.g[i].to_sr()
    if(i<this.g.length-1)
      s+=", "
  }
  s+='}'
  return s
}

G.prototype.log = function(x) {
  log(( x ? x : "")+" "+this.to_s())
}

G.prototype.logr = function(x) {
  log(( x ? x : "")+" "+this.to_sr())
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
