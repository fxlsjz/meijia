'use strict';
/*确认订单
 author tzb
 */
app.controller('SureOrderCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, $filter, $cookies, $timeout, $window, userInfo) {

	var beauticianid; //技师Id
	var interimb = ''; //服务Id
	var lng; //经度
	var lat; //纬度
	var errMsg;
	var cityCode = $rootScope.selCityInfo.cityCode; // 城市code
	var from; //来自那个页面
	//基本信息
	$scope.orderInfo = {
		linkname: $rootScope.$_userInfo.user_name,
		linktel: $rootScope.$_userInfo.user_mobile,
		serAddress: '',
		detailaddres: ''
	};
	if($rootScope.curraddress) {
		$scope.orderInfo.serAddress = $rootScope.curraddress;
	};

	//定位成功处理
	if($rootScope.coordinate) {
		lng = $rootScope.coordinate.longitude;
		lat = $rootScope.coordinate.latitude;
	}

	var confirmSelectedData = localStorage.getItem('singleServiceSelectData'); //当前所选购买的服务
	if(confirmSelectedData) {
		confirmSelectedData = angular.fromJson(confirmSelectedData);
		from = confirmSelectedData.from;
		//初始化服务id
		$scope.selectedData = confirmSelectedData.selectedData; //服务列表
		$scope.aprice = confirmSelectedData.aprice; //总价格
		$scope.atime = confirmSelectedData.time; //总时间
		initItemId(confirmSelectedData.selectedData);
	}
	/**
	 * 初始化服务id
	 * @param {Object} selectedData
	 */
	function initItemId(selectedData) {
		var interima = '';
		angular.forEach(selectedData, function(value, index) {
			interima = interima + value.itemid + ',';
		});
		interimb = interima.substring(0, interima.length - 1);
	}

	//选择地址 
	$scope.selectAddress = function() {
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		$state.go('my-addrecss', {
			form: 'confirm-order'
		});
	}
	//跳转监听
	$scope.$on('$stateChangeSuccess',
		function(event, toState, toParams, fromState, fromParams) {
			if(fromState.name == 'my-addrecss') { //选择地址
				$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				var selAddress = localStorage.getItem('selectedAddress')
				var selected = localStorage.getItem('selected');
				if(selected == 'false') {
					var confirmSelectedTimes = localStorage.getItem('timeData');
					if(confirmSelectedTimes) {
						confirmSelectedTimes = angular.fromJson(confirmSelectedTimes);
						$scope.stime = confirmSelectedTimes.starttime; //预约时间
						var confirmSelectedData = localStorage.getItem('singleServiceSelectData'); //当前所选购买的服务
						if(confirmSelectedData) {
							confirmSelectedData = angular.fromJson(confirmSelectedData);
							//初始化服务id
							$scope.atime = confirmSelectedData.time; //总时间
						}
						if($scope.stime) {
							$scope.serTime = $filter('timeSelf')($scope.stime, $scope.atime, 0);
							//分配技师
							recommendTechnician();
						} else {
							$scope.serTime = '';
						}
					}
				} else {
					localStorage.removeItem('timeData');
					if(selAddress) {
						selAddress = angular.fromJson(selAddress);
						$scope.orderInfo.serAddress = selAddress.address;
						$scope.orderInfo.detailaddres = selAddress.addressinfo;
						lng = selAddress.longitude;
						lat = selAddress.latitude;
					}
				}

				var confirmSelectedData = localStorage.getItem('singleServiceSelectData'); //当前所选购买的服务
				if(confirmSelectedData) {
					confirmSelectedData = angular.fromJson(confirmSelectedData);
					//初始化服务id
					$scope.selectedData = confirmSelectedData.selectedData; //服务列表
					$scope.aprice = confirmSelectedData.aprice; //总价格
					$scope.atime = confirmSelectedData.time; //总时间
					initItemId(confirmSelectedData.selectedData);

				}
			} else if(fromState.name == 'service-time') { //选择时间
				var confirmSelectedTimes = angular.fromJson(localStorage.getItem('timeData'));
				$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				if(confirmSelectedTimes) {
					$scope.stime = confirmSelectedTimes.starttime; //预约时间
					var confirmSelectedData = localStorage.getItem('singleServiceSelectData'); //当前所选购买的服务
					if(confirmSelectedData) {
						confirmSelectedData = angular.fromJson(confirmSelectedData);
						//初始化服务id
						$scope.atime = confirmSelectedData.time; //总时间
					}
					if($scope.stime) {
						$scope.serTime = $filter('timeSelf')($scope.stime, $scope.atime, 0);
						//分配技师
						$timeout(function() {
							recommendTechnician();
						}, 500);
					} else {
						$scope.serTime = '';
					}
				}
				//				var selAddress = localStorage.getItem('selectedAddress')
				//				if(selAddress) {
				//					selAddress = angular.fromJson(selAddress);
				//					$scope.orderInfo.serAddress = selAddress.address;
				//					$scope.orderInfo.detailaddres = selAddress.addressinfo;
				//					lng = selAddress.longitude;
				//					lat = selAddress.latitude;
				//				}
			} else if(fromState.name == 'home-technician') {
				var confirmSelectedTimes = angular.fromJson(localStorage.getItem('timeData'));
				$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));

				if(confirmSelectedTimes) {
					$scope.stime = confirmSelectedTimes.starttime; //预约时间
					var confirmSelectedData = localStorage.getItem('singleServiceSelectData'); //当前所选购买的服务
					if(confirmSelectedData) {
						confirmSelectedData = angular.fromJson(confirmSelectedData);
						//初始化服务id
						$scope.atime = confirmSelectedData.time; //总时间
					}
					if($scope.stime) {
						$scope.serTime = $filter('timeSelf')($scope.stime, $scope.atime, 0);
						//分配技师
						$timeout(function() {
							recommendTechnician();
						}, 500);
					} else {
						$scope.serTime = '';
					}
				}
				//				var selAddress = localStorage.getItem('selectedAddress')
				//				if(selAddress) {
				//					selAddress = angular.fromJson(selAddress);
				//					$scope.orderInfo.serAddress = selAddress.address;
				//					$scope.orderInfo.detailaddres = selAddress.addressinfo;
				//					lng = selAddress.longitude;
				//					lat = selAddress.latitude;
				//				}
			} else if(fromState.name == 'submit-order') {
				var confirmSelectedTimes = angular.fromJson(localStorage.getItem('timeData'));
				$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				if(confirmSelectedTimes) {
					$scope.stime = confirmSelectedTimes.starttime; //预约时间
					var confirmSelectedData = localStorage.getItem('singleServiceSelectData'); //当前所选购买的服务
					if(confirmSelectedData) {
						confirmSelectedData = angular.fromJson(confirmSelectedData);
						//初始化服务id
						$scope.atime = confirmSelectedData.time; //总时间
					}
					if($scope.stime) {
						$scope.serTime = $filter('timeSelf')($scope.stime, $scope.atime, 0);
						//分配技师
						$timeout(function() {
							recommendTechnician();
						}, 500);
					} else {
						$scope.serTime = '';
					}
				}
			}
			if(fromState.name == 'store-single-service') {
				localStorage.setItem('Record', 3);
			} else if(fromState.name == 'store-service-detail') {
				localStorage.setItem('Record', 4);
			}
		});

	//服务操作
	var bFlag = false;
	var removePopup;
	$scope.$on('$stateChangeStart', function(event, toState, fromState) {
		if(bFlag) {
			removePopup.close();
		}
	});

	//删除服务
	$scope.deleItem = function(index, item) {
		bFlag = true;
		removePopup = $ionicPopup.show({
			template: '<p style="margin: 2em 0; text-align: center">删除' + $rootScope.serviceText + '？</p>',
			scope: $scope,
			buttons: [{
				text: '<font color="#999">取消</font>',
				onTap: function() {
					bFlag = false
				}
			}, {
				text: '<font color="#333">删除</font>',
				type: 'button-positive',
				onTap: function(e) {
					var otherTime = 0;
					if($scope.selectedData.length > 0) {
						for(var i = 0; i < $scope.selectedData.length; i++) {
							otherTime += $scope.selectedData[i].iusetime;
						}
					}

					if((otherTime - item.iusetime) < $rootScope.mintime) {
						Xalert.loading($rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟', 1000);
						return;
					}
					$scope.selectedData.splice(index, 1);
					$scope.atime -= item.iusetime;
					$scope.aprice -= item.nowprice;

					//删除服务时重新选时间和技师
					localStorage.removeItem('timeData');
					$scope.serTime = '';
					$scope.nickname = '';
					$scope.photo = false;
					if($scope.selectedData.length == 1) {
						$scope.isHidden = {
							opacity: 0,
							pointerEvents: 'none'
						}
					}
					var servicedata = {
						time: $scope.atime, //服务时长
						aprice: $scope.aprice, //服务价格
						selectedData: $scope.selectedData, //服务集合
					}
					localStorage.setItem('singleServiceSelectData', angular.toJson(servicedata));
					if(localStorage.getItem("serviceItem")) {
						var serviceItem = anglar.fromJson(localStorage.getItem("serviceItem"));
						if(item.itemid == serviceItem.itemid) {
							serviceItem.selected = false;
							localStorage.setItem('serviceItem');
						}
					}
					bFlag = false;
				}
			}]
		})
	};

	//选择时间
	$scope.selService = function() {
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		if(!$scope.orderInfo.serAddress) {
			Xalert.loading('请选择' + $rootScope.serviceText + '地址');
			return;
		} else if(!$scope.orderInfo.detailaddres) {
			Xalert.loading('请填写详细地址');
			return;
		} else {
			checkServiceAdds(function() {
				var data = {
					itemid: interimb,
					citycode: cityCode,
					lng: lng,
					lat: lat
				}
				data = JSON.stringify(data);
				//选时间时需要传服务id
				$state.go('service-time', {
					form: 'home',
					data: data
				})
			});
		}
	};

	//选择技师
	$scope.selTeach = function() {
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		if(!localStorage.getItem('timeData')) {
			Xalert.loading('请选择' + $rootScope.serviceText + '时间');
			return;
		}
		if(errMsg == 'N') {
			Xalert.loading('重新选择' + $rootScope.serviceText + '时间');
			return;
		}
		if(!$scope.orderInfo.detailaddres) {
			Xalert.loading('请填写详细地址');
			return;
		} else {
			var adressData = { //地址数据
				address: $scope.orderInfo.serAddress,
				addressinfo: $scope.orderInfo.detailaddres,
				longitude: lng,
				latitude: lat,
				code: cityCode
			}
			localStorage.setItem('selectedAddress', angular.toJson(adressData)); //地址数据
			//所选服务id 逗号隔开
			var serviceid = '';
			for(var i = 0; i < $scope.selectedData.length; i++) {
				if(i == 0) {
					serviceid = $scope.selectedData[i].itemid;
				} else {
					serviceid = serviceid + ',' + $scope.selectedData[i].itemid;
				}
			}
			confirmSelectedData.itemid = serviceid;
			localStorage.setItem('singleServiceSelectData', angular.toJson(confirmSelectedData)); //服务所选数据
			//时间数据添加处理 start
			var confirmSelectedTimes = angular.fromJson(localStorage.getItem('timeData'));
			confirmSelectedTimes.timeShow = $scope.serTime;
			localStorage.setItem('timeData', angular.toJson(confirmSelectedTimes)); //end
			checkServiceAdds(function() {
				var data = {
					form: 'confirmOrder'
				}
				$state.go('home-technician', {
					data: angular.toJson(data)
				});
			});
		}
	}

	//将新的地址添加到地址列表
	if($scope.orderInfo.detailaddres) {
		var loadAddresData = function() {
			var options = {
				module: 'FM_APP_ADD_USERADDREDD',
				params: {
					address: $scope.curraddress,
					addressinfo: $scope.orderInfo.detailaddres,
					city_code: cityCode,
					longitude: lng,
					latitude: lat
				}
			};
			getInterface.jsonp(options, function(results) {

			});
		}
		loadAddresData();
	}

	//去下单
	$scope.toPay = function() {
		if(!$scope.orderInfo.linkname) {
			Xalert.loading('请填写联系人');
			return;
		} else if(!$scope.orderInfo.linktel) {
			Xalert.loading('请填写联系电话');
			return;
		} else if(!userInfo.checkMobile($scope.orderInfo.linktel)) {
			Xalert.loading('手机号输入有误，请重新输入');
			return;
		} else if(!$scope.orderInfo.detailaddres) {
			Xalert.loading('请填写详细地址');
			return;
		} else if(!$scope.serTime) {
			Xalert.loading('请选择' + $rootScope.serviceText + '时间');
			return;
		} else if(!$scope.nickname) {
			Xalert.loading('请选择' + $rootScope.technicianText);
			return;
		} else {

			var adressData = { //地址数据
				address: $scope.orderInfo.serAddress,
				addressinfo: $scope.orderInfo.detailaddres,
				longitude: lng,
				latitude: lat,
				code: cityCode
			}
			localStorage.setItem('selectedAddress', angular.toJson(adressData)); //地址数据
			//所选服务id 逗号隔开
			var serviceid = '';
			for(var i = 0; i < $scope.selectedData.length; i++) {
				if(i == 0) {
					serviceid = $scope.selectedData[i].itemid;
				} else {
					serviceid = serviceid + ',' + $scope.selectedData[i].itemid;
				}
			}
			confirmSelectedData.itemid = serviceid;
			localStorage.setItem('singleServiceSelectData', angular.toJson(confirmSelectedData)); //服务所选数据
			//时间数据添加处理 start
			var confirmSelectedTimes = angular.fromJson(localStorage.getItem('timeData'));
			confirmSelectedTimes.timeShow = $scope.serTime;
			localStorage.setItem('timeData', angular.toJson(confirmSelectedTimes)); //end
			//技师数据
			var techData = {
				my_beaticain: {
					beauticianid: beauticianid, //技师Id
					nickname: $scope.nickname, //技师名
					photo_two: $scope.photo_tow //技师头像
				}
			}
			localStorage.setItem('selectTechnician', angular.toJson(techData));
			var baseData = { //基础链接数据
				from: 2,
				userName: $rootScope.$_userInfo.user_name, //联系人
				userMobile: $rootScope.$_userInfo.user_mobile //电话
			}
			$state.go('submit-order', {
				data: angular.toJson(baseData)
			});
		}
	}

	//返回按钮
	$scope.goBackSelf = function() {
		history.go(-1);
	}
	//验证预约上门服务
	function checkServiceAdds(cb) {
		var options = {
			module: 'FM_APP_CHECK_VISIT',
			params: {
				citycode: cityCode,
				longitude: lng,
				latitude: lat,
				address: $scope.orderInfo.serAddress,
				addressinfo: $scope.orderInfo.detailaddres
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'N') {
				bFlag = true;
				Xalert.loading('很遗憾，您选择的上门地址目前超出计划范围了，我们会全力以赴尽快覆盖到您期望的计划区域,在此之前试试我们的线下店面？', 2000);
				return;
			} else {
				cb();
			}

		});
	}

	//推荐技师接口
	function recommendTechnician() {
		var options = {
			module: 'FM_APP_RECOMMED_HOME_BEAUTICIAN',
			params: {
				starttime: $scope.stime,
				my_itemid: interimb,
				city_code: cityCode,
				useradd_longitude: lng,
				useradd_latitude: lat
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'N') {
				errMsg = results.status;
				Xalert.loading(results.error_msg, 1000);
				return false;
			} else {
				$scope.nickname = results.results.nickname;
				$scope.photo_tow = results.results.photo;
				beauticianid = results.results.beauticianid
			}
		});
	}

});

app.filter('selfdate', function() {
	return function(value) {
		var oDate = new Date();
		oDate.setTime(value);

		function toDub(n) {
			return n < 10 ? '0' + n : '' + n;
		}

		var starDate = oDate.getFullYear() + '-' + toDub((oDate.getMonth() + 1)) + '-' + toDub(oDate.getDate()) + '  ' + toDub(oDate.getHours()) + ':' + (oDate.getMinutes() == 0 ? '00' : toDub(oDate.getMinutes()));
		return starDate;
	};
});
/*截取字符串长度 start*/
app.filter('cut', function() {
	return function(value, wordwise, max, tail) {
		if(!value) return '';

		max = parseInt(max, 10);
		if(!max) return value;
		if(value.length <= max) return value;

		value = value.substr(0, max);
		if(wordwise) {
			var lastspace = value.lastIndexOf(' ');
			if(lastspace != -1) {
				value = value.substr(0, lastspace);
			}
		}
		return value + (tail || '');
	};
});

app.filter('toDub', function() {
	return function(n) {

		return n < 10 ? '0' + n : '' + n;
	};
});