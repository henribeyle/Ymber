function Data() {
  this.tags=[]
  this.main_tag=null
}

Data.prototype.add_tag = function(t) {
  this.tags.push(t)
}

Data.prototype.remove_tag = function(value) {
  var pos=this.find_tag(value)
  if(pos!=-1)
    this.tags.splice(pos,1)
  else
    assert_failed('remove_tag "unknown tag" '+value)
}

Data.prototype.set_main_tag = function(value) {
  var tid=this.find_tag(value)
  if(tid!=-1)
    this.main_tag=this.tags[tid]
}

Data.prototype.find_tag = function(value) {
  for(var i=0;i<this.tags.length;i++) {
    if(this.tags[i].value==value)
      return i
  }
  return -1
}

Data.prototype.log = function() {
  console.dir(this)
}
