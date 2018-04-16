<!DOCTYPE html>
<html ng-app="wechat">

	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
		<base href="/">
		<!--<meta HTTP-EQUIV="Pragma" CONTENT="no-cache">-->
		<!--<meta HTTP-EQUIV="Cache-Control" CONTENT="no-cache">-->
		<!--<meta HTTP-EQUIV="Expires" CONTENT="0">-->
		<meta name="format-detection" content="telphone=no" />
		<title>魔多客</title>
		<link href="apps/css/ionic.app.min.css" rel="stylesheet">
		<link rel="stylesheet" href="apps/css/ui-base.css">
		<link rel="stylesheet" href="apps/css/ui-box.css">

		<!--<link rel="stylesheet" href="apps/css/ui-color.css">-->

		<!-- common css -->
		<link href="apps/css/common.css" rel="stylesheet">

	</head>

	<body onresize="onResize()">
		<ion-nav-view animation="slide-left-right" class="main-view" ng-class="{'start-page': !isLoadStartPage || isLoadStartPage == undefined}"></ion-nav-view>
		<div id="start-page" ng-show="!isLoadStartPage || isLoadStartPage == undefined"></div>
		<div id="allmap"></div>
	</body>
	<!-- ionic/angularjs js -->

	<script src="apps/lib/ionic/js/ionic.bundle.min.js"></script>

	<script src="apps/lib/ionic/js/angular/angular-cookies.min.js"></script>
	<!-- oclazyload -->
	<script src="apps/lib/oclazyload/dist/ocLazyLoad.min.js"></script>
	<!-- image-lazy-load -->
	<script src="apps/lib/image-lazy-load/ionic-image-lazy-load.min.js"></script>
	<script src="apps/lib/tabSlideBox/tabSlideBox.min.js"></script>
	<script src="apps/i18n/zh_CN.js"></script>
	<!-- your app's js -->
	<script src="apps/js/app.js"></script>

	<script src="apps/js/home-module.js?v=2017.01.11"></script>
	<script src="apps/js/login-module.js?v=2017.01.11"></script>
	<script src="apps/js/service-module.js?v=2017.01.11"></script>
	<script src="apps/js/technician-module.js?v=2017.01.11"></script>
	<script src="apps/js/order-module.js?v=2017.01.11"></script>
	<script src="apps/js/mall-module.js?v=2017.01.11"></script>
	<script src="apps/js/my-module.js?v=2017.01.11"></script>
	<script src="apps/js/store-module.js?v=2017.01.11"></script>

	<!-- env js -->
	<script src="apps/js/env.js"></script>
	<!-- config js -->
	<script src="apps/js/config.js"></script>
	<!-- filter js -->
	<script src="apps/js/filter.js"></script>
	<!-- services js -->
	<script src="apps/js/services.js"></script>
	<!-- weixin jssdk js -->
	<script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js" ng-if="$ionicPlatform.isWechat"></script>
	<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=KXnjNRxVZmDDifUN6LFi2bzI"></script>

	<script>//窗口高度
var windowHeight = window.innerHeight;

//监听窗口大小改变(输入法弹出和关闭)
function onResize() {
	var bin = document.getElementById("btnBottom");
	var content = document.getElementById("body-view");
	if(!bin) return;
	var h = window.innerHeight;

	if(h < windowHeight) {
		bin.style.visibility = "hidden";
		var styleInfo = window.getComputedStyle ? window.getComputedStyle(content, "") : content.currentStyle;
		if(content) {
			content.style.bottom = 0;
		}
	} else {
		bin.style.visibility = "visible";
		if(content) {
			content.style.bottom = bin.offsetHeight + "px";
		}
	}
}</script>
</html>