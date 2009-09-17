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
if(jQuery)(function($){$.fn.fixClick=function(B,A){var _=this;this.click=B;this.dblclick=A;this.firstClick=false;this.timer=null;this.delay=250;$(this).click(function($){var A=this;this.e=$;_.firstClick==false?_.timer=setTimeout(function(){_.click(A.e);_.firstClick=false},_.delay):"";_.firstClick=true}).dblclick(function($){clearTimeout(_.timer);_.firstClick=false;_.dblclick($)});return this}})(jQuery)
