/*
 * jQuery - pullScroll v1.0
 * Copyright(c) 2013 by xiongyouliang’
 * Date: 2013-04-18
 * qq : 81345863
 */
var pageparam = {pageNo:pageNo, pageSize:10};



/*加载数据*/
function getData(option, callback, errorcallback){
	var div = option.div;
    var url = option.url;
	var data = $.extend({}, pageparam, option.data); 
	
	$.ajax({
		type: option.ajax_type || "GET",
		url: url,
		dataType: "json",
		//jsonp: "jsonpcallback",
		data: data,
		crossdomain: true,
		success: function(success) {
                        
			if(success.code == 500){
				Xalert(success.msg, 500);
			}else{
                             
			    $('#dataLoding').addClass('uhide');
				if (div){
					
					var source =$(div).html();
					var render = template.compile(source);
					var html = render({
						data: success,
						list: success.results
					});
					
					$(div).removeClass('uhide').html(html);
					loadinit(-1);
				}
			    callback && callback(success);
			
			}
			
			setTimeout(function(){
				if (typeof(myScroll) == 'object') myScroll.refresh();
			},500);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			//alert();
			errorcallback && errorcallback(XMLHttpRequest, textStatus, errorThrown);
		}
	});
	

}

 
 
/*加载数据*/
function ScrollData(option, callback, errorcallback){

	var div = option.div;
	var source = $(option.div).first().html();
	var render = template.compile(source);
	var url = option.url;
	if (pageNo == 1){

		$('#dataLoding').removeClass('uhide');
		myScroll && myScroll.scrollTo(0, 0, 0);
		option.lastpage_tips && $('#pullUp').hide().removeClass('nodata').addClass('loading').find('.pullUpLabel').text('加载更多');
		$(option.div).last().html('');
		
	}
	


	var data = $.extend({}, pageparam, option.data); 

	$.ajax({
		type: option.ajax_type || "GET",
		url: url,
		dataType:"json",
		//jsonp:"jsonpcallback",
		data: data,
		crossdomain: true,
		success: function(success) {
		      
			if (success.code == 400 || success.code == 401){
				reslogin(login);
			}else if (success.code == 500){
		    	Xalert(success.msg)
		    }else{
				$('#dataLoding').addClass('uhide');
			if(success.pagecount>0){
				if (success.page  > success.pagecount){
					
				}else{
					$('#wrapper').addClass('nonetwork');
				}
			}
			if (success.counts>0){
				pageNo++;
			}
			var html = render({
				data: success,
				list: success.results
			});
			$(html).appendTo($(option.div).last());
			if (callback) callback(success);
			
			setTimeout(function(){
				//最后一页的提示
			    if (option.lastpage_tips){
				   if (success.page  >= success.pagecount){
						$('#pullUp').removeClass('loading').addClass('nodata').find('.pullUpLabel').text('没有更多了')
					}else{
						$('#pullUp').hide().removeClass('nodata').addClass('loading').find('.pullUpLabel').text('正在加载...');
					}
				}
				
				if (myScroll) myScroll.refresh();
			},500);
		}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
                    
			//Xalert(XMLHttpRequest+ textStatus+ errorThrown);
			errorcallback && errorcallback(XMLHttpRequest, textStatus, errorThrown);
		}
});

}

function ImageLoad(o){
	//Xalert('111');
	var imgcache = [];
	var top = $(o.div).offset().top;
	var height = $(o.div).height();
	$(o.imgitem).each(function(){
		var m = $(this);
		var url = m.attr('data-original');
		var tagname = m.get(0).tagName;			
		if (!url) { return; }
		//重组
		var data = {
			obj: m,
			tagname: tagname,
			url: url
		};
		
		imgcache.push(data);
	});



    var loadimg = function(){	
	   	var h = 5;
		$.each(imgcache, function(i, data) {
			var o = data.obj, url = data.url, tagname = data.tagname;
			if(!/.(jpg|gif|png|bmp)$/.test(url)){
				url = '../static/webapp/images/image_default.png';
			}
			if (o && o.not('.img-isload')) {
				var settop = parseInt(o.offset().top - top);
				var src = o.attr('src');
				if (settop+h < height) {
					if (tagname == 'IMG'){
						o.attr("src", url);
					}else{
						o.css("background-image", "url("+url+")");
					}
					o.addClass('img-isload');
					data.obj = null;		
				}
			}
		});	
		
		return false;	
	}
	loadimg();
	
}


function ScrollPull(option, ScrollOption){
    var defaults = {
		div: '#wrapper',
		step : 5,
		ltime : 0,
		pullDown_text : '下拉刷新',
		pullDown_time : '上次更新时间：--',
		pullDown_time_storgename : '',
		pullUp_text : '上拉加载更多...',
		pullLoading_text : '努力加载中...',
		pullLabel_text : '放开手指刷新...',
		bottomLoading_text: '正在加载...',
	        Left:0,
		Refreshfun: null,		
		UpAction: null,
		DownAction: function(){
			location.reload();
		},
		BottomAction: null,
		Endfun: null,
		imgitem: 'img.loadimg,img.img-load,div.loadimg',
		imgdefault: 'nopic.png',
		nopic: 'static/webapp/images/nopic.png',		

	};


	var option = $.extend(defaults, option || {});//
	var scroll_defaults = {
		probeType: 2,//probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
		scrollbars: true,//有滚动条
		mouseWheel: true,//允许滑轮滚动
		fadeScrollbars: true,//滚动时显示滚动条，默认影藏，并且是淡出淡入效果
		bounce:true,//边界反弹
		interactiveScrollbars:true,//滚动条可以拖动
		shrinkScrollbars:'scale',// 当滚动边界之外的滚动条是由少量的收缩。'clip' or 'scale'.
		click: true ,// 允许点击事件
		
		keyBindings:true,//允许使用按键控制
		momentum:true// 允许有惯性滑动
	}
    ScrollOption = $.extend(scroll_defaults, ScrollOption || {});//
	
	var pullDownEl, pullDownL;
	var pullUpEl, pullUpL;
	var Downcount = 0 ,Upcount = 0;
	var loadingStep = 0;//加载状态0默认，1显示加载状态，2执行加载数据，只有当为0时才能再次加载，这是防止过快拉动刷新
	var scrollbottom = 0;
	var pullDownAction = function(obj) {//下拉事件
		setTimeout(function() {
			option.DownAction(obj);
			pullDownEl.removeClass('loading');
			pullDownL.html('下拉显示更多...');
			pullDownEl['class'] = pullDownEl.attr('class');
			pullDownEl.attr('class','').hide();
			//myScroll.refresh();
			loadingStep = 0;
		}, 1000); //1秒
	}
	var pullUpAction = function(obj) {//上拉事件
		setTimeout(function() {
			option.UpAction(obj);
			pullUpEl.removeClass('loading');
			pullUpL.html('上拉显示更多...');
			pullUpEl['class'] = pullUpEl.attr('class');
			pullUpEl.attr('class','').hide();
			//myScroll.refresh();
			loadingStep = 0;
		}, 1000);
	}
    var pullBottomAction = function(obj) {//滚动到底部
	    pullUpL.html('正在加载...');
		setTimeout(function() {
			option.BottomAction(obj);
			//pullUpEl.removeClass('loading');
			
			scrollbottom = 0;
		}, 1000);
	}
	var goScroll = function(){
		pullDownEl = $('#pullDown');
		pullDownEl_height = pullDownEl.outerHeight(true);
		pullDownL = pullDownEl.find('.pullDownLabel');
		pullDownEl['class'] = pullDownEl.attr('class');
		pullDownEl.attr('class','').hide();
		
		pullUpEl = $('#pullUp');
		pullUpEl_height = pullUpEl.outerHeight(true);
		pullUpL = pullUpEl.find('.pullUpLabel');
		pullUpEl['class'] = pullUpEl.attr('class');
		if (option.UpAction || option.BottomAction){
			pullUpEl.attr('class','').hide();
		}
		
		myScroll = new IScroll(option.div, ScrollOption);
		//滚动时
		
		myScroll.on('refresh', function(){
			ImageLoad(option);
			
		});
		myScroll.on('scroll', function(){
			
            //Xalert(this.y+'|'+this.maxScrollY)
			ImageLoad(option);
			
			if (this.y > 0) {
				if(option.DownAction){
					pullDownEl.show();
					if (this.y > pullDownEl_height){
						//下拉刷新效果
						//if (this.lastpage) return false;
						pullDownEl.attr('class',pullUpEl['class'])
						//myScroll.refresh();
						pullDownEl.addClass('flip');
						pullDownL.html('松开刷新');
						loadingStep = 1;
					}else{
						pullDownEl.removeClass('flip');
						pullDownL.html('下拉刷新');
						loadingStep = 0;
					}
			    }
			}else if (this.y <= this.maxScrollY) {
				
				if (option.BottomAction){
					
					scrollbottom = 1;
					
				}
				if (this.y < this.maxScrollY && option.UpAction){
					pullUpEl.show();
					if ((this.maxScrollY - this.y) > pullUpEl_height){
						//上拉刷新效果
						pullUpEl.attr('class',pullUpEl['class'])
						
						//myScroll.refresh();
						pullUpEl.addClass('flip');
						pullUpL.html('准备刷新');
						loadingStep = 1;
						
					}else{
					    pullUpEl.removeClass('flip');
						pullUpL.html('下拉加载更多');
						loadingStep = 0;
						
						
					}
				}
				
			}
		});
		//滚动完毕
		myScroll.on('scrollEnd',function(){
			//Xalert(pullUpEl.hasClass('nodata'))
			
			if (option.BottomAction && (scrollbottom == 1 || this.y <= this.maxScrollY)){
				if(!pullUpEl.hasClass('nodata') && this.y < 0){
					if (pullUpEl.is(':hidden')) {
						pullUpEl.show();
						this.scrollTo(0, this.maxScrollY - pullUpEl_height, 0);
					}
				
					pullUpL.html(option.bottomLoading_text);
					pullUpEl.removeClass('flip').addClass('loading');
					
					loadingStep = 2;
					option.BottomAction && pullBottomAction(this);
				}
				
			}else if(scrollbottom == 0){
				option.UpAction && pullUpEl.hide();
				option.DownAction && pullDownEl.hide();
				myScroll.refresh();
			}
			if(loadingStep == 1){
				if (pullUpEl.attr('class').match('flip|loading')) {
					this.scrollTo(0, this.maxScrollY - pullUpEl_height, 0);
					pullUpEl.removeClass('flip').addClass('loading');
					pullUpL.html(option.pullLoading_text);
					loadingStep = 2;
					//Xalert('end', 2000);
					option.UpAction && pullUpAction(this);
				}else if(pullDownEl.length>0 && pullDownEl.attr('class').match('flip|loading')){
					pullDownEl.removeClass('flip').addClass('loading');
					pullDownL.html(option.pullLoading_text);
					loadingStep = 2;
					option.DownAction && pullDownAction(this);
				}
			}else if(loadingStep == 0){
				option.UpAction && pullUpEl.hide();
				option.DownAction && pullDownEl.hide();
				myScroll.refresh();
			}
		});
	}

	goScroll();
	$(option.div).css('left', 0);
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
}