'use strict';
/**
 * 双人选服务
 * wuhao
 */
app.controller('ServiceTwoCtrl', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, SwitchShopService, serviceChange, $stateParams, pageData2, pageData3, $ionicScrollDelegate,$ionicPopup) {
	
	$scope.tabType = '';
	$scope.servicetype_id = '';//分类Id
	$scope.orderPriceMode = '';//排序方式
	$scope.sortid = 0;
	var isBorder = $scope.sortid; // 保存actice项
	var aSpan = document.getElementById('tsb-hscroll').getElementsByClassName('scroll')[0].getElementsByTagName('span');
	$scope.categoryOrder = function(sortid) {
//		if(isBorder == sortid){
//			return;
//		}
		$scope.items = [];//切换标签重置数据
		$scope.sortid = sortid;
		isBorder = sortid;
		if($scope.sortid == 1) {
			if(!$scope.isShow) { //价格
				$scope.isUp = !$scope.isUp;
				$scope.isDown = !$scope.isUp;
				if($scope.isUp) {
					$scope.orderPriceMode = 'ORDER_ASC'; //正序 [低-高]
				}
				if($scope.isDown) {
					$scope.orderPriceMode = 'ORDER_DESC'; //倒序 【高-低】
				}
			}
//			$scope.orderType = 'ORDER_PRICE'; //价格
			$scope.tabType = 'ORDER_PRICE';//价格
		} else if($scope.sortid == 2) { //好评率
//			$scope.orderType = 'ORDER_COMMENT'; //好评
			$scope.tabType = 'ORDER_GOODCOMMENT';
			$scope.orderPriceMode = '';
			$scope.isUp = false;
			$scope.isDown = false;
		} else { //销量
//			$scope.orderType = 'ORDER_SALESVOLUME'; //人气
			$scope.tabType = 'ORDER_SALESVOLUME';//人气
			$scope.orderPriceMode = '';
			$scope.isUp = false;
			$scope.isDown = false;
		}
		getServiceList();
//		alert(1)
	}
	$scope.activeItemc = '';
	//点击分类
	var removePopup;
	var bFlag = false;
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
		if(bFlag) {
			removePopup.close();
		}

	});
	$scope.proType = function() {
		bFlag = true;
		if(aSpan) {
			if(document.getElementsByClassName('backdrop')[0]) {
				document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active backdropSelf';
			}
			angular.forEach(aSpan, function(value, index) {
				value.className = 'disable-user-behavior';
			})
		}
		$scope.isShow = !$scope.isShow;
		removePopup = $ionicPopup.show({
			cssClass: 'mall',
			templateUrl: 'apps/modules/service/templates/serviceGoods-type.html',
			scope: $scope,
			buttons: [{
					text: '<font color="#999">取消</font>',
					onTap: function() {
						$scope.isShow = !$scope.isShow;
						$scope.sortid = isBorder;
						if(aSpan[isBorder]) {
							aSpan[isBorder].className = 'disable-user-behavior active';
						}
						if(document.getElementsByClassName('backdrop')[0]) {
							document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active ';
						}
						bFlag = false;
					}
				},
				{
					text: '<font color="#333">确定</font>',
					type: 'button-positive',
					onTap: function(e) {
						$scope.items = [];
						if(aSpan[isBorder]) {
							aSpan[isBorder].className = 'disable-user-behavior active';
						}
						if(document.getElementsByClassName('backdrop')[0]) {
							document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active ';
						}
						$scope.categoryOrder($scope.sortid);
						$scope.isShow = !$scope.isShow;
						bFlag = false;
					}
				}
			]
		})
	}
	//分类-con
	$scope.proTypeItem = function(servicetype_id, name) {
		$scope.activeItemc = servicetype_id;
		if(name != '全部') {
			$scope.servicetype_id = servicetype_id;
		} else {
			$scope.servicetype_id = '';
		}
	};
	
	
	var store_id = $stateParams.store_id; //店面id
	var mintime = $rootScope.mintime; //最小服务时长

	$scope.serviceTypeWidth = window.innerWidth / 4; //服务分类item的宽度
	$scope.cWidth = 0; //服务分类列表的宽度
	//服务列表搜索

	$scope.searchText = {
		text: ''
	};
	$scope.items = []; //服务列表
	$scope.selectedDataMy = []; //给我选加入购买的数据
	$scope.selectedDataHer = []; //给她选加入购买的数据
	$scope.serviceType = []; //服务分类列表
	$scope.selectServiceTypeId = ""; //选择的服务分类id
	$scope.current_page = 1; //加载的页数
	$scope.isActive = true; //true给我选 false给他选
	$scope.noData = false; //是否显示无数据
	$scope.isShowLoadMore = false; //是否显示上拉加载
//	$scope.money = 0.0; //总金额
	$scope.money = 0; //总金额
	$scope.timeMy = 0; //给我选的总时长
	$scope.timeHer = 0; //给他选的总时长
	var searchText = ""; //需要搜索的文本
	var isLoadingList = false; //判断列表是否正在获取数据
	var isLoagingCollection = false; //判断是否正在访问收藏接口

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(fromState.name == 'store-service-detail') { //双人服务详情返回
			//获取历史给我选给他选记录
			var isActive = localStorage.getItem("isActive");
			$scope.isActive = isActive == "true" ? true : false; //true给我选 false给他选
			//获取服务数据
			var singleServiceSelectDataCopy = angular.fromJson(localStorage.getItem("singleServiceSelectDataCopy")); //上一次所选择的服务
			localStorage.removeItem("singleServiceSelectDataCopy");
			$scope.selectedDataMy = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.selectedData : []; //给我选加入购买的数据
			$scope.selectedDataHer = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.selectedDataHer : []; //给她选加入购买的数据
//			$scope.money = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.aprice : 0.0;//总金额
			$scope.money = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.aprice : 0;//总金额
			$scope.timeMy = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.time : 0; //给我选的总时长
			$scope.timeHer = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.timeHer : 0; //给他选的总时长
			initServiceList($scope.items);
		} else{ //店面详情进入
			var singleServiceSelectData = angular.fromJson(localStorage.getItem("singleServiceSelectData")); //上一次所选择的服务
			$scope.selectedDataMy = singleServiceSelectData ? singleServiceSelectData.selectedData : []; //给我选加入购买的数据
			$scope.selectedDataHer = singleServiceSelectData ? singleServiceSelectData.selectedDataHer : []; //给她选加入购买的数据
//			$scope.money = singleServiceSelectData ? singleServiceSelectData.aprice : 0.0; //总金额
			$scope.money = singleServiceSelectData ? singleServiceSelectData.aprice : 0; //总金额
			$scope.timeMy = singleServiceSelectData ? singleServiceSelectData.time : 0; //给我选的总时长
			$scope.timeHer = singleServiceSelectData ? singleServiceSelectData.timeHer : 0; //给他选的总时长
			initServiceList($scope.items);
		}
	});

	getServiceType(); //获取服务分类

	//返回按钮
	$scope.goback = function() {
		history.go(-1);
	};
	//搜索
	$scope.search = function(event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e.keyCode == 13) {
			if(isLoadingList) return;
			searchText = $scope.searchText.text;
			isLoadingList = true;
			$scope.items = [];//清空数据
			getServiceList(false, true, false, 1);
		}
	};
	//切换给我选给他选
	$scope.cutMyAndHer = function(active) {
		if(active == $scope.isActive) return;
		$scope.isActive = !$scope.isActive;
		initServiceList($scope.items);
	};
	/**
	 * 切换服务分类
	 * @param {服务分类id} serviceTypeId
	 */
	$scope.tab = function(serviceTypeId) {
		if(serviceTypeId == $scope.selectServiceTypeId) return;
		if(isLoadingList) return;
		isLoadingList = true;
		$scope.selectServiceTypeId = serviceTypeId;

		getServiceList(false, true, false, 1);

	};
	//下拉刷新
	$scope.doRefresh = function() {
		if(isLoadingList) {
			$scope.$broadcast('scroll.refreshComplete');
			return;
		}
		$scope.items = [];//清空数据
		getServiceList(false, true, true, 1);
	};
	// 上拉加载
	$scope.loadMoreGoodsList = function() {
		if(isLoadingList) return;
		isLoadingList = true;
		getServiceList(true, false, false, $scope.current_page);
	};
	//加入购买or取消购买
	$scope.joinCar = function($event, item) {
		$event.stopPropagation();
		if(!item.selected) { //添加购买
			item.selected = true;
			$scope.money = parseFloat($scope.money) + parseFloat(item.nowprice);
//			$scope.money = $scope.money.toFixed(1);
			$scope.money = $scope.money;
			if($scope.isActive) {
				$scope.timeMy += item.iusetime;
				$scope.selectedDataMy = $scope.selectedDataMy.concat(item);
			} else {
				$scope.timeHer += item.iusetime;
				$scope.selectedDataHer = $scope.selectedDataHer.concat(item);
			}
		} else { //取消购买
			item.selected = false;
			$scope.money = parseFloat($scope.money) - parseFloat(item.nowprice);
//			$scope.money = $scope.money.toFixed(1);
			$scope.money = $scope.money;
			if($scope.isActive) {
				for(var i = 0; i < $scope.selectedDataMy.length; i++) {
					if($scope.selectedDataMy[i].itemid == item.itemid) {
						$scope.selectedDataMy.splice(i, 1);
						continue;
					}
				}
				$scope.timeMy -= item.iusetime;
			} else {
				for(var i = 0; i < $scope.selectedDataHer.length; i++) {
					if($scope.selectedDataHer[i].itemid == item.itemid) {
						$scope.selectedDataHer.splice(i, 1);
						continue;
					}
				}
				$scope.timeHer -= item.iusetime;
			}
		}

	};
	//服务收藏
	$scope.goodsCollection = function(item, $event) {
		$event.stopPropagation();
		if(isLoagingCollection) return;
		isLoagingCollection = true;
		serviceChange.collection(item.itemid, function(results) {
			if(results.status == 'Y') {
				item.iscollection = 'Y';
			} else {
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
			isLoagingCollection = false;
		});
	};
	//服务取消收藏
	$scope.goodsCollectionDel = function(item, $event) {
		$event.stopPropagation();
		if(isLoagingCollection) return;
		isLoagingCollection = true;
		serviceChange.uncollection(item.itemid, function(results) {
			if(results.status == 'Y') {
				item.iscollection = 'N';
			} else {
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
			isLoagingCollection = false;
		});
	};
	//跳转服务详情
	$scope.goDetail = function(item, $index) {
		var orderService = {
			time: $scope.timeMy,
			timeHer: $scope.timeHer,
			aprice: $scope.money,
			selectedData: $scope.selectedDataMy,
			selectedDataHer: $scope.selectedDataHer
		}
		localStorage.setItem("singleServiceSelectDataCopy", angular.toJson(orderService));
		localStorage.setItem("serviceItem", angular.toJson(item));
		localStorage.setItem("isActive", $scope.isActive + "");
		$state.go('store-service-detail', {
			id: item.itemid
		});
	};
	//下一步提交
	$scope.next = function() {
		//是否登录
		if(!Authentication.checkLogin(true)) {
			return false;
		};
		if($scope.selectedDataMy.length == 0 && $scope.selectedDataHer.length == 0) {
			Xalert.loading('请选择' + $rootScope.serviceText, 1000);
			return;
		}
		if($scope.selectedDataMy.length == 0) {
			Xalert.loading('请给您自己选择' + $rootScope.serviceText, 1000);
			return;
		}
		if($scope.selectedDataHer.length == 0) {
			Xalert.loading('请给Ta选择' + $rootScope.serviceText, 1000);
			return;
		}
		if($scope.timeMy < $rootScope.mintime) {
			Xalert.loading('给我选' + $rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟');
			return;
		} else if($scope.timeHer < $rootScope.mintime) {
			Xalert.loading('给Ta选' + $rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟');
			return;
		}
		var orderService = {
			time: $scope.timeMy,
			timeHer: $scope.timeHer,
			aprice: $scope.money,
			selectedData: $scope.selectedDataMy,
			selectedDataHer: $scope.selectedDataHer
		}
		localStorage.setItem("singleServiceSelectData", angular.toJson(orderService));
		localStorage.setItem("selectServieData", "true");
		history.go(-1);
	};
	//服务详情页面返回
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(fromState.name == 'storeSingleServiceDetail') {
			var singleServiceSelectData = localStorage.getItem("singleServiceSelectDataCopy"); //服务详情页面加入取消购物车后修改的数据
			if(singleServiceSelectData) {
				$scope.selectedDataMy = singleServiceSelectData.selectedData; //给我选加入购买的数据
				$scope.selectedDataHer = singleServiceSelectData.selectedDataHer; //给她选加入购买的数据
				$scope.money = singleServiceSelectData.aprice; //总金额
				$scope.timeMy = singleServiceSelectData.time; //给我选的总时长
				$scope.timeHer = singleServiceSelectData.timeHer; //给他选的总时长
			}
		}
	});
	/**
	 * 获取服务分类
	 */
	function getServiceType() {
		isLoadingList = true;
		var options = {
			module: 'FM_APP_SERVICETYPE_ONE_LEVEL_LIST',
			params: {}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y' && results.results != null && results.results.length > 0) {
				$scope.cWidth = $scope.serviceTypeWidth * results.results.length;
				$scope.serviceType = results.results;
				$scope.itemsType = results.results;
			} else {
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
			getServiceList(false, false, false, 1); //获取服务列表
		});
	}
	/**
	 *获取服务列表数据 
	 * @param {调用成功后是否是添加数据} isAddData
	 * @param {调用失败后是否需要清空数据} isEmptyData
	 * @param {是否是下拉刷新} isRefresh
	 * @param {加载的页数} current_page
	 */
	function getServiceList(isAddData, isEmptyData, isRefresh, current_page) {
		var options = {
			module: 'FM_APP_SERVICE_LIST',
			params: {
				page_size: 10,
//				current_page: current_page,
				pageoffset:$scope.items.length,
				store_id: store_id, //店面id
				type: "SERVICE_SINGLE", //单次多次(套票)
				servicetype_id: $scope.selectServiceTypeId, //服务分类id
				service_type: "SERVICE_OFFLINE", //到家到店
				service_search: searchText,
				service_ordertype:$scope.tabType,//排序类型
				servicetype_id:$scope.servicetype_id,//服务分类
				service_ordermode:$scope.orderPriceMode//排序方式
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(isRefresh)
				$scope.$broadcast('scroll.refreshComplete');
			if(results.status == 'Y' && results.results != null) {
				var items = results.results;
				if(items && items.length > 0) { //有数据
					initServiceList(items);
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
					$scope.noData = false;
				} else {
					$scope.noData = true;
				}
				//判断是否显示上拉加载
				if(!items || items.length == 0 || items.length % 10 != 0) {
					$scope.isShowLoadMore = false;
				} else {
					$scope.isShowLoadMore = true;
				}
				$scope.current_page = current_page;
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
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
			isLoadingList = false;
		});
	};
	//遍历服务列表数据添加已加入购物车的参数
	function initServiceList(items) {
		if(items == null || items.length == 0) return;
		for(var i = 0; i < items.length; i++) {
			items[i].selected = false;
			if($scope.isActive && $scope.selectedDataMy.length != 0) {
				for(var j = 0; j < $scope.selectedDataMy.length; j++) {
					if(items[i].itemid == $scope.selectedDataMy[j].itemid) {
						items[i].selected = true;
					}
				}
			} else if(!$scope.isActive && $scope.selectedDataHer.length != 0) {
				for(var j = 0; j < $scope.selectedDataHer.length; j++) {
					if(items[i].itemid == $scope.selectedDataHer[j].itemid) {
						items[i].selected = true;
					}
				}
			}
		}
	}
});