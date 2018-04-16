/**
 * 到店双人技师列表
 * wuhao
 */
app.controller('ShopTwoTechnicianListCtrl', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $ionicScrollDelegate, SwitchShopService, technicianChange, $stateParams) {
	$scope.searchText = {
		text: ''
	}; //搜索框内容
	var singleServiceSelectData = localStorage.getItem("singleServiceSelectData"); //已选择的服务数据
	var timeData = localStorage.getItem("timeData"); //已选择的时间
	var store_id = $stateParams.store_id; //店面id
	var store_type = $stateParams.store_type; //房间类型
	var service_search = "" //需要搜索的内容
	var isLoadingList = false; //判断列表是否正在获取数据
	var isCollect = false; //判断是否正在访问收藏接口
	var isGiveMe = localStorage.getItem("isGiveMe"); //给我选给他选
	var service_ordertype = localStorage.getItem("service_ordertype"); //已选择的排序分类
	var myTechnician = localStorage.getItem("myTechnician"); //已选择的技师
	var herTechnician = localStorage.getItem("herTechnician"); //已选择的技师

	$scope.isGiveMe = isGiveMe == 'false' ? false : true; //是否是给我选
	$scope.service_ordertype = service_ordertype ? service_ordertype : 'ORDER_COMMENT'; // 排序类型ORDER_COMPLEX 综合排序 ORDER_COMMENT评价最高ORDER_COLLECTION 收藏最多
	//已选择的服务
	$scope.singleServiceSelectData = singleServiceSelectData ? angular.fromJson(singleServiceSelectData) : undefined;
	$scope.timeData = timeData ? angular.fromJson(timeData) : undefined; //选择的时间
	$scope.items = []; //技师列表
	$scope.myTechnician = myTechnician ? angular.fromJson(myTechnician) : undefined; //给我选技师
	$scope.herTechnician = herTechnician ? angular.fromJson(herTechnician) : undefined; //给他选技师
	$scope.isShowNoData = false; //是否显示无数据
	$scope.isShowLoadMore = false; //是否显示上拉加载

	getTechnicianList(false, false, false, 0);
	/**
	 * 返回按钮
	 */
	$scope.goBack = function() {
		localStorage.removeItem('isGiveMe');
		localStorage.removeItem('service_ordertype');
		localStorage.removeItem('myTechnician');
		localStorage.removeItem('herTechnician');
		window.history.go(-1);
	};
	//切换给他选给我选
	$scope.cutMyAndHer = function(isGiveMe) {
		if(isGiveMe == $scope.isGiveMe) return;
		if(isLoadingList) return;
		isLoadingList = true;
		$scope.isGiveMe = !$scope.isGiveMe;
		localStorage.setItem("isGiveMe", $scope.isGiveMe);
		getTechnicianList(false, true, false, 0);

	};
	//切换排序类型
	$scope.cutType = function(type) {
		if(type == $scope.service_ordertype) return;
		if(isLoadingList) return;
		isLoadingList = true;
		$scope.service_ordertype = type;
		localStorage.setItem("service_ordertype", $scope.service_ordertype);
		getTechnicianList(false, true, false, 0);
	};
	//下拉刷新
	$scope.stroeDoRefresh = function() {
		if(isLoadingList) return;
		isLoadingList = true;
		getTechnicianList(false, true, true, 0);
	};
	$scope.loadMoreGoodsList = function() {
		if(isLoadingList) return;
		isLoadingList = true;
		getTechnicianList(false, true, true, $secope.items.length);
	};
	//搜索
	$scope.search = function($event) {

		//var e = event || window.event || arguments.callee.caller.arguments[0];
		//if(e.keyCode == 13) {
			//判断是否正在访问接口
			if(isLoadingList){
				return;
			}
			isLoadingList = true;
			service_search = $scope.searchTxt.text;
			getTechnicianList(false, true, false, 0);
		//}
	};
	//收藏取消收藏
	$scope.collection = function(item, $event) {
		$event.stopPropagation();
		//判断是否正在访问接口
		if(isCollect) return;
		isCollect = true;
		var options = {
			params: {
				beautician_id: item.beauticianid
			}
		};
		if(item.iscollection == 'N') {
			options.module = 'FM_APP_COLLECT_BEAUTICIAN';
		} else {
			options.module = 'FM_APP_CANCELCOLLECT_BEAUTICIAN';
		}
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y') {
				item.iscollection = item.iscollection == "Y" ? "N" : "Y";
			} else {
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
			isCollect = false;
		});
	};
	//选择技师按钮
	$scope.select = function(item, $event) {
		$event.stopPropagation();
		if(isLoadingList) return;
		if($scope.myTechnician && $scope.herTechnician) { //进入下单页面
			settlement();
			return;
		}
		if($scope.isGiveMe) { //给我选
			if(!$scope.myTechnician) {
				if($scope.herTechnician && $scope.herTechnician.beauticianid == item.beauticianid) { //技师已给他选
					Xalert.loading('该' + $rootScope.technicianText + '已给Ta选择', 1000);
					return;
				}
				$scope.myTechnician = item;
				localStorage.setItem("myTechnician", angular.toJson($scope.myTechnician));
			}
			if($scope.herTechnician) { //进入下单页面
				settlement();
			} else {
				$scope.isGiveMe = false;
				getTechnicianList(false, true, false, 1);
			}
		} else { //给他选
			if(!$scope.herTechnician) {
				if($scope.myTechnician && $scope.myTechnician.beauticianid == item.beauticianid) { //技师已给我选
					Xalert.loading('该' + $rootScope.technicianText + '已给我选择', 1000);
					return;
				}
				$scope.herTechnician = item;
				localStorage.setItem("herTechnician", angular.toJson($scope.herTechnician));
			}
			if($scope.myTechnician) { //进入下单页面
				settlement();
			} else {
				$scope.isGiveMe = true;
				getTechnicianList(false, true, false, 0);
			}
		}
	};
	/**
	 * 进入下单页面
	 */
	function settlement() {
		var data = {
			from: '1',
			userMobile: $rootScope.$_userInfo.user_mobile,
			userName: $rootScope.$_userInfo.user_name,
			storeId: store_id,
			roomType: store_type
		};
		var selectTechnician = {
			my_beaticain: $scope.myTechnician,
			her_beaticain: $scope.herTechnician
		};
		//存储技师信息
		localStorage.setItem("selectTechnician", angular.toJson(selectTechnician));
		$state.go('submit-order', ({
			data: angular.toJson(data)
		}));
	}
	/**
	 * 获取技师列表
	 * @param {调用成功后是否是添加数据} isAddData
	 * @param {调用失败后是否需要清空数据} isEmptyData
	 * @param {是否是下拉刷新} isRefresh
	 * @param {加载的页数} pageoffset
	 */
	function getTechnicianList(isAddData, isEmptyData, isRefresh, pageoffset) {
		var options = {
			module: 'FM_APP_STORE_BEAUTICIAN_LIST', //店面技师列表
			params: {
				page_size: 12,
				pageoffset: pageoffset, //访问页
				store_id: store_id, //店面id
				starttime: $scope.timeData.starttime, //预约开始时间
				//store_type: store_type, //房间类型
				store_type: "STORE_TYPE_DOUBLE_A", //双人预约
				service_search: service_search, //检索内容
				service_ordertype: $scope.service_ordertype, //排序类型
			}
		};
		if($scope.isGiveMe) { //给我选
			options.params.item_id = $scope.singleServiceSelectData.itemid;
		} else {
			options.params.item_id = $scope.singleServiceSelectData.itemidHer;
		}
		getInterface.jsonp(options, function(results, params) {
			if(isRefresh)
				$scope.$broadcast('scroll.refreshComplete');
			if(results.status == 'Y' && results.results != null) {
				var items = results.results;

				//删除给我选或者给她选的技师
				if($scope.isGiveMe){ //给我选
					if($scope.herTechnician) { //技师已给他选
						items.splice($scope.herTechnician,1);
					}
				}else{
					if($scope.myTechnician) { //技师已给我选
						items.splice($scope.myTechnician,1);
					}
				}


				if(items && items.length > 0) { //有数据
					if(isAddData) { //添加数据
						$scope.items = $scope.items.concat(items);
					} else { //刷新数据
						$scope.items = items;
						$ionicScrollDelegate.scrollTop();
					}
				} else if(!isAddData) {
					$scope.items = [];
				}
				//判断是否显示空数据提示
				if($scope.items && $scope.items.length > 0) {
					$scope.isShowNoData = false;
				} else {
					$scope.isShowNoData = true;
				}
				//判断是否显示上拉加载
				if(!results || results.length == 0 || results.length % 10 != 0) {
					$scope.isShowLoadMore = false;
				} else {
					$scope.isShowLoadMore = true;
				}
				$scope.pageoffset = pageoffset;
				var view = $ionicScrollDelegate.$getByHandle('scrollContent');
				view.resize();
				if(!isAddData) view.scrollTop(true);
			} else {
				if(isEmptyData) {
					$scope.items = [];
					var view = $ionicScrollDelegate.$getByHandle('scrollContent');
					view.resize();
					view.scrollTop(true);
					$scope.isShowLoadMore = false;
					$scope.isShowNoData = true;
				}
				Xalert.loading(results.error_msg, 1000);
			}
			isLoadingList = false;
		});
	};
});