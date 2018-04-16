'use strict';
/*
 * author wuhao
 * 预约到店主控制器
 */
app.controller('choseStoreCtrl', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $stateParams, $ionicScrollDelegate) {
	
	$scope.selectStore = function(item){
		localStorage.setItem('selectStore',angular.toJson(item));
		localStorage.setItem('selectStoreType',true);
		history.go(-1);
	}

	$scope.searchTxt = {
		"text": ''
	};
	$scope.isStamp = $stateParams.isStamp; //2是套票
	$scope.storeType = 'ORDER_POSITION'; //排序类型
	$scope.items = []; //列表内容
	$scope.current_page = 1; //第几页数据
	$scope.noData = false; //是否显示无数据
	$scope.isShowLoadMore = false; //是否显示上拉加载
	var isLoadingList = false; //判断列表是否正在获取数据
	var isCollect = false; //判断是否正在访问收藏接口
	var cityInfo = $rootScope.selCityInfo; //城市编码
	var coordinate = $rootScope.coordinate; //定位信息

	var searchText = ""; //搜索文本
	$scope.latitude = coordinate ? coordinate.latitude : ''; //定位纬度
	$scope.longitude = coordinate ? coordinate.longitude : ''; //定位经度
	getData(false, false, false, $scope.current_page); //获取数据
	localStorage.setItem("Record", 2); //记录页面个数
	/**
	 *获取店面列表数据 
	 * @param {调用成功后是否是添加数据} isAddData
	 * @param {调用失败后是否需要清空数据} isEmptyData
	 * @param {是否是下拉刷新} isRefresh
	 * @param {加载的页数} current_page
	 */
	function getData(isAddData, isEmptyData, isRefresh, current_page) {
		var options = {
			//data: $scope.items,
			//canLoadMore: false,
			module: 'FM_APP_STORE_LIST',
			params: {
				city_code: cityInfo.cityCode, //城市code
				page_size: 10, //页大小
//				current_page: current_page, //访问页
				pageoffset:$scope.items.length,
				service_search: searchText, //检索内容
				service_ordertype: $scope.storeType, //排序类型
				longitude: $scope.longitude, //经度
				latitude: $scope.latitude //纬度
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(isRefresh)
				$scope.$broadcast('scroll.refreshComplete');
			if(results.status == 'Y') { //接口访问成功
				var result = results.results;
				//设置数据
				if(result && result.length > 0) { //有数据
					if(isAddData) { //添加数据
						$scope.items = $scope.items.concat(result);
					} else { //刷新数据
						$scope.items = result;
					}
				} else if(!isAddData) {
					$scope.items = [];
				}
				//判断是否显示上拉加载
				if(!result || result.length == 0 || result.length % 10 != 0) {
					$scope.isShowLoadMore = false;
				} else {
					$scope.isShowLoadMore = true;
				}
				$scope.current_page = current_page;
				var view = $ionicScrollDelegate.$getByHandle('scrollContent');
				view.resize();
				if(!isAddData) view.scrollTop(true);
			} else { //接口访问失败
				if(isEmptyData) {
					$scope.items = [];
					var view = $ionicScrollDelegate.$getByHandle('scrollContent');
					view.resize();
					view.scrollTop(true);
					$scope.isShowLoadMore = false;
				}
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
			//判断是否显示空数据提示
			if($scope.items && $scope.items.length > 0) {
				$scope.noData = false;
			} else {
				$scope.noData = true;
			}
			isLoadingList = false;
		});
	}
	//返回按钮
	$scope.goback = function() {
		history.go(-1);
	};
	//下拉刷新
	$scope.stroeDoRefresh = function() {
		$scope.items=[];//清空数据
		//判断是否正在访问接口
		if(isLoadingList)
			return;
		isLoadingList = true;
		getData(false, false, true, 1); //获取数据
	};
	//上拉加载
	$scope.loadMoreGoodsList = function() {
		//判断是否正在访问接口
		if(isLoadingList)
			return;
		isLoadingList = true;
		getData(true, false, false, $scope.current_page + 1); //获取数据
	};
	//切换排序类型
	$scope.selStoreType = function(storeType) {
		//判断是否正在访问接口
		if(isLoadingList)
			return;
		isLoadingList = true;
		if($scope.storeType == storeType)
			return;
		$scope.storeType = storeType;
		$scope.items = [];//清空数据
		getData(false, true, false, 1);
	};
	//搜索
	$scope.search = function(event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e.keyCode == 13) {
			//判断是否正在访问接口
			if(isLoadingList)
				return;
			isLoadingList = true;
			searchText = $scope.searchTxt.text;
			$scope.items = [];
			getData(false, true, false, 1);

		}
	};
	//收藏
	$scope.collectClick = function($event, item) {
		$event.stopPropagation();
		//登录超时
		if(!Authentication.checkLogin(true)) {
			return false;
		}
		//判断是否正在访问接口
		if(isCollect) return;
		isCollect = true;

		var loadData = function() {
			var options = {
				module: item.iscollection == "Y" ? 'FM_APP_CANCELCOLLECT_STORE' : 'FM_APP_COLLECT_STORE',
				params: {
					store_id: item.store_id //店面id
				}
			};
			getInterface.jsonp(options, function(results, params) {
				if(results.status == 'Y') {
					item.iscollection = item.iscollection == "Y" ? "N" : "Y";
				} else {
					if(results.error_msg)
						Xalert.loading(results.error_msg, 1000);
				}
				isCollect = false;
			});
		}
		loadData();
	}

	//查看地图
	$scope.goMap = function() {
		if($scope.items.length == 0) return;
		localStorage.storelist = angular.toJson($scope.items);
		$state.go('store-map', ({
			type: $scope.storeType,
			isStamp: $scope.isStamp,
			isFromList: 'list'
		}));
	};
	//进详情
	$scope.goDetail = function(storeInfo) {
		if($scope.isStamp == 1) { //预约到店店面详情
			$state.go('store-details', ({
				storeId: storeInfo.store_id,
				store_dis: storeInfo.store_dis,
				Record: 3
			}));
		} else if($scope.isStamp == 2) { //店面套票详情
			$state.go('store-stamps', ({
				storeId: storeInfo.store_id,
				store_dis: storeInfo.store_dis,
				Record: 3
			}));
		}

	};
});



