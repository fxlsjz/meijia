template.helper('dateFormatDiff', function (date) {
		    //date = new Date(Unix2Time(date, 1000));
		    return getDateDiff(date);
});

template.helper('dateFormat', function (date, format) {
    date = new Date(Unix2Time(date, 1000));
    return date.format(format);
});

template.helper('endpro', function (s, e) {
	var time = UnixTime(1);
    var time2 = e - s;
    return  Math.round(((time - s) / time2)*100, 0) +'%';
});


function uploads(src, path, fullpath) {
	//projectName = 'http://bbs.adyolo.com/uploads';
	//projectName = window.location.host;
	projectName = "";
	fullpath = (fullpath) ? 'http://'+window.location.host : '';
	if (path == '_avatar_'){
		path = '';
		src = src!='' ? src : projectName+'/adyolo/static/webapp/images/common/default_head.png';
	}else{
	    path = path ? path : '';
	}
	var domin = (src+'').substr(0,7) != 'http://' ? fullpath+projectName+path+'/' : '';
    return domin+src;
}
/*图片完整URL*/
template.helper('uploads', function (src, path) {
    return uploads(src, path);
});

/*用户名片URL*/
template.helper('businesscard_url', function (userid, anonymous) {
	var url = anonymous == 1 ? 'javascript:;' : returnUrl+'/businessCard/Info/userid/'+userid;
    return url;
});

function message_tips(){
	if(window.EventSource){
		var url=projectName+"/index.php/Message/HeadTips";  
		var tipsid = $('#header,header');
		source=new window.EventSource(url);	
		try{		 
			source.onopen=function(event){
			}
			source.onmessage=function(event){ 
			
				if (event.data){
					var data = jQuery.parseJSON(event.data);
					var counts = parseInt(data.counts);
					if(counts > 0){
						if(tipsid.find('.msg-tips').length == 0){
						    tipsid.append('<div class="msg-tips"></div>');
						}
						if (parseInt(data.first) == 1){
							 var options_audio = {
								  preload: "auto",
								  autoplay: true,
								  src: projectName+'/static/webapp/sound/message.mp3',
								  volume: 0.4
							  }
							  _audio = new Audio();
							  for(var key in options_audio){
									  _audio[key] = options_audio[key];
							  } 
							  _audio.load();
							  _audio.play();
	
							//var Media = new Audio(projectName+'/static/webapp/sound/message.mp3');
							//Media.play();
						}
						$('.message_tips dd', '#leftWrapper').removeClass('uhide').text(counts);
						
					}else{
						tipsid.find('.msg-tips').remove();
					}
				}
			}
			source.onerro=function(event){
			}
		}catch(err){
			//alert('出错啦，错误信息：'+err.message);
		}
	}

}

/**
* 分享到微信的参数设置
*/
function wechat_setting(data){
		WeixinApi.ready(function(Api) {
        
		// 微信分享的数据
		var wxData = {
			"appId": "", // 服务号可以填写appId
			"imgUrl" : data.imgurl || '',
			"link" : data.url || document.URL,
			"desc" : (data.desc || document.title)+'我的BIAD移动社区',
			"title" : ''
		};
	
        var WechatPoint = function(type){
			/*$.getJSON(projectName+'/index.php/User/WechatPoint', {model:2 ,aid: info.bid, type: type}, function(data){
				if (data.addpoint){
					Xalert('分享成功 +'+data.addpoint, 1500)
				}
			});*/
			
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
	
}

