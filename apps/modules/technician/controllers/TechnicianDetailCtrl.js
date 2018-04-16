'use strict';

/**
 * 技师详情
 * auth:tzb
 */
app.controller('BeauticianDetailCtrl', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $stateParams, pageData2) {
	var widthall = document.body.offsetWidth;
	$scope.myObj = (widthall - 80)/6;
	
	var beauticianid = $stateParams.id //技师id
	var beathdata = $stateParams.data; //技师数据
	var timeData = angular.fromJson(localStorage.getItem('timeData')); //时间数据
	var from = localStorage.getItem('from'); //来源
	if(timeData) {
		$scope.timeShow = timeData.timeShow; //时间显示数据
	} else {
		$scope.timeShow = '';
	}

	var serAddress = ''; //地址
	var detailaddres = ''; //详细地址
	var lng = '';
	var lat = '';
	var cityCode = '';
	var selectedAddress = ''; //选择的地址
	if(localStorage.getItem('selectedAddress'))
		selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
	if(selectedAddress) {
		serAddress = selectedAddress.address; //地址
		detailaddres = selectedAddress.addressinfo; //详细地址
		lng = selectedAddress.longitude;
		lat = selectedAddress.latitude;
		cityCode = selectedAddress.code;
	}
	var serviceData = localStorage.getItem('singleServiceSelectData'); //服务数据
	var selectedData = []; // 所选数据集合
	if(serviceData) {
		serviceData = angular.fromJson(serviceData); //所选服务数据
		if(serviceData && serviceData != '')
			selectedData = serviceData.selectedData; //所选服务集合
	}
	$scope.selectShow = false; //是否可点击 箭头显示
	$scope.selectedDataName = ''; //服务名字
	if(selectedData && selectedData != '') {
		for(var i = 0; i < selectedData.length; i++) {
			if(i == 0) {
				$scope.selectedDataName = selectedData[i].iname;
			} else {
				$scope.selectedDataName = $scope.selectedDataName + '+' + selectedData[i].iname;
			}
		}
	} //服务名字显示  end

	//地址显示
	var selectedAddress = '';
	switch(from) {
		case 'stroe':
			$scope.indexShow = false; //不显示地址
			break;
		case 'home':
			$scope.indexShow = true; //显示地址
			selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
			//显示服务地址
			$scope.serviceAdd = selectedAddress.address; //地址
			if(!$scope.serviceAdd) $scope.serviceAdd = '';
			break;
		case 'technician':
			$scope.indexShow = true; //显示地址
			$scope.selectShow = true; //可点击
			selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
			//显示服务地址
			$scope.serviceAdd = selectedAddress.address + selectedAddress.addressinfo; //地址
			if(!$scope.serviceAdd) $scope.serviceAdd = '';
			break;
	}
	//	技师详情技师资料
	var loadData = function() {
		var options = {
			module: 'FM_APP_BEAUTICIAN_INFO',
			params: {
				beauticianid: beauticianid
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'N') {
				Xalert.loading(results.error_msg, 1000);
				return false;
			} else {
				$scope.technician = results.results;
				$scope.jsEvaluaList = $scope.technician.beautician_comment;
				for (var i = 0; i < $scope.jsEvaluaList.length; i++) {
                    if ($scope.jsEvaluaList[i].isanonymity == 1) {
                        $scope.jsEvaluaList[i].isAnonysMity = '匿名';
                    } else {
                        $scope.jsEvaluaList[i].isAnonysMity = $scope.jsEvaluaList[i].uname;
                    }
                }
			}
			console.log($scope.technician);
			console.log($scope.jsEvaluaList);
		});
	}
	loadData();
	//就选ta
	$scope.submit = function() {
			//是否登录
			//		if(!Authentication.checkLogin(true)) {
			//			return false;
			//		};
			//		if($scope.timeShow == '') {
			//			Xalert.loading('请选择' + $rootScope.serviceText + '时间', 1000);
			//			return;
			//		}
			//		if(selectedData.length == 0) {
			//			Xalert.loading('请选择所需' + $rootScope.serviceText, 1000);
			//			return;
			//		}
			//		var form = '';
			//		switch(from) {
			//			case 'store':
			//				form = 1;
			//				break;
			//			case 'home':
			//				form = 2;
			//				break;
			//			case 'technician':
			//				form = 2;
			//				break;
			//		}
			//		//所选服务id 逗号隔开
			//		var serviceid = '';
			//		for(var i = 0; i < selectedData.length; i++) {
			//			if(i == 0) {
			//				serviceid = selectedData[i].itemid;
			//			} else {
			//				serviceid = serviceid + ',' + selectedData[i].itemid;
			//			}
			//		}
			/*serviceData.itemid = serviceid;
			localStorage.setItem('singleServiceSelectData', angular.toJson(serviceData)); //服务所选数据
			//时间数据添加处理 start
			var confirmSelectedTimes = angular.fromJson(localStorage.getItem('timeData'));
			confirmSelectedTimes.timeShow = $scope.timeShow;
			localStorage.setItem('timeData', angular.toJson(confirmSelectedTimes)); //end
			if(from == 'store') {
				var data = angular.fromJson(beathdata);
				data.from = form;
				data.storeId = data.store_id;
				data.roomType = data.store_type;
			} else {
				var data = {
					from: form
				}
			}*/
			//提交订单页面跳转
			//		$state.go('submit-order', {
			//			data: angular.toJson(data)
			//		});
			localStorage.setItem("selected",true);
			//localStorage.setItem("selectTechnician", localStorage.getItem("selectTechnicianCopy"));
			localStorage.getItem("selectTechnician");
			history.go(-2)
		}
		//服务选择
	$scope.serviceSelected = function() {
			if($scope.selectShow) {
				if($scope.timeShow && $scope.timeShow != '') {
					canSelectedService(); //计算技师可用时间
				} else {
					localStorage.setItem("type", 'SERVICE_SINGLE');
					localStorage.setItem("from", 'technician');
					localStorage.setItem("serviceType", "SERVICE_ONLINE")
					$state.go('store-single-service');
				}
			}
		}
		//时间选择
	$scope.timeSelected = function() {
			if($scope.selectShow) {
				var data = {
					bid: beauticianid,
					citycode: cityCode,
					lng: lng,
					lat: lat
				}
				data = JSON.stringify(data);
				//选时间时需要传服务id
				$state.go('service-time', {
					form: 'technicianDetail',
					data: data
				})
			}
		}
		//返回
	$scope.backorder = function() {
			history.go(-1);
		}
		//跳转监听
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

		switch(fromState.name) {
			case 'submit-order': //提交订单返回

				//地址显示
				$scope.indexShow = true;
				if(from == 'store') {
					$scope.indexShow = false;
				} else {
					$scope.indexShow = true; //显示地址
				}

				beauticianid = $stateParams.id //技师id
				if(localStorage.getItem('selectedAddress'))
					var selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
				if(selectedAddress)
				//显示服务地址
					$scope.serviceAdd = selectedAddress.address + selectedAddress.addressinfo; //地址

				loadService();
				//时间
				loadTime();

				break;
			case 'service-time': //服务时间返回
				loadService();
				timeData = localStorage.getItem('timeData');
				if(timeData && !serviceData) {
					timeData = angular.fromJson(timeData);
					$scope.stime = timeData.starttime;
					$scope.atime = 0;
					$scope.timeShow = $filter('timeSelf')($scope.stime, $scope.atime, 0);
					$scope.timeShow = $scope.timeShow.substr(0, $scope.timeShow.indexOf('至'));
				} else {
					loadTime();
				}
				//地址显示
				$scope.indexShow = true;
				if(from == 'store') {
					$scope.indexShow = false;
				} else {
					$scope.indexShow = true; //显示地址
				}

				beauticianid = $stateParams.id //技师id
				if(localStorage.getItem('selectedAddress'))
					var selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
				if(selectedAddress)
				//显示服务地址
					$scope.serviceAdd = selectedAddress.address + selectedAddress.addressinfo; //地址

				break;
			case 'store-single-service': //服务列表
				loadService();
				//时间
				timeData = localStorage.getItem('timeData');
				if(timeData && !serviceData) {
					timeData = angular.fromJson(timeData);
					$scope.stime = timeData.starttime;
					$scope.atime = 0;
					$scope.timeShow = $filter('timeSelf')($scope.stime, $scope.atime, 0);
					$scope.timeShow = $scope.timeShow.substr(0, $scope.timeShow.indexOf('至'));
				} else {
					loadTime();
				}
				//地址显示
				$scope.indexShow = true;
				if(from == 'store') {
					$scope.indexShow = false;
				} else {
					$scope.indexShow = true; //显示地址
				}

				beauticianid = $stateParams.id //技师id
				if(localStorage.getItem('selectedAddress'))
					var selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
				if(selectedAddress)
				//显示服务地址
					$scope.serviceAdd = selectedAddress.address + selectedAddress.addressinfo; //地址

				break;
			case 'store-service-detail': //服务详情
				loadService();
				if(timeData && !serviceData) {
					timeData = angular.fromJson(timeData);
					$scope.stime = timeData.starttime;
					$scope.atime = 0;
					$scope.timeShow = $filter('timeSelf')($scope.stime, $scope.atime, 0);
					$scope.timeShow = $scope.timeShow.substr(0, $scope.timeShow.indexOf('至'));
				} else {
					loadTime();
				}
				//地址显示
				$scope.indexShow = true;
				if(from == 'store') {
					$scope.indexShow = false;
				} else {
					$scope.indexShow = true; //显示地址
				}

				beauticianid = $stateParams.id //技师id
				if(localStorage.getItem('selectedAddress'))
					var selectedAddress = angular.fromJson(localStorage.getItem('selectedAddress')); //地址数据
				if(selectedAddress)
				//显示服务地址
					$scope.serviceAdd = selectedAddress.address + selectedAddress.addressinfo; //地址

				break;
		}
		//清除历史记录数量保存
		if(fromState.name == 'tab.technician') {
			localStorage.setItem('Record', 2);
		}
		if(fromState.name == 'home-technician') {
			var record = localStorage.getItem('Record');
			localStorage.setItem('Record', parseInt(record) + 1);
		}
		if(toState.name == 'home-technician' || toState.name == 'tab.technician') {
			var record = localStorage.getItem('Record');
			localStorage.setItem('Record', parseInt(record) - 1);
		}

	});
	//加载时间数据
	var loadTime = function() {
			if(localStorage.getItem('timeData')) {
				timeData = angular.fromJson(localStorage.getItem('timeData'));
				$scope.stime = timeData.starttime;
				if(serviceData)
					$scope.atime = serviceData.time;
				$scope.timeShow = $filter('timeSelf')($scope.stime, $scope.atime, 0);
			}
		}
		//加载服务数据
	var loadService = function() {
		serviceData = localStorage.getItem('singleServiceSelectData'); //服务数据
		if(serviceData) {
			serviceData = angular.fromJson(serviceData); //所选服务数据
			if(serviceData && serviceData != '')
				selectedData = serviceData.selectedData; //所选服务集合
		}
		if(selectedData && selectedData != '') {
			for(var i = 0; i < selectedData.length; i++) {
				if(i == 0) {
					$scope.selectedDataName = selectedData[i].iname;
				} else {
					$scope.selectedDataName = $scope.selectedDataName + '+' + selectedData[i].iname;
				}
			}
		}
	}
//点击好评
	$scope.goevaluat = function(beauticianid){
		var data = {
			beauticianid: beauticianid,
		}
		data = JSON.stringify(data);
		$state.go('technician-evaluatList',({
			form:'technician',
			data:data
		}));
	}
	//标签点击
	$scope.typeId = '1';
	$scope.showPageMall = true; //第一页
	$scope.selType = function(index) {
			$scope.showPageMall = false;
			$scope.showEvaluate = true;
		}
		//	评价列表上拉加载
	$scope.loadMoreGoodsList = function() {
		setTimeout(function() {
			$scope.canLoadMoreGoodsList = false;
			if($scope.sortid == 4) {
				//	        	alert('晒图');
				loadData();
			} else {
				//	        	alert('sss');
				loaEvaldData();
			}
			setTimeout(function() {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}, 1000);
		}, 1000);
	};
	// 	评价下拉刷新
	$scope.doRefresh = function() {
		$scope.page = 1;
		$timeout(function() {
			if($scope.sortid == 4) {
				$scope.imgList = []; //晒图
				loadData();
			} else {
				$scope.evalList = []; //评价列表
				loaEvaldData();
			}
			//			$scope.categoryOrder($scope.sortid);//解决下拉刷新，数据加载2次
			$scope.$broadcast('scroll.refreshComplete');
		}, 500);
	};


	//判断技师可用时间
	var canSelectedService = function() {
		console.log('')
		var options = {
			module: 'FM_APP_CHECK_AVAILABLETIME',
			params: {
				beauticianid: bid, //技师id
				starttime: starttime
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y') {
				localStorage.setItem("type", 'SERVICE_SINGLE');
				localStorage.setItem("from", 'technician');
				localStorage.setItem("serviceType", "SERVICE_ONLINE")
				localStorage.setItem('needtime', needTime); //最长时长
				$state.go('store-single-service');
			} else {
				Xalert.loading('网络异常', 1000);
				return;
			}
		});
	}
});