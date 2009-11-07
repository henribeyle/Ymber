/*
 * jQuery FixClick Plugin
 * version: 1.0
 * @requires jQuery v1.2.2 or later
 *
 * Copyright (c) 2008 AlloVince
 * Examples at: http://allo.ave7.net/fixclick
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 */
if(jQuery) (function($){$.fn.fixClick =  function(click,dblclick) {

  //Closure #1
  var app = this;

  this.click = click;

  this.dblclick = dblclick;

  this.firstClick = false;

  this.timer = null;

  //default dblclick delay
  this.delay = 250;

  $(this).click(function(e){
    e.stopPropagation()

    //Closure #2
    var ins = this;
    this.e = e;

    app.firstClick == false ?
    app.timer = setTimeout(function() {
      app.click(ins.e);
      app.firstClick = false;
    }, app.delay) : '';

    app.firstClick = true;
    return false
  }).dblclick(function(e){
    e.stopPropagation()

    clearTimeout(app.timer);
    app.firstClick = false;
    app.dblclick(e);
    return false
  });

  return this;
}})(jQuery);
