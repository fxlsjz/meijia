'use strict';
/**
 * 地图
 * wuhao
 */
app.controller('storeMapCtrl', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $stateParams) {

	$scope.isStamp = $stateParams.isStamp; //1是单次  2是套票
	$scope.storeType = $stateParams.type; //店面排序类型
	$scope.isFromList = $stateParams.isFromList == 'list' ? false : true; //false列表进入 true详情进入
	if(!$scope.isFromList)
		localStorage.setItem("Record", 3); //记录页面个数
	$scope.locationInfoList = JSON.parse(localStorage.getItem("storelist")); //店面列表
	$scope.index = 0; //当前显示的页数
	var cityInfo = $rootScope.selCityInfo; //城市编码
	var coordinate = $cookies.getObject('coordinate');
	$scope.latitude = coordinate ? $rootScope.coordinate.latitude : ''; //定位纬度
	$scope.longitude = coordinate ? $rootScope.coordinate.longitude : ''; //定位经度
	//搜索
	$scope.searchTxt = {
		"text": ''
	};
	//初始化地图
	$scope.map = new BMap.Map("container");
	// 编写自定义函数,创建标注
	$scope.myIcon = new BMap.Icon("http://mdk.moxueyuan.net/appwechat/apps/images/store/map_flag_view.png", new BMap.Size(30, 35)); //图片大小
	if($scope.locationInfoList != null && $scope.locationInfoList.length > 0) {
		//显示中心点
		setZoom($scope.locationInfoList[0].useradd_longitude, $scope.locationInfoList[0].useradd_latitude);
		//添加覆盖物
		addEventLis();
	};

	//退出当前页面
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(toState.name == 'store')
			localStorage.removeItem("storelist"); //离开页面删除店面列表缓存
	});
	//返回按钮
	$scope.goMapBack = function() {
		history.go(-1);
	};
	//右上角返回列表页
	$scope.daohang = function() {
		history.go(-1);
	};
	//进详情
	$scope.goDetail = function(storeInfo, $event) {
		$event.stopPropagation();
		if($scope.isFromList) {
			history.go(-1);
			return;
		}
		if($scope.isStamp == 1) { //预约到店店面详情
			$state.go('store-details', ({
				storeId: storeInfo.store_id,
				store_dis: storeInfo.store_dis,
				Record: 4
			}));
		} else if($scope.isStamp == 2) { //店面套票详情
			$state.go('store-stamps', ({
				storeId: storeInfo.store_id,
				store_dis: storeInfo.store_dis,
				Record: 4
			}));
		}

	};
	//设置中心店
	function setZoom(longitude, latitude) {
		//显示中心点
		var point = new BMap.Point(longitude, latitude);
		$scope.map.centerAndZoom(point, 14);
	}
	//添加覆盖物
	function addEventLis() {
		for(var i = 0; i < $scope.locationInfoList.length; i++) {
			var point = new BMap.Point($scope.locationInfoList[i].useradd_longitude, $scope.locationInfoList[i].useradd_latitude);
			var marker = new BMap.Marker(point, {
				icon: $scope.myIcon
			});
			$scope.map.addOverlay(marker);
			marker.addEventListener("click", addEven);
		}
	}

	//覆盖物点击监听
	function addEven(e) {
		var p = e.target;
		for(var i = 0; i < $scope.locationInfoList.length; i++) {
			if(p.getPosition().lng == $scope.locationInfoList[i].useradd_longitude && p.getPosition().lat == $scope.locationInfoList[i].useradd_latitude) {
				$scope.index = i;
				$ionicSlideBoxDelegate.slide(i); //滑动块跳转到第一个
			}
		}

	}

	//滑动下一页
	$scope.nextStore = function() {
		$scope.index = $ionicSlideBoxDelegate.currentIndex();
		setZoom($scope.locationInfoList[$scope.index].useradd_longitude, $scope.locationInfoList[$scope.index].useradd_latitude);
	};
	//软键盘监听
	$scope.search = function(event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e.keyCode == 13) {
			if($scope.searchTxt.text) {
				getData();
			} else {
				Xalert.loading('亲，请输入要搜索的内容');
			}
		}
	};
	//获取数据
	function getData() {
		var options = {
			//data: $scope.items,
			//canLoadMore: false,
			module: 'FM_APP_STORE_LIST',
			params: {
				city_code: cityInfo.cityCode, //城市code
				page_size: 1000000, //页大小
				current_page: 1, //访问页
				service_search: $scope.searchTxt.text, //检索内容
				service_ordertype: $scope.storeType, //排序类型
				longitude: $scope.longitude, //经度
				latitude: $scope.latitude //纬度
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y') {
				$scope.locationInfoList = results.results;
				$scope.map.clearOverlays(); //清除覆盖物
				$scope.index = 0;
				if($scope.locationInfoList != null && $scope.locationInfoList.length > 0) {
					$ionicSlideBoxDelegate.update(); //更新滑动块
					$ionicSlideBoxDelegate.slide(0); //滑动块跳转到第一个
					addEventLis(); //添加覆盖物
					setZoom($scope.locationInfoList[$scope.index].useradd_longitude, $scope.locationInfoList[$scope.index].useradd_latitude);
				}
			} else {
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
		});
	}
});