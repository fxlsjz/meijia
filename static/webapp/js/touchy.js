
/*
 * jQuery - pagex
 * Copyright(c) 2012 by Teddy Xiong'
 * Date: 2013-03-30
 * qq : 6901106
 */

(function($) { 
    $.fn.Touchx = function(options) {    

	
	//opts.initfun(scre2);

	 // 开放表单手势和滚动手势
/*	 document.ontouchmove = function(e) {
	    var target = e.currentTarget;
	    while(target) {
	        if(checkIfElementShouldScroll(target))
	            return;
	        target = target.parentNode;
	    }

		while (target.nodeType != 1) target = target.parentNode;
		 if (  target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA' && target.tagName != 'button')
		{e.preventDefault();}
	};*/

    var defaults = { 
     step: 50,
	 longtouchtime : 750,
	 onleft: null,
	 onright: null,
	 init: null,
	 touchstart: null,
	 touchend: null,
	 touchmove: null,
	 swipeleft: null,
	 swiperight : null,
	 swipeup : null,
	 swipedown: null,
	 tap : null,
	 longtouch : null,
	 isbind : false,
	 onTouch :null,
	 hoverClass: null
    };    
    

    var opts = $.extend(defaults, options);
    var scre2 = this;
	var this_ = $(this);

    var d = document,
		isTouch = 'createTouch' in document,
		touchEvents = {
		  start: 'touchstart pointerdown',
		  move: 'touchmove pointermove',
		  end: 'touchend pointerup',
		  cancel: 'touchcancel pointercancel'
		},
		mouseEvents = {
		  start: 'mousedown',
		  move: 'mousemove',
		  end: 'mouseup',
		  cancel : 'mouseup'
		},
		evts = isTouch ? touchEvents : mouseEvents;
	//alert('go2')
	//初始化触摸点值
	var me = null;
	var index = null;
	var total = parseInt(this_.length);
	var startX = 0
	var startY = 0;
	var hasMoved = false;
	var startTime = parseInt(new Date().getTime());
  
	
	function events(e){
	  return isTouch ? e.touches[0] || event.changedTouches[0] : e;
	}
	
	function getPage (event, page) {
		return $support.touch ? event.changedTouches[0][page] : event[page];
	}
	
	this_.bind(evts.start,function(){
	  //alert('start')
	  //alert(isTouch)
	  event.preventDefault();
	  event.stopPropagation();
	  var toucher = events(event);
	  //alert(toucher.pageX)
	  //alert(event.touches[0].pageX);
	  me = $(this);
	  index = parseInt(scre2.index(me));
	  //alert('index:'+index)
	  startTime = parseInt(new Date().getTime());
	  startX = toucher.pageX;
	  startY = toucher.pageY;
	  //alert('start:'+startX)
	  
	  var option = {
		  me : me,
		  index : index,
		  total : total,
		  startX : startX,
	      startY : startY,		  
	  }
	  if (opts.onTouch){
		  opts.onTouch('start');
	  }
	  //alert('start:'+startX)
	  
	  if (opts.touchstart) opts.touchstart(option);
	  if (opts.hoverClass) me.addClass(opts.hoverClass);
	  
	  this_.unbind(evts.move,onMove);
	  this_.bind(evts.move, onMove);
	  
	  
	  function onMove () {	
          var toucher = events(event);
		  var moveX = toucher.pageX;
		  var moveY = toucher.pageY;
		  var diffX = moveX - startX;
		  var diffY = moveY - startY;
	  	  var option = {
		  me : me,
		  index : index,
		  total : total,
		  moveX : moveX,
	      moveY : moveY,
		  diffX : diffX,
		  diffY : diffY,
		  absDiffX : Math.abs(diffX),
		  absDiffY : Math.abs(diffY),  
		  dirX : diffX > 0 ? 'right' : 'left',
		  dirY : diffY > 0 ? 'down' : 'up',
	      }
		  
	      if (opts.touchmove) opts.touchmove(option);
		  hasMoved = true;
	  }
	  
	  this_.bind(evts.end, onEnd);
	  function onEnd () {
		  
		var ele = event.target;
		var touch = events(event) ? events(event) : event.changedTouches[0];
		var customEvent = '';	
		var endX = touch.pageX;
		
		var endY = touch.pageY;	
		var option = {};
		option.me = me;
		option.index = index;
		option.total = total;
		option.startTime = startTime;
		option.endTime = parseInt(new Date().getTime());		
		option.timeDiff = parseInt(option.endTime - option.startTime);
		option.startX = startX;
		option.startY = startY;
		option.moveX = endX;
		option.moveY = endY;
		option.diffX = endX - startX;
		option.diffY = endY - startY;
		option.absDiffX = Math.abs(option.diffX);
		option.absDiffY = Math.abs(option.diffY);
		
		option.dirX = option.diffX > 0 ? 'right' : 'left';
		option.dirY = option.diffY > 0 ? 'down' : 'up';
		if (!hasMoved || option.absDiffX == 0){
			if (option.absDiffX < opts.step) {
			  if (option.timeDiff <= opts.longtouchtime) {
				if (opts.tap) opts.tap(option);
				if (opts.isbind) $(ele).trigger('tap', [option]);
			  }
			  else {
				if (opts.longtouch) opts.longtouch(option);
				if (opts.isbind) $(ele).trigger('longTouch', [option]);
				//ele.dispatchEvent(customEvents.longTouch);
			  }
			}
		}
		else {
		  if (option.timeDiff < opts.longtouchtime) {
			if (option.absDiffX >= option.absDiffY) {
				if(option.absDiffX > opts.step){
					customEvent = 'swipe' + option.dirX;
					if (option.dirX == 'left' && opts.swipeleft) opts.swipeleft(option);
					if (option.dirX == 'right' && opts.swiperight) opts.swiperight(option);
					if (opts.isbind) $(ele).trigger(customEvent, [option]);
				}
			}
			else {
				if(option.absDiffY > opts.step){
					customEvent = 'swipe' + option.dirY;
					if (option.dirY == 'up' && opts.swipeup) opts.swipeup(option);
					if (option.dirY == 'down' && opts.swipedown) opts.swipedown(option);
					if (opts.isbind) $(ele).trigger(customEvent, [option]);
				}
			}         
		  }
		}
		if (opts.onTouch){
		  opts.onTouch('end');
	    }
		
        opts.touchend && opts.touchend(option);
		if (opts.hoverClass) me.removeClass(opts.hoverClass);
		this_.unbind(evts.move, onMove);
		this_.unbind(evts.end, onEnd);
		
	  }
	});
  
	//createSwipeEvents();
	
	//this_.bind(evts.start, onStart);
    



    };
})(jQuery); 