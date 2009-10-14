// MOOTOOLS is a very good library that provides many changes to the basic
// objects as well as many ui helpers. These are my implementations (based on
// their documentation) to some changes that they provide to the main objects.
// I hope to use them with jquery. I have not implemented all of them, but for
// those I have, I have tried to respect their interface (but probably missed
// something). In some few cases I have broken their interface (sorry)
//
// see test_jqmu.js for examples of use

// get an array out of an object (very simple version)
function to_a(o) {
  var copy=[]
  for(var i=0;;i++) {
    if(o[i] === undefined) break
    copy[i]=o[i]
  }
  return copy
}

// is this an array
function is_a(o) {
  return toString.call(o) === "[object Array]"
}

// I use repeat instead of periodical
// I use args instead of arguments
// I use obj instead of bind
Function.prototype.create = function(o) {
  var self=this
  o = o || {}
  var fun = function() {
    return self.apply(o.obj || null,
      arguments.length!=0 ? arguments : (
        is_a(o.args) ? o.args : [o.args]
      ))
  }
  if(o.repeat && o.delay) return setInterval(fun, o.delay)
  if(o.delay) return setTimeout(fun, o.delay)
  return fun
}

Function.prototype.pass = function(args,obj) {
  return this.create({args: args, obj: obj})
}

Function.prototype.bind = function(obj) {
  return this.create({obj: obj})
}

Function.prototype.delay = function(delay, obj, args) {
  return this.create({obj: obj, delay: delay, args: args})
}

Function.prototype.repeat = function(delay, obj, args) {
  return this.create({obj: obj, delay: delay, args: args, repeat: true})
}

Array.prototype.each = function(fn,obj) {
  for(var i = 0; i<this.length; i++)
    fn.bind(obj)(this[i],i,this)
}

Array.prototype.map = function(fn,obj) {
  var na=[]
  for(var i = 0; i<this.length; i++)
    na.push(fn.bind(obj)(this[i],i,this))
  return na
}

// not in mootools (my alias)
Array.prototype.all = function(fn,obj) {
  for(var i = 0; i<this.length; i++) {
    if(fn.bind(obj)(this[i],i,this)!=true)
      return false
  }
  return true
}

Array.prototype.every = Array.prototype.all

// not in mootools (my alias)
Array.prototype.any = function(fn,obj) {
  for(var i = 0; i<this.length; i++) {
    if(fn.bind(obj)(this[i],i,this)==true)
      return true
  }
  return false
}

Array.prototype.some = Array.prototype.any

// not in mootools (my alias)
Array.prototype.grep = function(fn,obj) {
  var na=[]
  for(var i = 0; i<this.length; i++) {
    if(fn.bind(obj)(this[i],i,this))
      na.push(this[i])
  }
  return na
}

Array.prototype.filter = Array.prototype.grep

// mootools does not accept elem to be a function
// that checks for equality. I do accept this dual
// form, but then, if you are really looking for a
// function, my version is no longer compatible with
// mootools
Array.prototype.indexOf = function(elem,from) {
  var call=typeof elem == 'function'
  for(var i = from ? from : 0; i<this.length; i++) {
    if(call ? elem(this[i]) : elem == this[i])
      return i
  }
  return -1
}

Array.prototype.index = Array.prototype.indexOf

// see comment for indexOf
Array.prototype.contains = function(elem,from) {
  return this.indexOf(elem,from) != -1
}

Array.prototype.include = function(elem) {
  if(!this.contains(elem))
    this.push(elem)
  return this
}

// see comment for indexOf
Array.prototype.erase = function(elem) {
  var call=typeof elem == 'function'
  for(var i = this.length-1; i>=0 ; i--) {
    if(call ? elem(this[i]) : elem == this[i])
      this.splice(i,1)
  }
  return this
}

Array.prototype.getLast = function() {
  return this[this.length-1]
}

// not in mootools
Array.prototype.last = Array.prototype.getLast

// not in mootools (my alias)
Number.prototype.to_i = function(base) {
  return parseInt(this,base || 10)
}

Number.prototype.toInt = Number.prototype.to_i

// not in mootools (my alias)
Number.prototype.to_f = function() {
  return parseFloat(this)
}

Number.prototype.toFloat = Number.prototype.to_f

Number.prototype.limit = function(min,max) {
  if(this<min) return min
  if(this>max) return max
  return this
}

Number.prototype.round = function(digits) {
  var x=Math.pow(10,digits||0)
  return Math.round(this*x)/x
}

Number.prototype.times = function(fn,obj) {
  for(var i=0;i<this;i++)
    fn.bind(obj)(i)
}

String.prototype.test = function(x,opts) {
  return new RegExp(x,opts).test(this)
}

String.prototype.contains = function(elem,split) {
  if(!split)
    return this.test(elem)
  else
    return this.split(split).contains(elem)
}

String.prototype.escapeRegExp = function() {
  return this.replace(/([-^$*+?.()|{}[\]\\])/g,"\\$1")
}

// not in mootools (my alias)
String.prototype.to_i = function(base) {
  return parseInt(this,base || 10)
}

String.prototype.toInt = String.prototype.to_i

// not in mootools (my alias)
String.prototype.to_f = function() {
  return parseFloat(this)
}

String.prototype.toFloat = String.prototype.to_f

String.prototype.trim = function() {
  return this.replace(/^\s+(.*?)\s+$/,'$1')
}

String.prototype.clean = function() {
  return this.trim().replace(/\s+/g,' ')
}
