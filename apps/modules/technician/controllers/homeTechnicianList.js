//到家技师列表
//auth: tzb
app.controller('HomeTechnicianListCtrl', function($rootScope, $scope, $filter, $state, $stateParams, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $ionicScrollDelegate, SwitchShopService, technicianChange) {
	$scope.searchText = {
		text: ''
	}; //搜索框内容
	$scope.current = -1; //标签默认值
	var data = angular.fromJson($stateParams.data);
	var form = data.form; // 来自哪个页面
	var storId = data.store_id;
	var storType = data.store_type; //套票类型
	if($rootScope.selCityInfo)
		var cityCode = $rootScope.selCityInfo.cityCode; // 城市code
	//定位成功处理
	var lng;
	var lat;
	var starttime = ''; //开始时间
	var selectedTime = ''; //选择的时间
	var selectedData = ''; //选择的服务
	var item_id = ''; //服务id
	if($rootScope.coordinate) {
		lng = $rootScope.coordinate.longitude;
		lat = $rootScope.coordinate.latitude;
	}

	$scope.noData = false; //无数据
	if(localStorage.getItem('selectedAddress'))
		var selectedAdress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
	if(selectedAdress) {
		cityCode = selectedAdress.code; //城市code
		lng = selectedAdress.longitude; //经度
		lat = selectedAdress.latitude; //纬度
	}
	//是否显示最早可预约时间
	$scope.unShow = true;
	if(form == 'store' || storType == 'ORDER_OFFLINE_ONLINE') {
		$scope.unShow = false;
	}
	if(localStorage.getItem('timeData')) {
		selectedTime = angular.fromJson(localStorage.getItem('timeData')); //选择的时间对象
		starttime = selectedTime.starttime; //起始时间
	}
	if(localStorage.getItem('singleServiceSelectData')) {
		selectedData = angular.fromJson(localStorage.getItem('singleServiceSelectData')); //所选服务数据
		item_id = selectedData.itemid; //所选服务的id集合
		if(item_id == 'Undefined' || !item_id) item_id = '';
	} else if(localStorage.getItem('stampItem')) {
		stampItem = angular.fromJson(localStorage.getItem('stampItem')); //所选服务数据
		item_id = stampItem.packageid; //套票id
	}
	//	标签
	$scope.techniciantitles = [{
		"title": "距离最近",
		"number": 0
	}, {
		"title": "收藏最多",
		"number": 1
	}, {
		"title": "综合排序",
		"number": 2
	}]

	//	选项卡点击事件
	$scope.isShowLoadMore = false;

	$scope.tab= function(type) {

		$ionicScrollDelegate.scrollTop();
		if(type == $scope.current) {
			return;
		}
		$scope.current = type;


		if($scope.current == 0) {
			var ordertype = 'ORDER_POSITION'
		} else if($scope.current == 1) {
			var ordertype = 'ORDER_COMMENT'
		} else if($scope.current == 2) {
			var ordertype = 'ORDER_COLLECTION'
		}
		$scope.items = [];
		$scope.pageoffset = 0;
		var loadData = function() {
			var module = ''; //服务标识
			var params = ''; //传参

			if(form == 'store' || storType == 'ORDER_OFFLINE_ONLINE') {
				module = 'FM_APP_STORE_BEAUTICIAN_LIST'; //到店
				params = {
					pageoffset: $scope.pageoffset,
					page_size: 12,
					service_ordertype: ordertype,
					service_search: $scope.searchText.text,
					starttime: starttime,
					store_id: storId,
					store_type: 'STORE_TYPE_SINGLE',
					item_id: item_id
				};
			} else {
				module = 'FM_APP_VISIT_BEAUTICIAN_LIST'; //到家技师列表
				params = {
					pageoffset: $scope.pageoffset,
					page_size: 12,
					city_code: cityCode, //待修改
					useradd_longitude: lng,
					useradd_latitude: lat,
					service_ordertype: ordertype,
					service_search: $scope.searchText.text,
					starttime: starttime,
					item_id: item_id
				};
			}
			var options = {
				pageoffset: $scope.pageoffset,
				data: $scope.items,
				canLoadMore: false,
				module: module, //到家技师列表
				params: params

			};
			if(starttime && starttime != undefined) {
				options.params.starttime = starttime;
			}
			getInterface.jsonp(options, function(results, params) {
				if(results.status == 'N') {
					Xalert.loading(results.error_msg, 1000);
					return false;
				} else {
					$scope.items = params.data;
					$scope.pageoffset = params.pageoffset;
					$scope.canLoadMoreGoodsList = params.canLoadMore;
					var result = results.results;
					$scope.items.length == 0 ? $scope.noData = true : $scope.noData = false;
					if(!result || result.length == 0 || result.length % 10 != 0) {
						$scope.isShowLoadMore = false;
					} else {
						$scope.isShowLoadMore = true;
					}
				}
			});
		}
		loadData();

		//上拉加载
		$scope.loadMoreGoodsList = function() {
			if($scope.isShowLoadMore == false) {
				$scope.canLoadMoreGoodsList = false;
				return;
			}
			$scope.isShowLoadMore = true;
			setTimeout(function() {
				$scope.canLoadMoreGoodsList = false;
				loadData();
				setTimeout(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}, 1000);
			}, 1000);
		}
		//下拉刷新
		$scope.doRefresh = function() {
			$scope.pageoffset = $scope.items.length;
			$timeout(function() {
				$scope.items = [];
				loadData();
				$scope.$broadcast('scroll.refreshComplete');
			}, 500);
		}
	}
	//返回
	$scope.backnow = function() {
		localStorage.setItem('selected', false);
		history.go(-1)
	}
	$scope.tab(0);
	//	搜索开关
	$scope.switchTitle = true;
	$scope.openSearch = function() {
		$scope.switchTitle = false;
	}
	$scope.closeSearch = function() {
		$scope.switchTitle = true;
	}
	//切换店面
	SwitchShopService.initModal($scope);
	//选择地址
	$scope.selectAddress = function() {
		$state.go('my-addrecss', { my: '', form: 'tab-technician' });
	}
	//技师列表搜索
	$scope.search = function(event) {
		//var e = event || window.event || arguments.callee.caller.arguments[0];
		//if(e.keyCode == 13) {
		//	if($scope.searchText.text) {
				$scope.doRefresh();
			//} else {
			//	Xalert.loading('亲，请输入要搜索的内容');
			//}

		//}
	}
	//选择美甲师
	$scope.selectManicurist = function(itemid, item){
		console.log(JSON.stringify(item));
		var techdata = {
			my_beaticain: item
		}
		localStorage.setItem('selectTechnician', angular.toJson(techdata));
		if(form == 'confirmOrder')
			form = 'home';
		localStorage.setItem('from', form);

		//跳回
		localStorage.setItem('selected', true);
		history.go(-1)

	}
	//技师详情跳转
	$scope.goDetail = function(itemid, item) {
		var techdata = {
			my_beaticain: item
		}
		localStorage.setItem('selectTechnician', angular.toJson(techdata));
		$state.go('beautician-detail', {
			id: itemid,
			data: angular.toJson(data)
		});
	}

	//收藏技师
	$scope.technicianCollection = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	};
	//取消收藏技师
	$scope.technicianCollectionCancel = function($event,item,iscollect) {
		$event.stopPropagation();

		//是否登录
		if(Authentication.checkLogin(true)) {
			collectionAPI(item,iscollect);

		}else{
			$state.go('login');
		}

	}
	//收藏和取消收藏接口
	function collectionAPI(item,iscollect){
		var API = "";

		if(iscollect == 'N') {
			API = "FM_APP_COLLECT_BEAUTICIAN"; //收藏
		}else{
			API = "FM_APP_CANCELCOLLECT_BEAUTICIAN"; //取消收藏
		}
		var options = {
			module: API,
			params: {
				beautician_id: item.beauticianid
			}
		}
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				var index = $scope.items[item];

				if(iscollect == 'N') {
					item.iscollection = "Y";
				}else{
					item.iscollection = "N";
				}
				$scope.items[index] = item;

			} else {
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
		})
	}
	//跳转监听
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(toState.name == 'home-technician' && fromState.name != 'beautician-detail') {
			var record = localStorage.getItem('Record');
			localStorage.setItem('Record', parseInt(record) + 1);
		}
		if(fromState.name == 'home-technician' && toState.name != 'beautician-detail') {
			var record = localStorage.getItem('Record');
			localStorage.setItem('Record', parseInt(record) - 1);
		}
	});
});