'use strict';
/*首页
 author huoyuanyuan
 */
app.controller('HomeIndexCtrl', function($ionicScrollDelegate, $rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData) {

	document.title = 'Feshion Me';

	//是否显示会员套票功能
	$scope.isShowPackage = 'Y';

	$rootScope.clearServiceOrderData();
	//首页四个按钮是否显示
	$scope.isShowStoreBtn = false; //预约到店true：显示；false：不显示
	$scope.isShowPackageStoreBtn = false; //到店套票true：显示；false：不显示
	$scope.isShowHomeBtn = false; //预约到家true：显示；false：不显示
	$scope.isShowPackageHomeBtn = false; //到家套票true：显示；false：不显示
	$scope.showtotle = 0; //服务下单按钮显示的个数
	$scope.isHometype = $rootScope.SERVICE_HOME_Y; //城市到家
	$scope.isStoretype = $rootScope.SERVICE_STORE_Y; //城市到店

	if($rootScope.appValues && $rootScope.appValues.BUTTON_STORE && $rootScope.appValues.BUTTON_STORE.dic_desc == 'Y') {
		$scope.isShowStoreBtn = true;
		$scope.showtotle++;
	}
	if($rootScope.appValues && $rootScope.appValues.BUTTON_PACKAGE_STORE && $rootScope.appValues.BUTTON_PACKAGE_STORE.dic_desc == 'Y') {
		$scope.isShowPackageStoreBtn = true;
		$scope.showtotle++;
	}
	if($rootScope.appValues && $rootScope.appValues.BUTTON_HOME && $rootScope.appValues.BUTTON_HOME.dic_desc == 'Y') {
		$scope.isShowHomeBtn = true;
		$scope.showtotle++;
	}
	if($rootScope.appValues && $rootScope.appValues.BUTTON_PACKAGE_HOME && $rootScope.appValues.BUTTON_PACKAGE_HOME.dic_desc == 'Y') {
		$scope.isShowPackageHomeBtn = true;
		$scope.showtotle++;
	}

	//o20,o20+电商
	if($rootScope.isShopO2O || $rootScope.isO2O) {
		//首页title
		$scope.titleType = function() {
			if($rootScope.isO2O) {
				return $rootScope.comPanyName;
			} else {
				return '魔多客';
			}
		};
		//预约到家
		var typeService;
		var tipText;
		$scope.toHome = function(type) {
			if(type == 1) { //区分单次多次
				typeService = 'SERVICE_SINGLE';
				tipText = $rootScope.homeText;
			} else if(type == 2) {
				typeService = 'SERVICE_MANY';
				tipText = $rootScope.packageHomeText;
			}
			if($rootScope.selCityInfo.selHome == 'SERVICE_HOME_N') {
				Xalert.loading('当前城市暂时不支持' + tipText + '的业务呦，推荐到店内体验我们的服务呦，或者拨打我们的客服电话' + $rootScope.comPanyTel + '寻求帮助吧！', 1500);
				//				return;
			} else {
				localStorage.setItem("type", typeService);
				localStorage.setItem("from", 'home');
				localStorage.setItem("serviceType", "SERVICE_ONLINE")
				$state.go('store-single-service');
			}
		};
		//预约到店
		$scope.toStore = function(id) {
			if(id == 1) { //区分单次多次
				tipText = $rootScope.storeText;
			} else if(id == 2) {
				tipText = $rootScope.packageStoreText;
			}
			if($rootScope.selCityInfo.selShop == 'SERVICE_STORE_N') {
				Xalert.loading('当前城市暂时不支持' + tipText + '的业务呦，推荐到店内体验我们的服务呦，或者拨打我们的客服电话' + $rootScope.comPanyTel + '寻求帮助吧！', 1500);
				return;
			} else {
				$state.go('store', ({
					isStamp: id
				}));
			}
		};
		SwitchEnterpriseService.initModal($scope);

	}
	//轮播图
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(toState.name == 'tab.home') {
			event.preventDefault();
			$timeout(function() {
				$ionicSlideBoxDelegate.$getByHandle('homeRotateImg').start();
			}, 800);
		}
	});
	//定义轮播图数组
	$scope.rotateImgs = [];

	//轮播图接口
	var loadSlideData = function() {

		var options = {};
		if($rootScope.isShop) { //电商轮播图
			options = {
				data: $scope.items,
				module: 'FM_SHOP_TOP_IMG',
				params: {}
			}
		} else { //020+电商轮播图or020
			options = {
				data: $scope.items,
				module: 'FM_APP_TOP_IMG',
				params: {}
			}
		}
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				$scope.slideimgs = true;
				$scope.rotateImgs = results.results;
				//当图片数量为2时 特殊处理
				if(results.results.length == 2) {
					$scope.rotateImgs[2] = $scope.rotateImgs[0];
					$scope.rotateImgs[3] = $scope.rotateImgs[1];
					$scope.isSpecialCase = true; //特殊情况
				} else {
					$scope.isSpecialCase = false; //非特殊情况
				}
				$ionicSlideBoxDelegate.$getByHandle('homeRotateImg').loop(true);
				$ionicSlideBoxDelegate.$getByHandle('homeRotateImg').update();
			}
			//alert($scope.rotateImgs.length);

		});
	}
	loadSlideData();

	//轮播图滑动监听
	$scope.curIndicator = 0;
	$scope.onPagerChanged = function(index) {
		$scope.curIndicator = index;
	}

	//跳转轮播图详情
	$scope.slideTo = function(item) {
		//轮播图详情
		if(item){
			if(item.top_detail) {
				pageData.set(item);
				$state.go('slide-detail');
			}
		}else{
			item = {
				top_detail:$rootScope.appValues.package_content.dic_desc,
				top_imgpath:"uploads/picture/2017/04/original_14924802448075.jpeg",
				top_spid:"0",
				top_title:"服务套票详情"
			}
			pageData.set(item);
			$state.go('slide-detail');
		}

	};
	/******************电商模式*********************/
	$scope.transrate = 0; //控制标题栏透明度
	$scope.getScrollPosition = function(scrollType) {
		//content上下滑动
		var position = $ionicScrollDelegate.$getByHandle(scrollType).getScrollPosition().top;
		// var position = $ionicScrollDelegate.getScrollPosition().top;//取滑动TOP值
		if(position <= 0) { //标题栏背景颜色完全透明
			$scope.transrate = 0;
		} else if((position > 0) && (position <= 174)) { //标题栏背景颜色透明度随Position增大，从完全透明到不透明
			$scope.transrate = position / 174;
		} else { //标题栏背景颜色完全不透明
			$scope.transrate = 1;
		}
		$scope.$apply();
	}

	$scope.isShowLoadMore = true; //是否显示上拉加载更多（ng-class控制）
	$scope.canLoadMore = true; //是否显示上拉加载更多（ng-if控制）
	var curPage = 1; //当前页
	$scope.itemsList = []; //商品列表
	// if ($rootScope.isShop) {
	//商品列表
	var loadList = function() {
		var options = {
			module: 'FM_SHOP_RECOMMEND_PRODUCT',
			params: {
				page_size: 10,
				current_page: curPage
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				/*数组插入数据*/
				angular.forEach(results.results, function(value, index) {
					$scope.itemsList.push(value);
				});
				/*判断隐藏上拉刷新*/
				if(results.results.length < 10) {
					$scope.canLoadMore = false;
					$scope.isShowLoadMore = false;
				} else {
					$scope.canLoadMore = true;
					$scope.isShowLoadMore = true;
				}
				// setTimeout(function () {
				//     $scope.$broadcast('scroll.infiniteScrollComplete');
				// }, 1000);
			} else {
				$scope.canLoadMore = false;
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
		})
	}
	if($rootScope.isShop) {
		loadList();
	}



	//收藏服务
	$scope.serversCollection = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	};
	//取消收藏服务
	$scope.serversCancelCollection = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	};
	//收藏和取消收藏接口
	function collectionAPI(item,iscollect){
		var API = "";

		if(iscollect == 'N') {
			API = "FM_APP_COLLECT_SERVICE"; //收藏
		}else{
			API = "FM_APP_CANCELCOLLECT_SERVICE"; //取消收藏
		}
		var options = {
			module: API,
			params: {
				itemid: item.itemid,
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				var index = $scope.itemsList[item];

				if(iscollect == 'N') {
					item.iscollection = "Y";
				}else{
					item.iscollection = "N";
				}
				$scope.itemsList[index] = item;

			} else {
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
		});
	}


	//头像url
	$scope.userImg = "";
	var cookies_name = 'login'; //登录cookie名字
	var userInfoData = $cookies.getObject(cookies_name) || {};
	if(userInfoData.user_id && userInfoData.token) {
		$scope.userImg = $rootScope.$_userInfo.user_img;
	}

	//个人头像
	$scope.gotoLogin = function() {
		//是否登录
		if(Authentication.checkLogin(true)) {
			$state.go('my');

		}else{
			$state.go('login');
		}
	}
	//美甲师入口
	$scope.gotoManicuristList = function() {
		$state.go('home-technician');
	}

	var pageoffset = 0;
	/**
	 * 获取热门推荐服务列表
	 */
	function getHotRecommendServiceList() {
		var cityInfo = $rootScope.selCityInfo; //城市编码
		var options = {
			module: 'FM_APP_SERVICE_RECOMMEND',
			params: {
				pageoffset: pageoffset,
				page_size: 10,
				recommend_type: 'RECOMMEND_HOT', //热门推荐
			}
		};
		getInterface.jsonp(options, function(results, params) {

				if(results.status == 'Y') {
					/*数组插入数据*/
					angular.forEach(results.results, function(value) {
						$scope.itemsList.push(value);
					})
					/*判断隐藏上拉刷新*/
					if(results.results.length < 10) {
						$scope.canLoadMore = false;
						$scope.isShowLoadMore = false;
					} else {
						$scope.canLoadMore = true;
						$scope.isShowLoadMore = true;
					}
					pageoffset = $scope.itemsList.length;

				} else {
					$scope.canLoadMore = false;
					Xalert.loading(results.error_msg, 1000);
					return false;
				}
		})
	}
	//获取推荐服务
	getHotRecommendServiceList();

	/*上拉加载*/
	$scope.loadMoreList = function() {
		$scope.isShowLoadMore = true;
		$timeout(function () {
			getHotRecommendServiceList();
			$scope.$broadcast('scroll.infiniteScrollComplete');
		},1000)
	}
	$scope.nearbyStore = {};


	//从cookie获取当前城市code值
	function getCookie(name)
	{          //匹配字段
		var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

		if(arr=document.cookie.match(reg))

			return (arr[2]);
		else
			return null;
	}


	/**
	 * 获取附近店面
	 */
	$rootScope.getRecommendStore = function(coordinate) {

		$rootScope.currentCityCode = getCookie("currentCityCode");

		var cityCode = $rootScope.currentCityCode; //城市编码
		var lng = coordinate.longitude;
		var lat = coordinate.latitude;

		console.log("首页定位成功:");

		//alert(cityCode);

		var options = {
			module: 'FM_APP_STORE_NEARBY',
			params: {
				city_code: cityCode,
				longitude: lng,
				latitude: lat
			}
		};
		getInterface.jsonp(options, function(results, params) {

			if(results.status == 'Y') {
				$scope.nearbyStore = results.results;
				$scope.isShowArrowStoreView = true;
			} else {
				Xalert.loading(results.error_msg, 1000);
				$scope.isShowArrowStoreView = false;
				return false;
			}
		});
	}

	//定位到获取附近店面(首次进入首页在app.js获取)
	if($rootScope.coordinate){
		$rootScope.getRecommendStore($rootScope.coordinate);
		$scope.isShowArrowStoreView = true;

	}else{
		$scope.isShowArrowStoreView = false;
	}

	//点击附近店跳转详情
	$scope.nearbyStoreClick = function() {

		$state.go('store-details',{
			 storeId:$scope.nearbyStore.store_id,
			 store_dis:$scope.nearbyStore.store_dis,
			 Record:3
		});
	}
	//推荐服务跳转详情
	$scope.recommendGoDetail = function(item) {

		localStorage.setItem('from', 'home'); //从哪来
		localStorage.setItem("serviceType", "SERVICE_ONLINE"); //线上
		localStorage.setItem('serviceItem', angular.toJson(item));

		//单次服务详情
		if(item.service_count == 0){
			localStorage.setItem('type', "SERVICE_SINGLE");//单次服务
		}else{
			localStorage.setItem('type', "SERVICE_MANY");
		}
		$state.go('store-service-detail');


	}
	//本月推荐跳转
	$scope.goCurrentRecommendList = function() {
		$state.go('recommend');
	}

	//会员套票跳转
	$scope.goVIPPackageList = function() {
		$state.go('vipPackageList');
	}
	//美甲和美睫跳转
	$scope.goServer = function(type) {

		//传参 类型和跳转入口
		if(type == "meijia"){
			$state.go('tab.service');
		}else{
			$state.go('tab.service');
		}
		localStorage.setItem('serversEntrance', type);


	}

})
//轮播图详情
app.controller('SlideimgCtrl', function($rootScope, $scope, $filter, languages, getInterface, Xalert, $state, pageData, $sce) {

	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.item = pageData.get();
		document.title = $scope.item.top_title;
	})


})
//本月推荐服务列表
app.controller('RecommendCtrl', function($rootScope, $scope, $timeout, $filter, languages, getInterface, Xalert, $state, pageData, $sce, Authentication) {
	document.title = '本月推荐';

	/**
	 * 获取本月推荐服务列表
	 */
	var pageoffset = 0;
	$scope.isShowLoadMore = true; //是否显示上拉加载更多（ng-class控制）
	$scope.canLoadMore = true; //是否显示上拉加载更多（ng-if控制）

	$scope.recommendList = []; //数据必须再方法外层定义

	function getMonthRecommendServiceList() {

		var options = {
			module: 'FM_APP_SERVICE_RECOMMEND',
			params: {
				pageoffset: pageoffset,
				page_size: 10,
				recommend_type: 'RECOMMEND_MONTH', //本月推荐
			}
		};
		getInterface.jsonp(options, function(results, params) {

			if(results.status == 'Y') {
				/*数组插入数据*/
				$scope.recommendList = results.results;

				/*判断隐藏上拉刷新*/
				if (!$scope.recommendList || $scope.recommendList.length == 0 || $scope.recommendList.length % 10 != 0) {
					$scope.isShowLoadMore = false;
				} else {
					$scope.isShowLoadMore = true;
				}

				$scope.recommendList.length == 0 ? $scope.isNoData = true : $scope.isNoData = false;
				$scope.canLoadMore = params.canLoadMore;
				pageoffset = $scope.recommendList.length;

			} else {
				$scope.canLoadMore = false;
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
		});
	}
	getMonthRecommendServiceList();

	//下拉刷新
	$scope.doRefresh = function () {
		pageoffset = 0;
		$timeout(function () {
			$scope.recommendList = [];
			$scope.isNoData = false;
			getMonthRecommendServiceList();
			$scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	}

	/*上拉加载*/
	$scope.loadMoreList = function() {
		$scope.isShowLoadMore = true;

		$timeout(function () {
			getMonthRecommendServiceList();
			$scope.$broadcast('scroll.infiniteScrollComplete');

		},1000)


	}

	//收藏服务
	$scope.serversCollection = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	};
	//取消收藏服务
	$scope.serversCancelCollection = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	};
	//收藏和取消收藏接口
	function collectionAPI(item,iscollect){
		var API = "";

		if(iscollect == 'N') {
			API = "FM_APP_COLLECT_SERVICE"; //收藏
		}else{
			API = "FM_APP_CANCELCOLLECT_SERVICE"; //取消收藏
		}
		var options = {
			module: API,
			params: {
				itemid: item.itemid,
			}
		}
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				var index = $scope.recommendList[item];

				if(iscollect == 'N') {
					item.iscollection = "Y";
				}else{
					item.iscollection = "N";
				}
				$scope.recommendList[index] = item;

			} else {
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
		})
	}

	//推荐服务跳转详情
	$scope.monthRecommendListGoDetail = function(item) {

		localStorage.setItem('from', 'home'); //从哪来
		localStorage.setItem("serviceType", "SERVICE_ONLINE"); //线上
		localStorage.setItem('serviceItem', angular.toJson(item));

		//单次服务详情
		if(item.service_count == 0){
			localStorage.setItem('type', "SERVICE_SINGLE");//单次服务
		}else{
			localStorage.setItem('type', "SERVICE_MANY");
		}
		$state.go('store-service-detail');


	}

})
//会员套票列表
app.controller('vipPackageListCtrl', function($rootScope, $ionicPopup, $scope, $filter, languages, getInterface, Xalert, $state, pageData, $sce, Authentication,$timeout) {
	document.title = 'Fashion ME';
	/**
	 * 获取会员套票列表
	 */
	var pageoffset = 0;
	$scope.isShowLoadMore = true; //是否显示上拉加载更多（ng-class控制）
	$scope.canLoadMore = true; //是否显示上拉加载更多（ng-if控制）
	$scope.isNoData = false; //false：不显示无数据布局；true：显示无数据布局

	$scope.packageList = []; //数据必须再方法外层定义
	$scope.selectedPackageList = []; //已选套票列表
	$scope.itemsType = [
		{
			servicetype_id:"",
		 	servicetype_name:"全部"
		}
	]; //服务分类列表

	$scope.serviceOrderType = "ORDER_SALESVOLUME"; //排序类型: 销量排序(默认) 价格排序(ORDER_PRICE ) 好评排序(ORDER_GOODCOMMENT)
	$scope.serviceOrderMode = "ORDER_DESC"; //排序方式: 正序 倒序(默认)
	$scope.currentClassID = ""; //当前选择的分类id

	//搜索
	var searchText = "";


	//服务分类接口
	function getServiceTypeLoad() {

		var options = {
			module: 'FM_APP_SERVICETYPE_ONE_LEVEL_LIST',
			params: {}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y') {

				$scope.cWidth = {
					width: ((document.documentElement.clientWidth) / 4) / 20.0 + 'rem'
				}
				$scope.DivWith = {
					width: ((document.documentElement.clientWidth) / 4 * results.results.length) + 'rem'
				}
				$scope.itemsType = $scope.itemsType.concat(results.results);

				/*设置选中分类状态*/
				for(var i=0;i<$scope.itemsType.length;i++){
					//默认选中全部
					if(i==0){
						$scope.itemsType[i].selected = true;

					}else{
						$scope.itemsType[i].selected = false;

					}
				}

				serviceload($scope.currentClassID);

			} else {
				Xalert.loading(results.error_msg, 1000);
				return false;
			}

		})
	}
	getServiceTypeLoad();


	//上一个tag索引值
	$scope.currentSortid = undefined;

	//选项卡点击事件 调服务列表接口
	function serviceload(serviceTypeId){

		var typeID = serviceTypeId?serviceTypeId:"";

		var loadData = function () {
			var options = {
				module: 'FM_APP_SERVICE_LIST',
				params: {
					pageoffset: pageoffset,
					page_size: 10,
					type: "SERVICE_MANY",//多次(套票)
					servicetype_id: typeID, //分类id
					service_search: "", //搜索关键字 $scope.searchText.text
					service_ordertype: $scope.serviceOrderType, //排序类型
					service_ordermode: $scope.serviceOrderMode //排序方式 正序 降序
				}
			}
			getInterface.jsonp(options, function (results, params) {
				if (results.status == 'N') {
					Xalert.loading(results.error_msg, 1000);
					$scope.isNoData = true;
					return false;
				} else {
					$scope.packageList = results.results;
					/*设置isNoData值,用于判断是否显示无数据视图*/
					$scope.packageList.length == 0 ? $scope.isNoData = true : $scope.isNoData = false;
					$scope.canLoadMore = params.canLoadMore;
					pageoffset = $scope.packageList.length;

					if (!$scope.packageList || $scope.packageList.length == 0 || $scope.packageList.length % 10 != 0) {
						$scope.isShowLoadMore = false;
					} else {
						$scope.isShowLoadMore = true;
					}
					for (var i = 0; i < $scope.packageList.length; i++) {
						$scope.packageList[i].selected = false;
					}

				}
			})
		}
		loadData();
		// 上拉加载
		$scope.loadMorePackageList = function () {
			$scope.isShowLoadMore = true;
			$timeout(function () {
				loadData();
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}, 1000);
		}
		//下拉刷新
		$scope.doRefresh = function () {
			pageoffset = 0;
			$timeout(function () {
				$scope.packageList = [];
				$scope.isNoData = false;
				loadData();
				$scope.$broadcast('scroll.refreshComplete');
			}, 1000);
		}
	}

	$scope.sortid = 0; //当前选中标签的下标
	$scope.isUp = undefined;  	//价格升序 (默认价格升序)
	$scope.isDown = undefined;  //价格降序
	$scope.saveOdlServiceOrderType = undefined;  //保存之前选择的排序类型,点击分类中的确定取值
	$scope.saveOdlServiceOrderMode = undefined;  //保存之前选择的排序方式,点击分类中的确定取值
	$scope.saveOdlSortid = undefined;  //点分类前保存之前选择的标签索引,点击分类中的确定取值

	//分类标签
	$scope.isShowClassifyView = false; //是否显示分类
	/**
	 * 切换顶部服务标签排序
	 * @param {tag值} sortid
	 */

	$scope.categoryOrder = function(sortid) {

		if(($scope.currentSortid == sortid && sortid == 0) || ($scope.currentSortid == sortid && sortid == 2) ||($scope.currentSortid == sortid && sortid == 3)){
			return;
		}

		$scope.currentSortid = sortid;


		$scope.isShowClassifyView = false;


		pageoffset = 0;

		if(sortid == 0){//销量

			$scope.sortid = sortid;
			$scope.serviceOrderType = 'ORDER_SALESVOLUME';//销量
			$scope.serviceOrderMode = '';
			$scope.isUp = false;
			$scope.isDown = false;

			//获取套票服务列表
			serviceload($scope.currentClassID);
		}
		if(sortid == 1) {

			$scope.sortid = sortid;
			//继续点击价格排序
			if($scope.serviceOrderType == 'ORDER_PRICE'){
				if($scope.isUp) {
					$scope.serviceOrderMode = 'ORDER_DESC'; //倒序 【高-低】

					$scope.isUp = false;
					$scope.isDown = true;

				}else if($scope.isDown){
					$scope.serviceOrderMode = 'ORDER_ASC'; //正序 [低-高]

					$scope.isUp = true;
					$scope.isDown = false;
				}

			//切换价格排序
			}else{
				$scope.serviceOrderMode = 'ORDER_ASC'; //正序 [低-高]
				$scope.isUp = true;
				$scope.isDown = false;
			}
			$scope.serviceOrderType = 'ORDER_PRICE';//价格

			//获取套票服务列表
			serviceload($scope.currentClassID);

		} else if(sortid == 2) { //好评率
			$scope.sortid = sortid;
			$scope.serviceOrderType = 'ORDER_GOODCOMMENT';
			$scope.orderPriceMode = '';
			$scope.isUp = false;
			$scope.isDown = false;

			//获取套票服务列表
			serviceload($scope.currentClassID);

		}else if(sortid == 3){

			//先保存
			$scope.saveOdlServiceOrderType = $scope.serviceOrderType;
			$scope.saveOdlServiceOrderMode = $scope.orderPriceMode;
			$scope.saveOdlSortid =  $scope.sortid;
			$scope.sortid = sortid;

			$scope.serviceOrderType = '';
			$scope.orderPriceMode = '';
			$scope.isUp = false;
			$scope.isDown = false;
			$scope.isShowClassifyView = !$scope.isShowClassifyView;

		}

	}

	$scope.saveCurrentClassID = ""; //保存当前分类id,点取消后取值

	//分类-item项
	$scope.proTypeItem = function(servicetype_id, name) {


		if(name == '全部') {
			$scope.currentClassID = '';
		} else {
			$scope.currentClassID = servicetype_id;

		}

	}
	//分类 点取消
	$scope.cancelClick = function(){
		$scope.isShowClassifyView = false;

		//恢复上一次的分类
		$scope.currentClassID = $scope.saveCurrentClassID;

		//先取值
		$scope.serviceOrderType = $scope.saveOdlServiceOrderType;
		$scope.orderPriceMode = $scope.saveOdlServiceOrderMode;
		$scope.sortid = $scope.saveOdlSortid;

		if($scope.sortid == 1){

			if($scope.orderPriceMode == "ORDER_DESC"){
				$scope.isUp = true;
				$scope.isDown = false;
			}else{
				$scope.isUp = false;
				$scope.isDown = true;
			}
		}
		//$scope.currentSortid = $scope.sortid;
		$scope.categoryOrder($scope.sortid);

	}

	//分类 点确定
	$scope.cancelConfirm = function(){
		$scope.isShowClassifyView = false;

		//先取值
		$scope.serviceOrderType = $scope.saveOdlServiceOrderType;
		$scope.orderPriceMode = $scope.saveOdlServiceOrderMode;
		$scope.sortid = $scope.saveOdlSortid;

		if($scope.sortid == 1){
			if($scope.orderPriceMode == "ORDER_DESC"){
				$scope.isUp = true;
				$scope.isDown = false;
			}else{
				$scope.isUp = false;
				$scope.isDown = true;
			}
		}
		//保存分类id
		$scope.saveCurrentClassID = $scope.currentClassID;

		$scope.categoryOrder($scope.sortid);

	}
	// 	加入/取消  购买
	$scope.totalAmount = 0; //总价格

	$scope.joinCar = function($event, item) {
		$event.stopPropagation();

		localStorage.setItem('from', "home");
		localStorage.setItem('type', "SERVICE_MANY"); //多次
		localStorage.setItem('serviceType', "SERVICE_ONLINE");

		//加入购买
		if(item.selected == false) {

			$scope.totalAmount += parseInt(item.nowprice);
			$scope.selectedPackageList.push(item);
			var data = {
				selectedData: $scope.selectedPackageList
			}
			localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));

		//移除购买
		} else {
			$scope.totalAmount -= parseInt(item.nowprice);

			for(var i = 0; i < $scope.selectedPackageList.length; i++) {
				if(item.itemid == $scope.selectedPackageList[i].itemid) {
					$scope.selectedPackageList.splice(i, 1);
				}
			}
			var data = {
				selectedData: $scope.selectedPackageList
			}
			localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));
		}


		//刷新界面
		item.selected = !item.selected;
		var index = $scope.packageList[item];
		$scope.packageList[index] = item;


	}

	//收藏服务
	$scope.serversCollection = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	};
	//取消收藏服务
	$scope.serversCancelCollection = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	};
	//收藏和取消收藏接口
	function collectionAPI(item,iscollect){
		var API = "";

		if(iscollect == 'N') {
			API = "FM_APP_COLLECT_SERVICE"; //收藏
		}else{
			API = "FM_APP_CANCELCOLLECT_SERVICE"; //取消收藏
		}
		var options = {
			module: API,
			params: {
				itemid: item.itemid,
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				var index = $scope.packageList[item];

				if(iscollect == 'N') {
					item.iscollection = "Y";
				}else{
					item.iscollection = "N";
				}
				$scope.packageList[index] = item;

			} else {
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
		});
	}
	//去结算
	$scope.goNext = function(){

		//是否登录
		if(!Authentication.checkLogin(true)) {
			return false;
		}

		if($scope.selectedPackageList.length > 0) {
			//所选服务id 逗号隔开
			var serviceid = '';
			var time = 0;
			for(var i = 0; i < $scope.selectedPackageList.length; i++) {
				if(i == 0) {
					serviceid = $scope.selectedPackageList[i].itemid;
				} else {
					serviceid = serviceid + ',' + $scope.selectedPackageList[i].itemid;
				}

				time += parseInt($scope.selectedPackageList[i].iusetime);
			}
			var servicedata = {
				time: time, //服务时长
				aprice: $scope.totalAmount, //服务价格
				selectedData: $scope.selectedPackageList, //服务集合
				itemid: serviceid
			}
			localStorage.setItem('singleServiceSelectData', angular.toJson(servicedata)); //服务所选数据
			var data = {
				from: 3
			}
			localStorage.setItem("type", "SERVICE_MANY");
			localStorage.setItem("from", 'home');
			localStorage.setItem("serviceType", "SERVICE_ONLINE")
			$state.go('submit-order', {
				data: angular.toJson(data)
			});
		} else {
			Xalert.loading('请选择您需购买的' + $rootScope.packageStoreText + '!', 1000);
		}
	}

	//搜索
	$scope.searchBtnClick = function($event) {
		$event.stopPropagation();
		pageoffset = 0;

		var e = $event || window.event;
		//if(e.keyCode == 13) {
			searchText = $scope.searchText.text;
			$scope.packageList = [];//清空数据
			serviceload($scope.currentClassID);
		//}
	}

	//推荐服务跳转详情
	$scope.packageListGoDetail = function(item) {

		localStorage.setItem('from', 'home'); //从哪来
		localStorage.setItem("serviceType", "SERVICE_ONLINE"); //线上
		localStorage.setItem('serviceItem', angular.toJson(item));

		//单次服务详情
		if(item.service_count == 0){
			localStorage.setItem('type', "SERVICE_SINGLE");//单次服务
		}else{
			localStorage.setItem('type', "SERVICE_MANY");
		}
		$state.go('store-service-detail');


	}

})