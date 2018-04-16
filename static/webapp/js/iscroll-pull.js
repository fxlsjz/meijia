/*
 * jQuery - pullScroll v1.0
 * Copyright(c) 2013 by xiongyouliang’
 * Date: 2013-04-18
 * qq : 81345863
 */




 
function unique_identification(data, extend_userinfo, extend_alert){
	var company_id = $.cookie('company_id');
	var timestamp=UnixTime(1);
	var login = extend_userinfo && $.cookie('login') ? JSON.parse($.cookie('login')) : {}; 
	
	//alert(JSON.parse($.cookie('login')))
	var u = navigator.userAgent;
	if(login == null){
			return $.extend(data, {company_id:company_id,device_type:'wechat', language:'zh_CN', version:'1.0.7'}, identification[data.service_code]);
		}
	else{
		return $.extend(data, {company_id:company_id,device_type:'wechat', language:'zh_CN', version:'1.0',token:login.token, user_id:login.user_id}, identification[data.service_code]);
	}					
}
/*自动分页*/
function autoPager(callback){
    $(window).scroll(function(e) {
		if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
			$('#pullUp').removeClass('uhide');
			var h = $('#pullUp').outerHeight(true);
			//$(document).scrollTop($(document).height() - $(window).height())
			setTimeout(function(){
				if (!$('#pullUp').hasClass('nodata')){
					callback && callback();
				}
			},500);
		}
	});	
	callback && callback();
}


//重新登录
/*function reslogin(){
	var combineObj={};
	Xalert('请登录');
	//var backurl = baseurl+'wechat/index.php/login/index?backurl='+encodeURIComponent(document.URL);
	if (window.location.host == 'localhost'){
		baseurl = root_dir+'/';
	}else{
	 // baseurl = baseurl.replace('/ispa_php/', '/ispa_two/');
	   baseurl = baseurl.replace('/ispa_two/');
	}
	var backurl = baseurl+'index.php/index/login';
	setTimeout(function(){
		href(backurl);
	}, 1000);
	
}*/
/*无数据提示*/
function nodataTips(num, opts){
	var text = opts.content || '哎呀！页面被小怪兽吃掉了！重试一下吧！';
		//var url = opts.content || '';
	$('#nodata_tips').remove();		
	var html =  '<div id="nodata_tips" style="margin-top:20%;">\n\<div class="noData" style="margin-top:38%;background:url(../../static/webapp/images1/appendloss.png)no-repeat center 0;background-size: 4em;height:6em" >\n\</div>\n\<p class="tx-c margin-t-10" style="color:#becfd7;    padding-bottom: 0.5em;">'+text+'\n\</p>\n\<p class="tx-c margin-t-10" style="border:1px solid #becfd7;color:#becfd7;border-radius:13px 13px 13px 13px;width:30%;margin:0 auto;height:1.5em;line-height:1.5em"onClick="location.reload();">重新加载\n\</p>\n\</div>';


	/*'<div id="nodata_tips" style="margin-top:20%;">\n\
	<div class="noData"></div><p class="tx-c noText line20 margin-t-10">'+text+'</p>\n\
	</div>'*/
		if ((num == 0 || !num) && opts.div){
		setTimeout(function(){$(opts.div).append(html);},300);
		

	}


}

/*加载数据*/
function getData(options, successcallback, errorcallback){
	var defaults = {
		ajax_type: 'GET',
		dataType: "jsonp",
		ajax_url: apiurl,
		async: false,
		timeout: 30*1000,
		nodatatips: {img: '', content: '', div: '#scroller'},
		extend_userinfo: true,
		//禁用500弹出框
		extend_alert:true,
		
	};
	var option = $.extend(defaults, options);
	var div = option.div;
	var requesttime = UnixTime();
	var data = unique_identification(option.data, option.extend_userinfo); 
	
	$.ajax({
		cache: false,
		type: option.ajax_type,
		url: option.ajax_url,
		dataType: option.dataType,
		jsonp: "jsonpcallback",
		data: data,
		crossdomain: true,
		async: option.async,
		timeout: option.timeout,
		success: function(success) {
			if (success.error_code == 400 || success.error_code == 401){
				//checklogin();
				
				
					href(root_dir+'/index.php/index/login');
				
				$.cookie('login','' , { expires: 365, path: '/' });	
				
			}else if(success.error_code == 500 && option.extend_alert){
				
				Xalert(success.error_msg, 3000);

				$('#dataLoding').addClass('uhide');
				if (div){
					
					var source = $(div).first().html();
					var render = template.compile(source);
					var html = render({
						data: success,
						list: option.datalist ? option.datalist(success) : success.results,
						
					});
					$(div).last().removeClass('uhide').html(html);
					loadinit(-1);
				}
				nodataTips(success.counts, option.nodatatips);
				successcallback && successcallback(success);
			}else{
				$('#dataLoding').addClass('uhide');
				if (div){
					
					var source = $(div).first().html();
					var render = template.compile(source);
					var html = render({
						data: success,
						list: option.datalist ? option.datalist(success) : success.results,
						
					});
					$(div).last().removeClass('uhide').html(html);
					loadinit(-1);
				}
				nodataTips(success.counts, option.nodatatips);
				successcallback && successcallback(success);
			
			}
		
			
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			//alert();
			//Xalert(option.timeout+':'+UnixTime()+':'+requesttime)
			if (option.timeout && UnixTime() > (requesttime + option.timeout)){
				Xalert('请求超时了，可能是网络不太稳定');
			}
			errorcallback && errorcallback(XMLHttpRequest, textStatus, errorThrown);
		}
	});
	
	

}


function getData2(options, successcallback, errorcallback){
	
	var defaults = {
		ajax_type: 'GET',
		dataType: "jsonp",
		ajax_url: apiurl+'/baifbpay/index',
		async: false,
		timeout: 30*1000,
		nodatatips: {img: '', content: '', div: '#scroller'},
		extend_userinfo: true,
	};
	var option = $.extend(defaults, options);
	var div = option.div;
	var requesttime = UnixTime();
	var data = unique_identification(option.data, option.extend_userinfo); 
	
	$.ajax({
		cache: false,
		type: option.ajax_type,
		url: option.ajax_url,
		dataType: option.dataType,
		jsonp: "jsonpcallback",
		data: data,
		crossdomain: true,
		async: option.async,
		timeout: option.timeout,
		success: function(success) {
			if (success.error_code == 400 || success.error_code == 401){
				//checklogin();
				
			}else if(success.error_code == 500){
				
				Xalert(success.error_msg, 3000);
				
			}
			else if(success.error_code == 404){
				var url = '';
				href(url);				
			}
			else{
				
				$('#dataLoding').addClass('uhide');
				if (div){
					
					var source = $(div).first().html();
					var render = template.compile(source);
					var html = render({
						data: success,
						list: option.datalist ? option.datalist(success) : success.results,
						
					});
					$(div).last().removeClass('uhide').html(html);
					loadinit(-1);
				}
				nodataTips(success.counts, option.nodatatips);
				successcallback && successcallback(success);
			
			}
		
			
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			//alert();
			//Xalert(option.timeout+':'+UnixTime()+':'+requesttime)
			if (option.timeout && UnixTime() > (requesttime + option.timeout)){
				Xalert('请求超时了，可能是网络不太稳定');
			}
			errorcallback && errorcallback(XMLHttpRequest, textStatus, errorThrown);
		}
	});
	
	

}



/*自动分页*/
function autoPager(callback){
    $(window).scroll(function(e) {
		if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
			$('#pullUp').removeClass('uhide');
			var h = $('#pullUp').outerHeight(true);
			//$(document).scrollTop($(document).height() - $(window).height())
			setTimeout(function(){
				if (!$('#pullUp').hasClass('nodata')){
					callback && callback();
				}
			},500);
		}
	});	
	callback && callback();
}
  
 
/*加载数据*/
function ScrollData(options, successcallback, errorcallback){
	var defaults = {
		ajax_type: 'GET',
		dataType: "jsonp",
		ajax_url: apiurl,
		async: false,
		timeout: 30*1000,
		nodatatips: {img: '', content: '', div: '#scroller'},
		extend_userinfo: true,
	};
	var option = $.extend(defaults, options);
	var requesttime = UnixTime();
	var div = option.div;
	var source = $(option.div).first().html();
	var render = template.compile(source);
	if ($(option.div).last().hasClass('isloading')) return false;
	$(option.div).last().addClass('isloading');
	if (pageno == 1){
		$('#dataLoding').removeClass('uhide');

		option.lastpage_tips && $('#pullUp').hide().removeClass('nodata').addClass('loading').find('.pullUpLabel').text('加载更多...'); 
        $(option.div).last().html('');
		
	}



	var ajax_data = $.extend({}, {pageno:pageno, pagesize:10}, option.data);
	$.ajax({
		type: option.ajax_type,
		url: option.ajax_url,
		dataType:"jsonp",
		jsonp:"jsonpcallback",
		data: unique_identification(ajax_data, option.extend_userinfo),
		crossdomain: true,
		timeout: option.timeout,
		success: function(success) {
			if (success.error_code == 400 || success.error_code == 401){
				//checklogin();
			}else if(success.error_code == 500){
				
				Xalert(success.error_msg, 3000);
				
			}else{
				$('#dataLoding').addClass('uhide');
				if(success.pagecount>0){
					if (success.pageno  > success.pagecount){
						 
					}else{
						//$('#wrapper').addClass('nonetwork');
					}
				}
				
				if (success.counts>0){
					pageno++;
				}

				var html = render({
					data: success,
					list: option.datalist ? option.datalist(success) : success.results,
					
				});
				
				$(html).appendTo($(option.div).last());
				nodataTips(success.counts, option.nodatatips);
				if (successcallback) successcallback(success);
			
				setTimeout(function(){
					//最后一页的提示
					if (option.lastpage_tips){
					   if (success.pageno  >= success.pagecount){
							$('#pullUp').removeClass('loading').addClass('nodata').find('.pullUpLabel').text('没有更多了')
						}else{
							$('#pullUp').hide().removeClass('nodata').addClass('loading').find('.pullUpLabel').text('正在加载...');
						}
					}
					$(option.div).last().removeClass('isloading');
					
				},500);
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			//Xalert(XMLHttpRequest+ textStatus+ errorThrown);
			//Xalert(option.timeout+':'+UnixTime()+':'+requesttime,10000)
			if (option.timeout && UnixTime() > (requesttime + option.timeout)){
				Xalert('请求超时了，可能是网络不太稳定');
			}
			errorcallback && errorcallback(XMLHttpRequest, textStatus, errorThrown);
		}
	});

}

function ImageLoad(obj){
	var imgcache = [];
	var top = $(obj.div).offset().top;
	var height = $(obj.div).height();
	$(obj.imgitem).each(function(){
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
				url = obj.nopic
			}
			if (o && o.not('.img-isload')) {
				var settop = parseInt(o.offset().top - top);
				var src = o.attr('src');
				if (settop+h < height) {
					if (tagname == 'IMG' && src!=url){
						o.attr("src", url);
					}else{
						var bgimg = o.css('background-image');
						bgimg = bgimg.match(/\((.*?)\)/);
						//Xalert(bgimg[1])
						if (bgimg[1] != url) o.css("background-image", "url("+url+")");
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
		imgitem: 'img.loadimg,img.img-load,div.loadimg,div.loadavatarimg',
		imgdefault: 'nopic.png',
		nopic: rootdir+'static/webapp/images/image_default.png',		

	};


	var option = $.extend(defaults, option || {});//
	var scroll_defaults = {
		probeType: 2,//probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
		scrollbars: true,//有滚动条
		mouseWheel: false,//允许滑轮滚动
		fadeScrollbars: true,//滚动时显示滚动条，默认影藏，并且是淡出淡入效果
		bounce:false,//边界反弹
		interactiveScrollbars:false,//滚动条可以拖动
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
				if (pullUpEl.length>0 && pullUpEl.attr('class').match('flip|loading')) {
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
	//document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
}