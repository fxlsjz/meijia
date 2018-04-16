var source;
var source_stock;
var update_stock_run = false;
var bidding = false;
//初始化调用方法
function time_push(){
	if(window.EventSource){
		var url=projectName+"/index.php/index/GetTime";
	
				  
		source=new window.EventSource(url);
					
		try{
							 
			source.onopen=function(event){
								  
				//alert("连接已经建立，状态号："+this.readyState);
			}
			source.onmessage=function(event){
							   
			if (event.data){
				//Xalert(event.data, 500); 
				showmsg(event.data);
			}
				//p('客户端收到服务器推送的数据是：'+event.data);
			}
			source.onerro=function(event){
					//p("出错，信息状态号是："+this.readyState);
			}
		}catch(err){
			alert('出错啦，错误信息：'+err.message);
		}
	}

}

function auction(){
	
	
}

function update_stock(){
	if (!update_stock_run) update_stock_run = true;
	if(window.EventSource){
		var url=projectName+"/index.php/Benefits/Stock?bid="+info.bid;      
		source=new window.EventSource(url);        
		try{
			source.onmessage=function(event){
				var no = event.data;               
				if (no){
					var obj = $('#stock');
					var number = obj.text();
					obj.removeClass('go');
					if (number != no){
						 obj.addClass('go');
					}else{
						
					}
					setTimeout(function(){
						obj.text(info.stock - parseInt(no));
					},500);
				}
			}
		}catch(err){
			alert('出错啦，错误信息：'+err.message);
		}
	}

}
//退出方法，关闭EventSource
function quit_source(){
	if(source){
		source.close();
		source=null;
	}
}
//退出方法，关闭EventSource
function quit_source_stock(){
	if(source_stock){
		source_stock.close();
		source_stock=null;
	}
}

//信息输出方法
function showmsg(msg){
	msg = jQuery.parseJSON(msg)
	info.nowtime = msg.nowtime;
	if((info.start_time - info.nowtime) < 86400 && !$('#new_year').hasClass('xdsoft')){
		$('#new_year').html('');
		$('#binding-text').text('即将开始：');
		flipcountdown();
	}
}

//倒计时
function flipcountdown(){
if (info.start_time < info.nowtime) info.bid_time = info.end_time;
	$('#new_year').flipcountdown({
        size:'xs',
		tick:function(){
			var nol = function(h){
				return h>9?h:'0'+h;
			}
			info.nowtime +=1;
			var	range  	= info.bid_time-info.nowtime,
				secday = 86400, sechour = 3600,
				days 	= parseInt(range/secday),
				hours	= parseInt((range%secday)/sechour),
				min		= parseInt(((range%secday)%sechour)/60),
				sec		= ((range%secday)%sechour)%60;
			//活动开始
			if (info.nowtime > info.end_time){
					change_state(2);
					$('#footer ul').addClass('no_addprice');
					if (info.state!=2 && $('.recorder-list:last').html() == '') get_recorder();
					quit_source();
					quit_source_stock();
					$.getJSON('url=projectName+"/index.php/Benefits/Stock', {bid: info.bid}, function(){
						
					});
					return false;
					
					
			}else if (info.nowtime >= info.start_time){
				change_state(1);
				var progress = ((info.over_time-info.start_time)-(info.over_time-info.nowtime))/(info.over_time-info.start_time)*100;
				$('.progress .barFill').width(progress+'%');
				$('#binding-text').text('距结束：');
				info.bid_time = info.end_time;
				
				if (!update_stock_run) update_stock();
			}
			
			
			if(range < 86400){
				$('#bidtime-text').text('').addClass('uhide');
				return nol(hours)+' '+nol(min)+' '+nol(sec);
			}else{
				var etime = Unix2Time(info.end_time, 1000);
				$('#binding-text').text('结束时间：');
				$('#bidtime-text').text(etime.format('yyyy-MM-dd hh:mm'));
			}
		}
	});
    if($('.touch-ul .item-touch:visible').length>2){
		 $('#flipcountdown-bind ul').appendTo($('#flipcountdown'));
	}else{
		$('#flipcountdown').addClass('uhide');
	}	
}

$(function(){
    var div = '#page';
	var w = $(window).width();
	var touch_x = true;
	var len = $('.touch', div).find('.item-touch').length;
	$('.touch-ul > .item-touch').width(w);
	$('.touch-ul').width(w*len);
   
		var translate = function(xx, t){
			$('.touch', div).css({
				 '-webkit-transform': 'translate('+xx+'px, 0)',
				 'transform': 'translate('+xx+'px, 0)',
				 'transition-duration': t ? '.5s' : ''
			});
		}
		
		var Xtranslate = function(o, xx, t){
            if (!touch_x || o.absDiffY > o.absDiffX){
				 //return false;
			}else{
				var xxx = parseInt(xx*-1/w);
				var index = o.index;
				xxx = o.diffX>0 ? xxx : xxx+1;
				
/*				$('.touch .item:eq('+index+')', div).css({
					 '-webkit-transform': 'scale(.8, .8)',
					 'transition-duration': t ? '.5s' : ''
				});*/
				
				//Xalert(xxx);
				if (xxx >= len) xxx = len-1;
				if (t) xx = xxx * w * -1;
				if (t){
					if(xxx >= (len-2)){
						$('#flipcountdown').hide();
						$('#flipcountdown ul').appendTo($('#flipcountdown-bind'));
					}else{
						$('#flipcountdown').show();
						$('#flipcountdown-bind ul').appendTo($('#flipcountdown'));
					}
				}
				translate(xx, t);
			}
			

		};
		
		var divleft = function(obj){
			var transform = $('.touch').css("transform").split(',');
			var left = transform.length>1 ? parseInt(transform[4]) : 0;
			return left;
		};
	$(div).Touchx({
		step: 100,
		touchstart: function (opts8){
			py = divleft(div);
			},
		touchmove: function(opts){
			
			if (opts.absDiffX>5){
				 var x = parseInt(opts.diffX);
				 var xx = x + py;
				 Xtranslate(opts, xx);                         
			}
		},
		touchend: function(opts){					
			if (opts.absDiffX>5){						
				var x = parseInt(opts.diffX);
				var xx = x + py;//opts.xxx>0 ? -x : x;
				Xtranslate(opts, xx, 1);
			}
		},
	});
	
	//if (info.state != 2) time_push();
	if (info.state == 1) update_stock();
	
	$('#bind_price').unbind('click').on('click', function(){
		var me = $(this);
		if (me.hasClass('loading')) return false;
		//alert('aaa');
		me.addClass('loading');
		if(info.start_time > info.nowtime){
			Xalert('亲，时间还没有到呢。', 1500);
			setTimeout(function(){me.removeClass('loading')}, 1500);
			return false;
		}
		if (bidding){
			Xalert('亲，只能参加一次呢。', 1500);
		}
		
		
		//return false;
		var url=  projectName+"/index.php/Benefits/Bid";

		
		var data = {bid: info.bid};
		setTimeout(function(){
			$.getJSON(url, data, function(data){
				//alert(JSON.stringify(data))
				if (data.code == 200){
					if (data.winning == 1){
						Xalert('恭喜您，抽中啦！', 1500);
						setTimeout(function(){
							href(projectName+'/index.php/Address/Benefits/bid/'+info.bid);
						},1500);
						return false;
					}else{
						bidding = true;
						Xalert('很遗憾，下次再来吧！', 1500);
					}
					//alert(data.current_price);
					//return false;
				}else{
					Xalert(data.msg, 1500);	
					if (data.code == 401){
						setTimeout(function(){
					        href(projectName+'/index.php/login/index?backurl='+encodeURIComponent(document.URL));
						},1500);
					}
					me.removeClass('loading');
				}
				
				setTimeout(function(){
					//me.removeClass('loading');
				},300);
				
			});
		},200);
		
	});
	if ((info.start_time - info.nowtime) > 86400){
		var time = Unix2Time(info.start_time, 1000);
		$('#binding-text').text('开始时间：');
		$('#new_year').text(time.format('yyyy-MM-dd hh:mm'));
	}else if(info.state == 2){
		
	}else{
		flipcountdown();
	}
	share_init();
	
		WeixinApi.ready(function(Api) {
        
		// 微信分享的数据
		var wxData = {
			"appId": "", // 服务号可以填写appId
			"imgUrl" : BaseUrl+$('.thumb-img').attr('imgsrc'),
			"link" : document.URL,
			"desc" : decodeURIComponent(info.share_content),
			"title" : ''
		};
	
        var WechatPoint = function(type){
			$.getJSON(projectName+'/index.php/User/WechatPoint', {model:2 ,aid: info.bid, type: type}, function(data){
				if (data.addpoint){
					Xalert('分享成功 +'+data.addpoint, 1500)
				}
			});
			
		}
		// 分享的回调
		var wxCallbacks = {
			// 分享成功
			confirm : function(resp) {
				WechatPoint(0);
			},
		};
		var wxCallbacks2 = {
			// 分享成功
			confirm : function(resp) {
				WechatPoint(1);
			},
		};
	
		// 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
		Api.shareToFriend(wxData, wxCallbacks2);
	
		// 点击分享到朋友圈，会执行下面这个代码
		Api.shareToTimeline(wxData, wxCallbacks);

	});
});