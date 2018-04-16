'use strict';
/*
 author tzb
 */
// 到家  到店 服务选择
app.controller('storeSingleService', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, SwitchShopService, serviceChange, $stateParams) {
	//参数接收
	var needTime = 0; //最大服务时长
	var from = localStorage.getItem('from'); //1.my-ticket 套票 2.技师 technician3. 单次到家  home  4 到店 store
	var type = localStorage.getItem('type'); //单次多次(套票)
	var serviceType = localStorage.getItem('serviceType'); //到家or到店
	var citycode = $rootScope.selCityInfo.citycode; //城市编码
	$scope.id = 'undefind'; //服务类型 '' 为全部
	if(!citycode) {
		//如果定位失败 默认城市列表第一个
		if($rootScope.cityitems) {
			citycode = $rootScope.cityitems[0].city_code;
		} else {
			citycode = '';
		}

	}
	var storeId = localStorage.getItem('storeId'); //店面id
	if(!storeId) storeId = '';

	var selectedData = []; //加入购买的数据
	var bid = ''; //技师id
	//	var mintime = 0 //最小时长
	var starttime = ''; //预约时间
	var selectTechnician = localStorage.getItem('selectTechnician');
	if(selectTechnician) {
		selectTechnician = angular.fromJson(selectTechnician).my_beaticain;
		bid = selectTechnician.beauticianid; //技师id
	}
	//点击返回按钮，清空搜索框的内容
	$scope.clearText = function() {
		$scope.searchText.text = '';
	}
	//服务列表搜索
	$scope.searchText = {
		text: ''
	};
	// 搜索服务	
	$scope.search = function(event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e.keyCode == 13) {
			if($scope.searchText.text) {
				$scope.doRefresh();
			} else {
				Xalert.loading('亲，请输入要搜索的内容');
			}
		}
	};

	//服务分类获取
	var serviceTypeLoad = function() {
		var options = {
			module: 'FM_APP_SERVICETYPE_ONE_LEVEL_LIST',
			params: {}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'N') {
				Xalert.loading(results.error_msg, 1000);
				return false;
			} else {
				$scope.cWidth = {
					width: (document.documentElement.clientWidth) / 4 + 'px'
				};
				$scope.DivWith = {
					width: (document.documentElement.clientWidth) / 4 * results.results.length + 'px'
				};
				$scope.serviceTypeList = results.results;
			}
		});
	}
	serviceTypeLoad();
	//	选项卡点击事件 调服务列表接口
	$scope.isNoData = false; //false：不显示无数据布局；true：显示无数据布局
	$scope.items = [];
	$scope.page = 1;
	$scope.serviceload = function(id) {
		if(id == $scope.id) {
			return;
		}
		$scope.id = id;
		var loadData = function() {
			var options = {
				module: 'FM_APP_SERVICE_LIST',
				params: {
					current_page: $scope.page,
					page_size: 10,
					city_code: citycode, //城市编码
					type: type, //单次多次(套票)
					service_type: serviceType, //到家到店
					service_search: $scope.searchText.text, //搜索关键字
					beauticianid: bid, //技师id
					store_id: storeId, //店面id
					servicetype_id: id
				}
			};
			getInterface.jsonp(options, function(results, params) {
				if(results.status == 'N') {
					Xalert.loading(results.error_msg, 1000);
					$scope.isNoData = true;
					return false;
				} else {
					$scope.items = params.data;
					/*设置isNoData值,用于判断是否显示无数据视图*/
					$scope.items.length == 0 ? $scope.isNoData = true : $scope.isNoData = false;
					$scope.page = params.page;
					$scope.canLoadMoreGoodsList = params.canLoadMore;
					var result = results.results;
					if(!result || result.length == 0 || result.length % 10 != 0) {
						$scope.isShowLoadMore = false;
					} else {
						$scope.isShowLoadMore = true;
					}
					for(var j = 0; j < $scope.items.length; j++) {
						$scope.items[j].text = '加入购买';
						$scope.items[j].selected = false;
						if(selectedData && selectedData.length > 0) {
							for(var i = 0; i < selectedData.length; i++) {
								if(selectedData[i].itemid == $scope.items[j].itemid) {
									$scope.items[j].text = '取消购买';
									$scope.items[j].selected = true; //加入/取消   购买 文字显示状态
								}
							}
						}
					}

				}
			});
		}
		loadData();
		// 上拉加载
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
		};
		//下拉刷新
		$scope.doRefresh = function() {
			$scope.page = 1;
			$timeout(function() {
				$scope.items = [];
				$scope.isNoData = false;
				$scope.serviceload($scope.id);
				loadData();
				$scope.$broadcast('scroll.refreshComplete');
			}, 500);
		};
	}

	//初始化服务数据
	$scope.serviceload('');

	// 	加入/取消  购买
	$scope.money = 0; //总价格
	$scope.time = 0; //总时间
	$scope.joinCar = function($event, item) {
		$event.stopPropagation();
		localStorage.setItem('from', from);
		localStorage.setItem('type', type);
		localStorage.setItem('serviceType', serviceType);

		item.selected = !item.selected;

		if(item.selected) {
			item.text = '取消购买';
		} else {
			item.text = '加入购买';
		}
		if(item.selected) { //加入购买
			$scope.money += parseFloat(item.nowprice);
			$scope.time += item.iusetime;
			item.id = item.itemid; //服务id
			selectedData.push(item);
			var data = {
				selectedData: selectedData
			}
			localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));
		} else {
			$scope.money -= parseFloat(item.nowprice);
			$scope.time -= item.iusetime;
			//取消加入购买移除
			for(var i = 0; i < selectedData.length; i++) {
				if(item.itemid == selectedData[i].itemid) {
					selectedData.splice(i, 1);
				}
			}
			localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));
		}
	}

	//服务取消收藏
	$scope.goodsCollectionDel = function(item, $event) {
		$event.stopPropagation();
		serviceChange.uncollection(item.itemid, function(results) {
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
	//价格显示  搜索控制
	$scope.oldPrice = true; //原价显示
	$scope.switchTitle = true; //搜索开关
	if(type == 'SERVICE_SINGLE') {
		$scope.switchTitle = false;
		$scope.oldPrice = true;
	} else {
		$scope.switchTitle = true;
		$scope.oldPrice = false;
	}
	$scope.openSearch = function() {
		$scope.switchTitle = false;
	}
	$scope.closeSearch = function() {
		$scope.switchTitle = true;
		$scope.searchText.text = ''; //关闭搜索框，并清空内容
	}
	var stampitem = '';
	//跳转详情
	$scope.goDetail = function(item, itemid, selected) {
		stampitem = item;
		var data = {
			time: $scope.time, //服务时长
			aprice: $scope.money, //服务价格
			selectedData: selectedData //服务集合
		}
		if(from == 'technician') localStorage.setItem('needtime', needTime); //最长时长
		localStorage.setItem('isActive', 'true'); //给我选
		localStorage.setItem('serviceItem', angular.toJson(item));
		localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));
		$state.go('store-service-detail');

	}
	//服务收藏
	$scope.goodsCollection = function(item, $event) {
		$event.stopPropagation();
		serviceChange.collection(item.itemid, function(results) {
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
	//返回店面详情
	$scope.backStore = function() {
		localStorage.setItem('selectServieData', false);
		//清除
		history.go(-1);
	}
	//下一步提交
	$scope.next = function() {
		var from = localStorage.getItem('from'); //从哪来的
		var type = localStorage.getItem('type'); //单次多次(套票)
		var serviceType = localStorage.getItem('serviceType'); //到家or到店
		var citycode = $rootScope.selCityInfo.citycode; //城市编码
		$scope.id = 'undefind'; //服务类型 '' 为全部
		if(!citycode) {
			//如果定位失败 默认城市列表第一个
			citycode = $rootScope.cityitems[0].city_code;
		}
		var storeId = localStorage.getItem('storeId'); //店面id
		if(!storeId) storeId = '';

		var bid = ''; //技师id
		//	var mintime = 0 //最小时长
		var starttime = ''; //预约时间
		var selectTechnician = localStorage.getItem('selectTechnician');
		if(selectTechnician) {
			selectTechnician = angular.fromJson(selectTechnician).my_beaticain;
			bid = selectTechnician.beauticianid; //技师id
		}

		//是否登录
		if(!Authentication.checkLogin(true)) {
			return false;
		};

		if(selectedData && selectedData.length > 0) {
			var data = {
				time: $scope.time, //服务时长
				aprice: $scope.money, //服务价格
				selectedData: selectedData //服务集合
			}
			localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));
			if(type != 'SERVICE_MANY') { //套票不需要时间限制
				if(parseInt($scope.time) >= needTime) {
					if(from == 'technician' && parseInt($scope.time) != needTime && localStorage.getItem('timeData') != null && needTime != -1) {
						Xalert.loading($rootScope.serviceText + '时长最多为 ' + needTime + '分钟', 1000);
						return;
					}
				} else if(parseInt($scope.time) < $rootScope.mintime) {
					Xalert.loading($rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟', 1000);
					return;
				}
			}
			//跳转存值
			if(from == 'home' && type != 'SERVICE_MANY') {
				var data = {
					time: $scope.time, //服务时长
					aprice: $scope.money, //服务价格
					selectedData: selectedData //服务集合
				}

				localStorage.setItem('singleServiceSelectData', angular.toJson(data));
				$state.go('submit-service-order',{data:''}); //确认订单
			} else if(type == 'SERVICE_MANY') {
				//所选服务id 逗号隔开
				var serviceid = '';
				for(var i = 0; i < selectedData.length; i++) {
					if(i == 0) {
						serviceid = selectedData[i].itemid;
					} else {
						serviceid = serviceid + ',' + selectedData[i].itemid;
					}
				}
				var servicedata = {
					time: $scope.time, //服务时长
					aprice: $scope.money, //服务价格
					selectedData: selectedData, //服务集合
					itemid: serviceid
				}
				localStorage.setItem('singleServiceSelectData', angular.toJson(servicedata)); //服务所选数据
				var data = {
					from: 4
				}
				localStorage.setItem("type", type);
				localStorage.setItem("from", 'home');
				localStorage.setItem("serviceType", "SERVICE_ONLINE")
				$state.go('submit-service-order', {
					data: angular.toJson(data)
				}); //立即下单
			} else {
				var data = {
					time: $scope.time, //服务时长
					aprice: $scope.money, //服务价格
					selectedData: selectedData //服务集合
				}
				localStorage.setItem('singleServiceSelectData', angular.toJson(data));
				localStorage.setItem('selectServieData', 'true') //是否结算
				$window.history.go(-1);
			}
		} else {
			Xalert.loading('请选择您需购买的' + $rootScope.serviceText + '!', 1000);
		}

	}

	//页面跳转监听
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		switch(fromState.name) {
			case 'store-details': //从店面详情来
				loadService('singleServiceSelectData');
				break;
			case 'store-service-detail': // 从服务详情回来
				type = localStorage.getItem('type'); //单次多次(套票)
				serviceType = localStorage.getItem('serviceType'); //到家or到店
				loadService('singleServiceSelectDataCopy');
				break;
			case 'tab.home': //从首页来				
				$scope.serviceload('');
				localStorage.setItem('Record', 2);
				break;
			case 'sure-order': //确认订单
				type = localStorage.getItem('type'); //单次多次(套票)
				serviceType = localStorage.getItem('serviceType'); //到家or到店
				loadService('singleServiceSelectData');
				break;
			case 'submit-order': //立即下单
				type = localStorage.getItem('type'); //单次多次(套票)
				serviceType = localStorage.getItem('serviceType'); //到家or到店
				loadService('singleServiceSelectData');
				break;
			case 'beautician-detail': //技师详情来
				loadService('singleServiceSelectData');
				loadTeacher();
				loadTime();
				break;
			case 'my-ticket-order': //套票去使用
				var stampTime = localStorage.getItem('stampTime');
				$scope.time = parseInt($scope.time) + parseInt(stampTime);
				type = localStorage.getItem('type'); //单次多次(套票)
				serviceType = localStorage.getItem('serviceType'); //到家or到店
				loadService('singleServiceSelectData');
				break;
		}

		//去服务详情来 重新存值
		if(toState.name == 'store-service-detail') {
			var data = {
				time: $scope.time, //服务时长
				aprice: $scope.money, //服务价格
				selectedData: selectedData //服务集合
			}
			if(from == 'technician') localStorage.setItem('needtime', needTime); //最长时长
			localStorage.setItem('isActive', 'true'); //给我选
			localStorage.setItem('from', from); //从哪来
			localStorage.setItem('type', type); //单次还是多次
			localStorage.setItem('serviceType', serviceType); //到店还是到家
			localStorage.setItem('serviceItem', angular.toJson(stampitem));
			localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));
		}

	});
	//加载服务数据
	var loadService = function(singleServiceSelectData) {
		var singleServiceSelectData = localStorage.getItem(singleServiceSelectData); //本地数据
		if(singleServiceSelectData && singleServiceSelectData != '') {
			selectedData = angular.fromJson(singleServiceSelectData).selectedData;
			if(selectedData) {
				$scope.money = angular.fromJson(singleServiceSelectData).aprice; //总价格
				$scope.time = angular.fromJson(singleServiceSelectData).time; //总时间
				$scope.serviceload('');
			} else {
				selectedData = [];
			}
		}
	}
	//加载技师数据
	var loadTeacher = function() {
		var selectTechnician = localStorage.getItem('selectTechnician');
		if(selectTechnician) {
			selectTechnician = angular.fromJson(selectTechnician).my_beaticain;
			bid = selectTechnician.beauticianid; //技师id
		}
	}
	//加载时间数据
	var loadTime = function() {
		if(localStorage.getItem('timeData')) {
			starttime = angular.fromJson(localStorage.getItem('timeData')).starttime; //预约时间
		} else {
			starttime = 0;
		}
	}
	loadTime();
	//监听刷新列表
	$scope.$on('listUpdate', function(event, data) {
		$scope.doRefresh();
	});

});