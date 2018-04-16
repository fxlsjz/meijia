

/*function openid(){
    var openid='<?php echo $model["openid"]; ?>';
    $.cookie('openid',JSON.stringify(openid) , { expires: 365, path: '/' }); 
}*/

function Dbug(a){
    window.onerror = function(e, ee, line) {
        if (a) alert(e+ '：' +ee+ '：' +line);
	}
}



var baseurl = (("undefined" != typeof(server) && server == 'duoke.mobi') || document.domain.indexOf('duoke.mobi') !=-1) ? 'http://duoke.mobi/' : 'http://pvoice.chinamobo.com/o2o_product_two/';
//var baseurl = 'http://pvoice.chinamobo.com/o2o_product/';
//var baseurl = 'http://duoke.mobi/';

var apiurl = baseurl+'api/index.php/wechat/index';

function os(){
    var ua = navigator.userAgent.toLowerCase(); 
    if(ua.match(/iPad/i)=="ipad" || ua.match(/iphone os/i) == "iphone os"){
		return 'ios';
	}else if (ua.match(/android/i) == "android") { 
       return 'android';
    }else if(ua.match(/micromessenger/i) == "micromessenger"){
		return 'wechat';
	}else if(ua.match(/msie 10/i) == "msie 10"){
		return 'ie10';
	}else { 
       return ''; 
    }
}
/**
* ajax 检查登录状态
* 跳转到登录页
*/
function checklogin(){
	if (typeof uid == 'undefined'){
		Xalert('请登录后操作',1500);
		setTimeout(function(){
			href(returnUrl+'/login?backurl='+encodeURIComponent(document.URL));
		},1500);
		return false;
	}else{
		return true;
	}
}

var wait = 60;
function timeout(o) {
   if (wait == 0) {
	   $(o).attr("disabled", false);
	   $(o).text("获取验证码");
	   wait = 60;
   } else {
	   $(o).attr("disabled", true);
	   $(o).text(wait + "秒后重新发送");
	   wait--;
	   setTimeout(function () {timeout(o);},1000);
   }
}

function iswechat(){
    var ua = navigator.userAgent.toLowerCase(); 
     return ua.match(/micromessenger/i) == "micromessenger";
}

function request(strParame) { 
	var args = new Object( ); 
	var query = location.search.substring(1); 
	
	var pairs = query.split("&"); // Break at ampersand 
	for(var i = 0; i < pairs.length; i++) { 
	var pos = pairs[i].indexOf('='); 
	if (pos == -1) continue; 
	var argname = pairs[i].substring(0,pos); 
	var value = pairs[i].substring(pos+1); 
	value = decodeURIComponent(value); 
	args[argname] = value; 
	} 
	return args[strParame]; 
} 

function zy_for(e, cb){
	var ch;
	if(e.currentTarget)
    	ch = e.currentTarget.previousElementSibling;
	else
		ch = e.previousElementSibling;
    if (ch.nodeName == "INPUT") {
        if (ch.type == "checkbox") 
            ch.checked = !ch.checked;
        if (ch.type == "radio" && !ch.checked) 
            ch.checked = "checked";
        
    }
    if (cb) 
        cb(e, ch.checked);
}

var storage_fix = '';
function dbug(a) {
    window.onerror = function(e, ee, line) {
        if (a) alert(e + '：' + ee + '：' + line);
    }
}

function nopic(src) {
    var npic = src || 'css/images/nopic.png';
    return document.domain ? domin + '/css/images/nopic.png': npic;

}

function getjsfile(js) {
    var oHead = document.getElementsByTagName('HEAD').item(0);
    var oScript = document.createElement("script");
    oScript.type = "text/javascript";
    oScript.src = js;
    oHead.appendChild(oScript);
}

function href(url, t) {
//  setTimeout(function(){
//      if (url.indexOf('company_id=') == -1){
//          url += (url.indexOf('?') == -1 ? '?' : '&')+'company_id='+company_id;
//      }
        window.location.href = url;
//	},t | 5);
}

	
function hz(str) {
    return encodeURIComponent(escape(str));
}

function uhz(str){
    return decodeURIComponent(unescape(str));	
}

function isnull(str) {
    return (str == null || str == 'null' || typeof(str) == "undefined" || str == '' || countnum(str) == 0);
}

function isnull2str(str, str2) {
    return ! isnull(str) ? str: str2;
}

function isArray(obj) {
    return typeof(obj) === 'object';
}

//返回上页, 后退
function goback(url) {
	
	if (document.referrer){
        window.history.go(-1);
        
	}else{
		href(url);
	}
    //history.go(-1);
}

/*function goback(url) {
    
    if (document.referrer){
        window.history.go(-1);
    }else{
        href(url);
    }*/
    //history.go(-1);
/*}*/

function getarr(str, i, p) {
    var arr = str.split(p || ',');
    return arr[i];
}

function loadinit(t, str) {
    var z = $('#loadinit2');
    if (t == -1) { z.remove();
    } else if (t > 0) {
        setTimeout(function() { z.remove();
        },
        t);
    } else {
        
		//$('#loadinit2').remove();
		if (z.length > 0) return false;
		var w = parseInt($('body').css('font-size')) * 2;
		var l = Math.floor(($(window).width() - w) / 2);
		var b = $('<div id="loadinit2" class="ub-pc ub"><div class="bg ub tx-middle"><div class=load></div><div class="ub-f1 ulev-1">'+str+'</div></div></div>');
		$('body').append(b);
		if (t) setTimeout(function() {
			b.remove()
		},
		t);
        
    }
}

function alert_info(t, time, time2) {
    var c = $("#alert_info");
	var isscroll = $(document).height() - $(window).height();
	var topstyle = isscroll ? ' style="top:'+($(window).height()/2+$(document).scrollTop())+'px"' : ''
    if (c.length == 0) {
        var b = $('<div id="alert_info"'+topstyle+'><div class="alert_ub ub-pc ub"><div class=bg>' + t + '</div></div></div>');
        $('body').append(b);
    } else {
        c.html('<div class="alert_ub ub-pc ub"><div class=bg>' + t + '</div></div>')
    }

    if (time && c) {
        setTimeout(function() {

            $("#alert_info").fadeOut(time2 ? time2: 1000,
            function() {
                $(this).remove();
                
            });
        },
        time);

    }
}

function Xalert(str, time) {
    if (str == 'close') {
        $('#alert_info').remove();
    } else {
        alert_info(str, time);
    }
}



function share_weibo_submit(){
	var content = $('#share_weibo #content').val();
	if (content == ''){
		Xalert('请填写分享内容', 1500);
		return false;
	}
	if (content.length>100){
		Xalert('分享内容不要超过100字', 1500);
		return false;
	}
	
	Xalert('正在发布...');
	var docurl = document.URL.replace(':8080','')
	content += docurl;
	var imgurl = $('.thumb-img').attr('imgsrc').replace('/uploads', 'uploads');
	
	var url = projectName+"/index.php/User/SinaUpdate";
	$.post(url ,{msg: content, imgurl: imgurl}, function(data){
		if (data.error_code){
			if (data.error_code == 21327 || data.error_code == 401){
				Xalert('微博登录授权失效', 1000);
				setTimeout(function(){
				    href(projectName+'/index.php/login/Oauth/type/sina?backurl='+encodeURIComponent(document.URL));
				},1000);
				return false;
			}
			Xalert(data.error, 1000);
		}else{
		    Xalert('分享成功<br>+'+data.addpoint, 500);
			$('#share_weibo #content').val('');
			$('#share_weibo').hide();
			$("#share_box").hide();
		}
		
	}, 'json');
	
}
/*分享到微博*/
function share_weibo(){
	var c = $("#share_weibo");
	var share_content = typeof(info) == 'object' ? decodeURIComponent(info.share_content) : $('.share_content:last').text();
    if (c.length == 0) {
        var b = $('\n\
		<div id="share_weibo">\n\
		<div class="alert_ub ub-pc ub">\n\
		<div class="bg">\n\
		<div class="ub">\n\
		<div class="share_title tx-l ub-f1">分享</div>\n\
		<div class="share_close tx-c" onclick="$(\'#share_weibo\').slideUp(200)"><span class="ulev2">×</span></div>\n\
		</div>\n\
		<div class="alert_ub share_content">\n\
        <textarea id="content">'+share_content+'</textarea>\n\
		</div>\n\
		<div class="ub-pc ub share_button tx-c"><h1 class="ulev0" onclick="share_weibo_submit()">提交</h1></div>\n\
		</div>\n\
		</div>\n\
		</div>');
        b.appendTo($('body'));
		//b.show();
    } else {
		
        $('#share_weibo').show();
    }
}


function share_init(){
	share();
	share_weibo();
	share_wechat();
}

function countnum(dd) {
    if (typeof(dd) == "object") {
        var c = 0;
        for (var i in dd) {
            c++;
        }
        return c;
    } else {
        return dd.length;
    }
}

/**
 * webStorage缓存方法
 * @param  str 存还是取
 * @param  key
 * @param  val
 * @param  s   有值表示sessionStorage
 * @author Adu
 * @2013年3月7日 15:18:25
 */
function webStorage(str, key, val, s) {	
	switch (str) {
	case 'set':
		!s ? localStorage.setItem(key, val) : sessionStorage.setItem(key, val);
		break;
	case 'get':
		return ! s ? localStorage.getItem(key) : sessionStorage.getItem(key);
		break;
	case 'rem':
		!s ? localStorage.removeItem(key) : sessionStorage.removeItem(key);
		break;
	case 'clear':
		!s ? localStorage.clear() : sessionStorage.clear();
		break;

		//保存json数据
	case 'setJson':
		var str = JSON.stringify(val); ! s ? localStorage.setItem(key, str) : sessionStorage.setItem(key, str);
		//取出json数据
	case 'getJson':
		var str = !s ? localStorage.getItem(key) : sessionStorage.getItem(key);
		return str ? JSON.parse(str) : {};
	}
}

function webCookie(str, key, val, s) {
	var time = s ? s : '';
	//alert('wechat:'+time);
    switch (str) {
    case 'set':
        $.cookie(key, val,  {expires: time});
        break;
    case 'get':
        return $.cookie(key);
        break;
    case 'rem':
        $.cookie(key, null);
        break;
    case 'clear':
        $.cookie(key, null);
        break;
        //保存json数据
    case 'setJson':
	    $.cookie(key, JSON.stringify(val),  {expires: time});        
        //取出json数据
		break;
    case 'getJson':
	    var str = $.cookie(key);
        return str ? JSON.parse(str) : {};
		break;
    }
}

/*判断json数组是否存在某个元素*/
function in_json(key, json){ 
	$.each(json,function(i,v) {    
		if (v == key) {    
		return true;    
		}    
	}); 
	return false;
}

function in_array(e, data){
	for(i=0;i<data.length;i++){
		if(data[i] == e)
		    return true;
		}
	return false;
}


function nowtime(nos) {
    var date = new Date(); //日期对象
    var now = "";
    now = date.getFullYear() + "-"; //读英文就行了
    now = now + (date.getMonth() + 1) + "-"; //取月的时候取的是当前月-1如果想取当前月+1就可以了
    now = now + date.getDate() + " ";
    now = now + date.getHours() + ":";
    now = now + date.getMinutes();
    if (!nos) now = now + ":" + date.getSeconds();
    return now;
}

function UnixTime(t) {
    var time = new Date().getTime();
    if (t) time = Math.round(time / 1000);
    return time
}

function Unix2Time(nS, t, tt) {
    var tm = new Date(parseInt(nS) * t);
    if (tt) tm = tm.toLocaleString().replace(/:d{1,2}$/, ' ');
    return tm;
}


function getDateDiff(dateTimeStamp) {
	var text = '';
	dateTimeStamp = parseInt(dateTimeStamp);
    var time = UnixTime(1);
	var datetime = Unix2Time(dateTimeStamp, 1000)
    var t = time - dateTimeStamp; //时间差 （秒）
    var y = Unix2Time(time, 1000).getFullYear() - datetime.getFullYear();
    var hms = datetime.format('h:m:s');
    if(t <= 60){
    		text = '刚刚'; // 一分钟内
	}else if(t < 60 * 60){
    		text = Math.floor(t / 60) + '分钟前';
   }else if(t < 60 * 60 * 24){
    		text = Math.floor(t / (60 * 60)) + '小时前';
   }else if(t < 60 * 60 * 24 * 3){
    		text = Math.floor(time/(60*60*24)) ==1 ?'昨天 ' + hms : '前天 ' + hms;
   }else if(t < 60 * 60 * 24 * 30){
    		text = datetime.format('MM-dd hh:mm'); //一个月内
   }else if(t < 60 * 60 * 24 * 365&&y==0){
    		text = datetime.format('MM-dd'); //一年内
   }else{
    		text = datetime.format('yyyy-MM-dd'); //一年以前
    }
	return text;
}
//今天 hh:mm
function getDateDiff2(dateTimeStamp) {
	var text = '';
	dateTimeStamp = parseInt(dateTimeStamp);
    var time = UnixTime(1);
	var datetime = Unix2Time(dateTimeStamp, 1000)
    var t = time - dateTimeStamp; //时间差 （秒）
    var y = Unix2Time(time, 1000).getFullYear() - datetime.getFullYear();
    var hm = datetime.format('hh:mm');
   if(t < 60 * 60 * 24){
    		text = hm;
   }else if(t < 60 * 60 * 24 * 2){
    		text = hm;
   }else if(t < 60 * 60 * 24 * 3){
    		text = hm;
   }else if(t < 60 * 60 * 24 * 4){
    		text = hm;
   }else{
    		text = datetime.format('MM-dd hh:mm'); //一个月内
			
   }
	return text;
}
//返回今天、明天
function getDateDiff4(dateTimeStamp) {
	var a = new Date();
	var nowtime = a.getTime();// 获取毫秒数
	var today = a.getFullYear() + "/" + (+a.getMonth() + 1) + "/" + a.getDate() + " 00:00:00";// 拼接今天0点0分0秒的字符串
	var todayTime = new Date(today).getTime();// 传入Date，获取今天0点0分0秒的毫秒数
	var diff = dateTimeStamp * 1000 - todayTime;// 获取的毫秒数与今天0点0分0秒的毫秒数的 差
	var dayNum = ~~(diff / (24*60*60*1000));
	//用位运算取整，得出差与每天毫秒数的余数
	var text = "";// 用来保存哪天的字符串
	switch(dayNum){
		case 0:
			text = "今天";
			break;
		case 1:
			text = "明天";
			break;
		case 2:
			text = "后天";
			break;
		case 3:
			text = "大后天";
			break;
		default:
			text = "&nbsp;";
	}
	return text;
}


//返回星期
function getDateDiff3(dateTimeStamp) {
	var text = '';
	dateTimeStamp = parseInt(dateTimeStamp);
    var time = UnixTime(1);
	var datetime = Unix2Time(dateTimeStamp, 1000)
    var t = time - dateTimeStamp; //时间差 （秒）
    var y = Unix2Time(time, 1000).getFullYear() - datetime.getFullYear();
	var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
	var dateStr =datetime.format('yyyy-MM-dd');
	var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/"))); 
	var text=weekDay[myDate.getDay()]; 
	return text;
}
//今天 明天 周一 周二
function getDateDiff5(dateTimeStamp) {
	var a = new Date();
	var nowtime = a.getTime();// 获取毫秒数
	var today = a.getFullYear() + "/" + (+a.getMonth() + 1) + "/" + a.getDate() + " 00:00:00";// 拼接今天0点0分0秒的字符串
	var todayTime = new Date(today).getTime();// 传入Date，获取今天0点0分0秒的毫秒数
	var diff = dateTimeStamp * 1000 - todayTime;// 获取的毫秒数与今天0点0分0秒的毫秒数的 差
	var dayNum = ~~(diff / (24*60*60*1000));
	//用位运算取整，得出差与每天毫秒数的余数
	var text = "";// 用来保存哪天的字符串
	var text1 = '';
	dateTimeStamp = parseInt(dateTimeStamp);
    var time = UnixTime(1);
	var datetime = Unix2Time(dateTimeStamp, 1000)
    var t = time - dateTimeStamp; //时间差 （秒）
    var y = Unix2Time(time, 1000).getFullYear() - datetime.getFullYear();
	/*var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];*/
    var weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
	var dateStr =datetime.format('yyyy-MM-dd');
	var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/"))); 
	var text1=weekDay[myDate.getDay()]; 
	
	switch(dayNum){
		case 0:
			text = "今天";
			break;
		case 1:
			text = "明天";
			break;
		default:
			text = text1;
	}
	return text;
}

//格式化时间
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        //month 
        "d+": this.getDate(),
        //day 
        "h+": this.getHours(),
        //hour 
        "m+": this.getMinutes(),
        //minute 
        "s+": this.getSeconds(),
        //second 
        "q+": Math.floor((this.getMonth() + 3) / 3),
        //quarter 
        "S": this.getMilliseconds() //millisecond 
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

Date.prototype.DateAdd = function(strInterval, Number) 
{ 
var dtTmp = this; 
switch (strInterval) { 
case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number)); 
case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number)); 
case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number)); 
case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number)); 
case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number)); 
case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
} 
} 

function StringAs(string) {
    return '"' + string.replace(/(\\|\"|\n|\r|\t)/g, "\\$1") + '"';
}

function isEmail(str){
  var reg = /^[0-9a-zA-Z_\-\.]+@[0-9a-zA-Z_\-]+(\.[0-9a-zA-Z_\-]+)*$/;
  return reg.test(str);
}

function isMobile(str){
  var reg = /^1[3|5|7|8]\d{9}$/;
  return reg.test(str);
}

/*图片尺寸自适应*/
function Ximgsize(maxWidth, maxHeight, w, h) {

    var hRatio;
    var wRatio;
    var Ratio = 1;
    wRatio = maxWidth / w;
    hRatio = maxHeight / h;
    if (maxWidth == 0 && maxHeight == 0) {
        Ratio = 1;
    } else if (maxWidth == 0) { //
        if (hRatio < 1) Ratio = hRatio;
    } else if (maxHeight == 0) {
        if (wRatio < 1) Ratio = wRatio;
    } else if (wRatio < 1 || hRatio < 1) {
        Ratio = (wRatio <= hRatio ? wRatio: hRatio);
    }
    if (Ratio < 1) {
        w = w * Ratio;
        h = h * Ratio;
    }
    return {
        'w': w,
        'h': h
    };

}


function RndNum(n) {
    var rnd = "";
    for (var i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
    return rnd;
}




function touch_hover(c){
	var t = event.currentTarget;
	$(t).Touchx({
		hoverClass: c
	});
}

function hidemenu(a){
	if (a == 'close'){
		$('#absolute').removeClass('x0 animate uof').addClass('x animate');
	}else if (!$('#absolute').hasClass('x0')){
	    $('#absolute').removeClass('x animate').addClass('x0 animate uof');	
	}else{
		$('#absolute').removeClass('x0 animate uof').addClass('x animate');
	}
}

function hidemenu2(a){
	if (a == 'close'){
		$('body').removeClass('leftnav_open');
	}else{
		 if ($('body').hasClass('leftnav_open')){
			a = 'close';
	        $('body').removeClass('leftnav_open');	
		}else{
			a = 'open';
			$('body').width($(window).width()).height($(window).height()).addClass('leftnav_open');
		}
	}
	var d = function(){
		event.preventDefault();
	}
	if (a == 'open'){
	    //document.addEventListener('touchmove', function (e) { d }, false);
	}else{
		//document.removeEventListener('touchmove', function (e) { d }, false);
	}
}

function zy_for(e, cb){
	var ch;
	if(e.currentTarget)
    	ch = e.currentTarget.previousElementSibling;
	else
		ch = e.previousElementSibling;
    if (ch.nodeName == "INPUT") {
        if (ch.type == "checkbox") 
            ch.checked = !ch.checked;
        if (ch.type == "radio" && !ch.checked) 
            ch.checked = "checked";
        
    }
    if (cb) 
        cb(e, ch.checked);
}


//获取坐标位置
function getPosition(ev){
	ev = ev || window.event;
	var point = {x:0,y:0};
    if(ev.pageX || ev.pageY){
	    point.x = ev.pageX;
	    point.y = ev.pageY;
    } else {//兼容ie
	    point.x = ev.clientX + document.body.scrollLeft - document.body.clientLeft;
	    point.y = ev.clientY + document.documentElement.scrollTop;
    }
    return point.x+':'+point.y;
	}
