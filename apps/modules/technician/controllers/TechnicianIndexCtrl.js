'use strict';
/*
 author tzb
 */
//tab到家技师列表
app.controller('TechnicianIndexCtrl', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $ionicScrollDelegate, SwitchShopService, technicianChange, pageData2) {
	//选择地址
	$scope.selectAddress = function() {
		$state.go('my-addrecss', {
			my: '',
			form: 'tab-technician'
		});
	}
	$scope.unShow = true; //最早可预约时间
	if($rootScope.selCityInfo)
		var cityCode = $rootScope.selCityInfo.cityCode; // 城市code
	//基本信息
	$scope.orderInfo = {
		serAddress: '',
		detailaddres: ''
	};
	if($rootScope.curraddress) {
		$scope.orderInfo.serAddress = $rootScope.curraddress;
	};
	//定位成功处理
	var lng;
	var lat;
	if($rootScope.coordinate) {
		lng = $rootScope.coordinate.longitude;
		lat = $rootScope.coordinate.latitude;
	}
	//定位信息end
	$scope.searchText = {
		text: ''
	};
	//搜索框内容
	$scope.current = -1;
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

	$scope.failImg = false; //无数据图

	$scope.tabOnclick = function(type) {
		alert(type);
	}
	//	选项卡点击事件
	$scope.tab = function(type) {

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
		$scope.page = 1;
		var loadData = function() {
			var options = {
				page: $scope.page,
				data: $scope.items,
				canLoadMore: false,
				module: 'FM_APP_STORE_BEAUTICIAN_LIST', //到家技师列表
				params: {
					page_size: 12,
					pageoffset:1,
					store_id:"c10caf1c_b56b_561a_6a11_bc425374425f",
					service_ordertype: ordertype,
					store_type:"STORE_TYPE_SINGLE",
				}
			};
			getInterface.jsonp(options, function(results, params) {
				if(results.status == 'N') {
					//					Xalert.loading(results.error_msg, 1000);
					$scope.failImg = true; //无数据图
					return false;
				} else {

					$scope.items = params.data;
					if($scope.items == '') {
						$scope.failImg = true; //无数据图
					} else {
						$scope.failImg = false; //无数据图
					}
					$scope.page = params.page;
					$scope.canLoadMoreGoodsList = params.canLoadMore;
					var result = results.results;
					if(!result || result.length == 0 || result.length % 10 != 0) {
						$scope.isShowLoadMore = false;
					} else {
						$scope.isShowLoadMore = true;
					}
					$ionicScrollDelegate.$getByHandle('contentReload').resize();
					$ionicScrollDelegate.scrollTop();
					//					if($scope.canLoadMoreGoodsList == false) {
					//						$scope.isShowLoadMore = false;
					//					}
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
				//				$scope.tab($scope.current);
				loadData();
				setTimeout(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}, 1000);
			}, 1000);
		};
		//下拉刷新
		$scope.doRefresh = function() {
			$scope.page = 1;
			$timeout(function() {
				$scope.items = [];
				loadData();
				$scope.$broadcast('scroll.refreshComplete');
			}, 500);
		};
	}
	$scope.tab(0)
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
	//跳转店面列表
	$scope.goStoreList = function() {
		$state.go('store', { isStamp: 1 });
	}
	//技师列表搜索
	$scope.search = function(event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e.keyCode == 13) {
			if($scope.searchText.text) {
				//$scope.tab(0);
				$scope.doRefresh();
			} else {
				Xalert.loading('亲，请输入要搜索的内容');
			}

		}
	};
	//技师详情
	$scope.goDetail = function(itemid, item) {

		var data = {
			my_beaticain: item
		}
		localStorage.setItem('selectTechnician', angular.toJson(data));
		var adressData = { //地址数据
			address: $scope.orderInfo.serAddress,
			addressinfo: $scope.orderInfo.detailaddres,
			longitude: lng,
			latitude: lat,
			code: cityCode
		}
		localStorage.setItem('selectedAddress', angular.toJson(adressData)); //地址数据
		localStorage.setItem('serviceItem', angular.toJson(item));
		localStorage.setItem('from', 'technician');
		$state.go('beautician-detail', {
			id: itemid,
		});
	}
	//服务收藏
	$scope.goodsCollection = function(item, $event) {
		$event.stopPropagation();
		technicianChange.collection(item.beauticianid, function(results) {
			if(results.status == 'Y') {
				if(item.iscollection == 'N') {
					item.iscollection = 'Y';
					return;
				} else {
					Xalert.loading('亲，您已经收藏');
					return;
				}
			}
		});
	};
	/*跳转监听*/
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(fromState.name != 'my-addrecss' && fromState.name != 'beautician-detail' && toState.name == 'tab.technician') {
			localStorage.clear();
		} else {
			if(fromState.name == 'my-addrecss') {
				event.preventDefault();
				var selectedAddress = localStorage.getItem('selectedAddress'); //地址数据
				if(selectedAddress) {
					selectedAddress = angular.fromJson(selectedAddress);//地址对象
					$scope.orderInfo.serAddress = selectedAddress.address; //地址
					$scope.orderInfo.detailaddres = selectedAddress.addressinfo; //详细地址
					lng = selectedAddress.longitude;
					lat = selectedAddress.latitude;
					cityCode = selectedAddress.code;
					$scope.doRefresh();
				}
			} else if(fromState.name == 'beautician-detail') {
				localStorage.removeItem('from');
				localStorage.removeItem('serviceType')
				localStorage.removeItem('serviceItem')
				localStorage.removeItem('selectTime')
				localStorage.removeItem('selectTechnician')
				localStorage.removeItem('selectServieData')
				localStorage.removeItem('needtime')
				localStorage.removeItem('from')
				localStorage.removeItem('Record')
				localStorage.removeItem('singleServiceSelectData')
				localStorage.removeItem('singleServiceSelectDataCopy')
				localStorage.removeItem('timeData')
				localStorage.removeItem('type')
				if(localStorage.getItem('selectedAddress')) {
					selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress'));
					$scope.orderInfo.serAddress = selectedAddress.address;
					$scope.orderInfo.detailaddres = selectedAddress.addressinfo;
				}
			}
		}

		//服务取消收藏
		$scope.goodsCollectionDel = function(item, $event) {
			$event.stopPropagation();
			technicianChange.uncollection(item.beauticianid, function(results) {
				if(results.status == 'Y') {
					if(item.iscollection == 'Y') {
						item.iscollection = 'N';
						return;
					} else {
						Xalert.loading('亲，您已经收藏');
						return;
					}
				}
			});
		};

	});

});