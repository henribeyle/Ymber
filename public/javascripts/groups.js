// function G() {
//   this.g=[]
// }
// 
// G.prototype.to_s = function(level) {
//   if(level==null) level=2
//   return s='{ ' + $.map(this.g,function(x,i) {
//     return x.to_s(level)
//   }).join(', ') + ' } '
// }
// 
// G.prototype.log = function(x,level) {
//   if(level==null) level=2
//   log(( x ? x : "")+" "+this.to_s(level))
// }
// 
// G.prototype.find = function(value) {
//   for(var i=0;i<this.g.length;i++) {
//     if(this.g[i].value==value)
//       return i
//   }
//   return -1
// }
// 
// G.prototype.find_by_id = function(id) {
//   for(var i=0;i<this.g.length;i++) {
//     if(this.g[i].id==id)
//       return i
//   }
//   return -1
// }
// 
// G.prototype.add = function(s) {
//   this.g.push(s)
// }
// 
// G.prototype.remove = function(pos) {
//   this.g.splice(pos,1)
// }


