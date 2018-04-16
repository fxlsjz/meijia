'use strict';
/*我的套票
 author tzb
 */
app.controller('MyTicketCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, Authentication, $timeout, pageData, errorCode, userInfo, $cookies) {
	document.title = "我的套票";
	if(localStorage.getItem('sucess') && localStorage.getItem('sucess') == 'true') { //是否走了支付页面
		localStorage.removeItem('sucess');
		var stampItem = localStorage.getItem('stampItem');
		if(stampItem) {
			stampItem = angular.fromJson(stampItem);
			var expireDate = new Date();
			expireDate.setDate(expireDate.getTime() + 600000);
			$cookies.put('pid', stampItem.packageid, {
				'path': '/',
				'expires': expireDate
			}); //支付页面
			$cookies.put('oid1', stampItem.oid, {
				'path': '/',
				'expires': expireDate
			}); //解决返回问题（预约详情）
			localStorage.setItem('from', 'uselog');
			$state.go('my-use-log', {
				pid: stampItem.packageid,
				oid1: stampItem.oid
			});
		}
	}

	$scope.canLoadMore = true;
	$scope.pageoffset = 0; //页数
	$scope.v = 10; //每页数量
	$scope.items = [];
	var isloading = true; //是否加载
	var loadData = function() {
		var options = {
			module: 'FM_APP_PAGEAGE_LIST',
			params: {
				pagesize: $scope.v,
				pageoffset: $scope.pageoffset
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				angular.forEach(results.results, function(value, index) {
					$scope.items.push(value);
				})
				if(results.results.length < $scope.v) {
					$scope.canLoadMore = false;
					$scope.isShowLoadMore = false;
				}
				var result = results.results;
				if(!result || result.length == 0 || result.length % 10 != 0) {
					if(isloading == true)
						$scope.isShowLoadMore = false;
				} else {
					$scope.isShowLoadMore = true;
				}
				$scope.items.length == 0 ? $scope.counts = true : $scope.counts = false;
				setTimeout(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');

				}, 1000);
				//				isloading = !isloading;
			} else {
				Xalert.loading(results.error_msg, 1000);
			}
		});
	}
	loadData();
	$scope.loadMoreData = function(v) {
		if($scope.isShowLoadMore == false) {
			$scope.canLoadMore = false;
			return;
		}
		$scope.isShowLoadMore = true;
		if(v == 0) {
			$scope.pageoffset = 0;
			$scope.time = 0;
		} else if(v == $scope.v) {
			$scope.pageoffset = $scope.pageoffset + $scope.v;
			$scope.time = 500;
		} else {
			return false;
		}
		$timeout(function() {
			loadData();
		}, $scope.time);
	};
	//下拉刷新
	$scope.doRefresh = function() {
		isloading = true;
		$scope.canLoadMore = true;
		$scope.isShowLoadMore = false;
		$timeout(function() {
			$scope.items = [];
			$scope.pageoffset = 0;
			loadData();
			$scope.$broadcast('scroll.refreshComplete');
		}, 500);
	};
	//去使用
	$scope.toUse = function(item, $event) {
		$event.stopPropagation();
		//pageData.set(item);
		localStorage.setItem('stampItem', angular.toJson(item));
		console.log(localStorage.getItem('stampItem'));
		$state.go('my-ticket-order');
	}
	//使用记录
	$scope.useLog = function(item, $event) {
		$event.stopPropagation();
		var expireDate = new Date();
		expireDate.setDate(expireDate.getTime() + 600000);
		$cookies.put('pid', item.packageid, {
			'path': '/',
			'expires': expireDate
		}); //支付页面
		$cookies.put('oid1', item.oid, {
			'path': '/',
			'expires': expireDate
		}); //解决返回问题（预约详情）
		localStorage.setItem('from', 'uselog');
		localStorage.setItem('stampItem', angular.toJson(item));
		$state.go('my-use-log', {
			pid: item.packageid,
			oid1: item.oid
		});
	}
	//套票详情
	$scope.itemLine = function(item) {
		//$state.go('service-detail',{id:item.packageid,selected:'',form:'my-ticket'});
		item.itemid = item.packageid;
		localStorage.setItem('serviceItem', angular.toJson(item));
		localStorage.setItem('from', 'my-ticket');
		localStorage.setItem('type', 'SERVICE_MANY');
		$state.go('store-service-detail');
	}
});
//预约页面
app.controller('MyTicketOrderCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, pageData, userInfo, $cookies, $filter, pageData2, $timeout, $window, $location) {
	document.title = "预约";
	//	$scope.orderInformation = pageData.get();//所选套票
	$scope.isChose = true; //技师是否可选择
	if(localStorage.getItem('stampItem')) { //套票数据详情
		$scope.orderInformation = angular.fromJson(localStorage.getItem('stampItem'));
		var packageId = $scope.orderInformation.packageid; //套票id
		var oid = $scope.orderInformation.oid; //订单id
		var orderType = $scope.orderInformation.order_type; //订单类型
		//var storeId = $scope.orderInformation.storeid; // 店面id
		var iusetime = $scope.orderInformation.iusetime; //服务时长
		$scope.selBName = $scope.orderInformation.bname; //技师
		$scope.bphoto = $scope.orderInformation.bphoto; //技师头像
		$scope.bid = $scope.orderInformation.bid; //技师id
	}
	$scope.payWay = 0; // 余额标识
	var host = $location.host(); //域名
	//地址数据
	var citycode = $rootScope.selCityInfo.cityCode; //城市code
	var lng; //经度
	var lat; //纬度
	var address; //地址
	var interimb; // 服务Id
	$scope.sname = ''; //店面名称
	$scope.store_id = ''; //店面id
	var exeInterimb; //计算附加服务的服务Id的函数
	if($scope.bid == '' || $scope.bid == undefined) { //如果其中一项为空
		$scope.bphoto = '';
		$scope.selBName = '';
	} else {
		$scope.isChose = false;
	}
	$scope.orderInfo = {
		linkname: $rootScope.$_userInfo.user_name, //联系人名字
		linkphone: $rootScope.$_userInfo.user_mobile, //电话
		detailaddres: '',
		storename: $scope.orderInformation.storename, //店面名字or 服务地址
		bname: $scope.orderInformation.bname, //技师名字
		iname: $scope.orderInformation.iname, //
		remark: ''
	}

	//到店or到家
	var fnOrderType = function() {
		if($scope.orderInformation.order_type == 'ORDER_ONLINE') {
			return 'home';
		}
		return 'shop';
	}
	$scope.selectShow = true; //地址箭头
	fnOrderType() == 'shop' ? $scope.serAddress = $rootScope.serviceText + '店面' : $scope.serAddress = $rootScope.serviceText + '地址';
	$scope.bFlag == 'true' ? $scope.submitText = '立即下单' : $scope.submitText = '预约';

	if(fnOrderType() == 'shop') {
		address = $scope.orderInfo.storename;
		//		$scope.selectShow = false;
		orderType == 'ORDER_OFFLINE_ONLINE';
	} else {
		$scope.orderInfo.storename = $rootScope.curraddress;
		orderType == 'ORDER_ONLINE';
		//		$scope.selectShow = true;
		if($scope.orderInfo.storename || $rootScope.coordinate) {
			lng = $rootScope.coordinate.longitude;
			lat = $rootScope.coordinate.latitude;
		}
	}


	//选择服务店面
	$scope.selectAddres = function() {
		//if(fnOrderType() == 'shop') {
		//	return;
		//}
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		$state.go('store-choseStore');
		//$state.go('my-addrecss', {
		//		form: 'my-ticket-order'
		//});
	};
	
	//选择美甲师
	$scope.selTeachers = function() {
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		var selectTechnician = localStorage.getItem('selectTechnician');
		//if($scope.orderInformation.bid != '') return;
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		if(!$scope.sname) {
			Xalert.loading("请先选择" + $rootScope.serviceText + "店面");
			return;
		}
		//else if(!$scope.orderInfo.detailaddres && fnOrderType() == 'home') {
		//Xalert.loading('请填写详细地址');
		//	return;
		//}
		$scope.orderInformation = angular.fromJson(localStorage.getItem('selectStore'));
		$scope.store_id = $scope.orderInformation.store_id;  //店面id
		var params = {
			cityCode: citycode,
			store_id: $scope.store_id,
			store_type: orderType,
			lng: lng,
			lat: lat,
			packageId: packageId,
			form: 'store'
		}
		console.log(JSON.stringify(params));
		$state.go('home-technician', {
			data: angular.toJson(params)
		});
	}
	
	//选美甲服务
	$scope.seltService = function() {
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		if($scope.serTime) {
			$scope.serTime = '';
		}
		var params = {};
		//到店
		if(fnOrderType() == 'shop') {
			if(!$scope.sname) {
				Xalert.loading("请先选择" + $rootScope.serviceText + "店面");
				return;
			}
			if($scope.bid == undefined) {
				Xalert.loading('请选择' + $rootScope.technicianText);
				return;
			}
			params = {
				my_beaticain: {
					beauticianid: $scope.bid, //技师id
					nickname: $scope.selBName,
					photo_two: $scope.bphoto
				}
			}
			$scope.orderInformation = angular.fromJson(localStorage.getItem('selectStore'));
			$scope.store_id = $scope.orderInformation.store_id;
			localStorage.setItem('selectTechnician', angular.toJson(params));
			localStorage.setItem("type", 'SERVICE_SINGLE');
			localStorage.setItem("from", 'my-ticket-order');
			localStorage.setItem("stampTime", iusetime); //套票时间
			localStorage.setItem("serviceType", "SERVICE_OFFLINE");
			localStorage.setItem("storeId", $scope.store_id);
			$state.go('store-single-service');
		} else {
			if(!$scope.orderInfo.storename) {
				Xalert.loading('请先填写' + $rootScope.serviceText + '地址');
				return;
			}
			//			else if(!$scope.orderInfo.detailaddres) {
			//				Xalert.loading('请填写详细地址');
			//				return;
			//			} 
			else if($scope.bid == '') {
				Xalert.loading('请选择' + $rootScope.technicianText);
				return;
			}
			params = {
				my_beaticain: {
					beauticianid: $scope.bid, //技师id
					nickname: $scope.selBName,
					photo_two: $scope.bphoto
				}
			}
			localStorage.setItem('selectTechnician', angular.toJson(params));
			localStorage.setItem("type", 'SERVICE_SINGLE');
			localStorage.setItem("stampTime", iusetime); //套票时间
			localStorage.setItem("from", 'my-ticket-order');
			localStorage.setItem("serviceType", "SERVICE_ONLINE");
		}
		
	}
	
	//选择预约时间
	$scope.seltSerTime = function() {
		localStorage.setItem('peopleBase', angular.toJson($scope.orderInfo));
		var allTime = 0;
		var params = {};
		if(!$scope.sname) {
				Xalert.loading("请先选择" + $rootScope.serviceText + "店面");
				return;
			}
		if(!$scope.bid) {
			Xalert.loading('请选择' + $rootScope.technicianText);
			return;
		}
		//		if(!$scope.orderInfo.storename) {
		//			Xalert.loading('请先填写' + $rootScope.serviceText + '地址');
		//			return;
		//		}
		//		else if(!$scope.orderInfo.detailaddres && fnOrderType() == 'home') {
		//			Xalert.loading('请填写详细地址');
		//			return;
		//		}
		//		var otherTime = 0;
		//
		//		if($scope.selExtraService && $scope.selExtraService.length > 0) {
		//			for(var i = 0; i < $scope.selExtraService.length; i++) {
		//				otherTime += $scope.selExtraService[i].iusetime;
		//			}
		//		}
		//		if(parseInt($scope.orderInformation.iusetime) + parseInt(otherTime) < $rootScope.mintime) {
		//			Xalert.loading($rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟', 1000);
		//			return;
		//		}
		if($scope.selExtraService && $scope.selExtraService.length > 0) {

		} else {
			interimb = '';
		}
		$scope.orderInformation = angular.fromJson(localStorage.getItem('selectStore'));
		$scope.store_id = $scope.orderInformation.store_id;
		//if(fnOrderType() == 'shop') {
		params = {
			packageid: packageId,
			beauticianid: $scope.bid,
			item_id: interimb,
			store_id: $scope.store_id
		}
		//		} else {
		//			params = {
		//				packageid: packageId,
		//				longitude: lng,
		//				store_id: '',
		//				latitude: lat,
		//				citycode: citycode,
		////				beauticianid: bid,
		////				item_id: interimb
		//			}
		//		}

		//		if($scope.bFlag == 'true') {
		//			angular.forEach($scope.selExtraService, function(value, index) {
		//				allTime += parseInt(value.iusetime);
		//			});
		//			$cookies.put('allTime', allTime);
		//		}
		$state.go('service-time', {
			form: 'my-ticket-order',
			data: angular.toJson(params)
		});
	};

	//技师服务范围
	var loadHomeGeoData = function() {
		var options = {
			module: 'FM_APP_PACKAGE_BEAUTICIAN_RANGE',
			params: {
				longitude: lng, //
				latitude: lat, //
				citycode: citycode, //
				beauticianid: bid, //技师Id
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'N') {
				Xalert.loading(results.error_msg, 1000);
				return;
			} else {
				if(results.results.inrange == 'N') {
					$scope.isShowTip = true;
				} else {
					$scope.isShowTip = false;
				}

			}
		});
	};

	
	
	var interima = '';
	//附加服务的服务Id
	exeInterimb = function() {
		interima = '';
		if($scope.selExtraService) {
			angular.forEach($scope.selExtraService, function(value, index) {
				interima = interima + value.itemid + ',';
			});

			interimb = interima.substring(0, interima.length - 1);
		}
	};

	var bSign = false;
	var removePopup;
	$scope.$on('$stateChangeStart', function(event, toState, fromState) {
		if(bSign) {
			removePopup.close();
		}
	});

	//编辑所选服务
	$scope.deleItem = function(index, item) {
		bSign = true;
		removePopup = $ionicPopup.show({
			template: '<p style="margin: 2em 0; text-align: center">确定删除该' + $rootScope.serviceText + '？</p>',
			scope: $scope,
			buttons: [{
				text: '<font color="#999">取消</font>',
				onTap: function() {
					bSign = false;
				}
			}, {
				text: '<font color="#333">删除</font>',
				type: 'button-positive',
				onTap: function(e) {
					if($scope.serTime) {
						$scope.serTime = '';
					}

					$scope.selExtraService.splice(index, 1);
					if(localStorage.getItem('singleServiceSelectData')) {
						var serviceData = angular.fromJson(localStorage.getItem('singleServiceSelectData'));
						serviceData.selectedData = $scope.selExtraService;
						localStorage.setItem('singleServiceSelectData', angular.toJson(serviceData))
					}
					if(localStorage.getItem('singleServiceSelectDataCopy')) {
						var serviceData = angular.fromJson(localStorage.getItem('singleServiceSelectDataCopy'));
						serviceData.selectedData = $scope.selExtraService;
						localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(serviceData))
					}

					localStorage.removeItem('timeData');

					//编辑的时候重新计算interimb
					if($scope.selExtraService.length > 0) {
						exeInterimb(); //计算服务ID 
						$scope.loadPricesData();
						$scope.submitText = '立即下单';
						$scope.bFlag = 'true';
					}
					if($scope.selExtraService.length == 0) {
						localStorage.removeItem('singleServiceSelectData')
						localStorage.removeItem('singleServiceSelectDataCopy')
						$cookies.remove('isExeSer')
						$scope.bFlag = 'false';
						$scope.submitText = '预约';
					}
					bSign = false;
				}
			}]
		})
	};
	

	//计算价格
	$scope.$watch('selExtraService', function() {
		if(!interimb) {
			interimb = '';
		}
		if($scope.bFlag == 'true') {
			$scope.loadPricesData = function() {
				var options = {
					module: 'FM_APP_PACKAGE_ORDER',
					params: {
						oid: oid, //套票订单
						iteminfo: interimb, //服务id
						packageid: packageId, //套票id
						beautician: $scope.bid
					}
				};
				getInterface.jsonp(options, function(results) {
					if(results.status == 'Y') {
						$scope.balance = results.results.balance; //账户余额
						$scope.actualprice = results.results.actualprice; //合计金额
						$scope.orderprice = results.results.orderprice; //服务金额
						if(parseFloat($scope.orderprice) > parseFloat(results.results.balance) || parseFloat(results.results.balance) == 0) {
							$scope.noSelect = {
								pointerEvents: 'none'
							};
							pointerEvents: 'none'
						} else {
							//$scope.payWay = 0;
						}
					} else {
						Xalert.loading(results.error_msg, 1000);
						return;
					}
				});
			};
			$scope.loadPricesData();
		}
	});

	/*微信支付*/
	var weiOid; //订单Id
	var paytype; //支付方式
	var weiactualprice // 实际支付金额

	$scope.selPayWay = function(n) {
			$scope.payWay = n;
			if(fnOrderType() == 'shop') {
				if(n == 2) {
					orderType = 'ORDER_OFFLINE_OFFLINE'; //到店
				} else {
					orderType = 'ORDER_OFFLINE_ONLINE'; //到店线上
				}
			}
			$scope.loadPricesData();
		}
		//预约

	$scope.onOrdered = function() {
		if(!$scope.orderInfo.linkname) {
			Xalert.loading('请添加联系人姓名');
			return;
		} else if(!$scope.orderInfo.linkphone) {
			Xalert.loading('请添加联系人手机号');
			return;
		} else if(!userInfo.checkMobile($scope.orderInfo.linkphone)) {
			Xalert.loading('手机号输入有误，请重新输入');
			return;
		}else if(!$scope.sname){
			Xalert.loading("请先选择" + $rootScope.serviceText + "店面");
			return;
		}
//		else if(!$scope.orderInfo.storename) {
//			Xalert.loading('请选择' + $rootScope.serviceText + '地址');
//			return;
//		} 
		else if($scope.orderInfo.linkname && $scope.orderInfo.linkphone && $scope.sname) {
			if(fnOrderType() == 'shop') {
				if(!$scope.bid) {
					Xalert.loading('请选择' + $rootScope.technicianText);
					return;
				}else if(!$scope.serTime) {
					Xalert.loading('请选择预约时间');
					return;
				}
			} else {
				//				if(!$scope.orderInfo.detailaddres) {
				//					Xalert.loading('请填写详细地址');
				//					return;
				//				} else {
				//					if(bid != '') {
				//						if(!$scope.serTime) {
				//							Xalert.loading('请选择预约时间');
				//							return;
				//						}
				//					} else {
				//						if(bid == '') {
				//							Xalert.loading('请选择' + $rootScope.technicianText);
				//							return;
				//						}
				//						if(!$scope.serTime) {
				//							Xalert.loading('请选择预约时间');
				//							return;
				//						}
				//					}
				//				}
				if($scope.bid != '') {
					if(!$scope.serTime) {
						Xalert.loading('请选择预约时间');
						return;
					}
				} else {
					if($scope.bid == '') {
						Xalert.loading('请选择' + $rootScope.technicianText);
						return;
					}
					if(!$scope.serTime) {
						Xalert.loading('请选择预约时间');
						return;
					}
				}
			}
			$scope.orderInformation = angular.fromJson(localStorage.getItem('selectStore'));
			$scope.store_id = $scope.orderInformation.store_id;
			$scope.sname = $scope.orderInformation.sname;
			//是否有附加服务判断
			if($scope.bFlag == 'true') {
				if($scope.payWay == 0) {
					paytype = 'PAYTYPE_PRICE'; //我的钱包
				} else if($scope.payWay == 1) {
					paytype = 'PAYTYPE_WECHATWEB'; //微信支付
				} else {
					paytype = ''; //到店支付
				}
				var remark = $scope.orderInfo.remark ? $scope.orderInfo.remark : '';
				//生成订单
				var loadPricesDatas = function() {
					//					alert('生成订单');
					var options = {};
					if(fnOrderType() == 'shop') {
						options = {
							module: 'FM_APP_PACKAGE_ORDER',
							params: {
								oid: oid, //套票订单
								iteminfo: interimb, //服务id
								packageid: packageId, //套票id
								beautician: $scope.bid,
								order_type: orderType,
								paytype: paytype, //支付方式
								order_name: $scope.orderInfo.linkname, //联系人
								order_phone: $scope.orderInfo.linkphone, //联系电话
								address: $scope.sname,
								remark: remark,
								store_type: 'STORE_TYPE_SINGLE',
								order_stime: $scope.stime,
								store_id: $scope.store_id
							}
						};
					} else {
						//如果为当前定位的地址，address的值
						address = $scope.orderInfo.storename + $scope.orderInfo.detailaddres;
						options = {
							module: 'FM_APP_PACKAGE_ORDER',
							params: {
								oid: oid, //套票订单
								iteminfo: interimb, //服务id
								packageid: packageId, //套票id
								beautician: $scope.bid,
								order_type: orderType, //到家
								paytype: paytype, //支付方式
								order_name: $scope.orderInfo.linkname, //联系人
								order_phone: $scope.orderInfo.linkphone, //联系电话
								address: $scope.sname,
								order_stime: $scope.stime,
								citycode: citycode,
								remark: remark,
								useradd_longitude: lng,
								useradd_latitude: lat
							}
						};

					}

					getInterface.jsonp(options, function(results) {
						if(results.status == 'Y') {
							weiOid = results.results.oid;
							localStorage.weiOid = weiOid // 支付页面使用
							weiactualprice = results.results.actualprice;
							var weibalance = results.results.balance;
							//			            	var weitime = '1000';//时间
							$timeout(function() {
								if($scope.payWay == 0 || $scope.payWay == 2) {
									localStorage.setItem('sucess', true);
									history.go(-1)
								} else {
									if(weiOid) {
										//			           					alert(weiactualprice);
										var company_id = $cookies.get('company_id');
										var pid = $scope.orderInformation.packageid;
										var oid = $scope.orderInformation.oid;

										var backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/my/use-log/?pid=' + pid + '&oid1=' + oid;
										var payLink = $rootScope.payPath;
										var link = payLink + 'actualprice=' + weiactualprice + '&oid=' + weiOid + '&company_id=' + company_id + '&processType=' + 'subscribe';
										localStorage.setItem('sucess', true);
										$window.location.href = link + backLink;
										return;
									}

								}

							}, 500);
						} else {
							Xalert.loading(results.error_msg, 1000);
							return;
						}
					});
				};
				if(interimb != '') {
					loadPricesDatas();
				}

			} else {
				var options = {};
				var remark = $scope.orderInfo.remark ? $scope.orderInfo.remark : '';
				var loadData = function() {
					if(fnOrderType() == 'shop') {
						options = {
							module: 'FM_APP_PACKAGE_APPOINTMENT',
							params: {
								oid: oid, //套票订单id
								packageid: packageId, //套票id
								order_name: $scope.orderInfo.linkname, //联系人
								order_phone: $scope.orderInfo.linkphone, //联系电话
								address: $scope.sname, //地址信息？
								remark: remark, //客户留言
								order_type: orderType, //上门还是店面
								beautician: $scope.bid, //技师Id
								order_stime: $scope.stime,
								store_id: $scope.store_id
							}
						};
					} else {
						address = $scope.orderInfo.storename + $scope.orderInfo.detailaddres;
						options = {
							module: 'FM_APP_PACKAGE_APPOINTMENT',
							params: {
								oid: oid, //套票订单id
								packageid: packageId, //套票id
								order_name: $scope.orderInfo.linkname, //联系人
								order_phone: $scope.orderInfo.linkphone, //联系电话
								address: $scope.sname, //地址信息？
								remark: remark, //客户留言
								order_type: orderType, //上门还是店面
								beautician: $scope.bid, //技师Id
								order_stime: $scope.stime,
								citycode: citycode,
								useradd_longitude: lng,
								useradd_latitude: lat
							}
						};

					}
					getInterface.jsonp(options, function(results) {
						if(results.status == 'Y') {
							Xalert.loading('预约成功');
							localStorage.setItem('sucess', true);
							//							localStorage.clear();
							history.go(-1)
						} else {
							Xalert.loading(results.error_msg, 1000);
						}
					});
				}
				loadData();
			}
		}

	}
	$scope.orderInformation = '';
	//跳转监听
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		switch(fromState.name) {

			case 'store-single-service': //服务列表返回
				if(localStorage.getItem('peopleBase'))
					$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				loadService();
				loadTechnician();
				var selectServieData = localStorage.getItem('selectServieData');
				localStorage.removeItem('selectServieData')
				if(!selectServieData) {
					//alert(1);
					loadTimeData();
					loadAdresss();
				} else {
					//alert(2);
					localStorage.removeItem('timeData');
					loadAdresss();
					loadTechnician();
				}
				break;
			case 'store-service-detail': //服务详情返回
				if(localStorage.getItem('peopleBase'))
					$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				loadService();
				loadAdresss();
				loadTechnician();
				var selectServieData = localStorage.getItem('selectServieData');
				localStorage.removeItem('selectServieData')
				if(!selectServieData) {
					//alert(3);
					//$scope.bFlag = 'false';
					localStorage.removeItem('timeData');
				} else {
					//alert(4);
					loadTimeData();

				}
				break;
			case 'service-time': //服务时间返回
				$scope.bFlag = 'false';
				interima = '';
				interimb = '';
				exeInterimb();
				if(localStorage.getItem('peopleBase'))
					$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				loadTimeData();
				loadService();
				loadTechnician();
				loadAdresss();
				
				//				loadAdresss();
				break;
			case 'home-technician': //技师返回
				if(localStorage.getItem('peopleBase'))
					$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				//				loadAdresss();
				loadTechnician();
				var selected = localStorage.getItem('selected');
				localStorage.removeItem('selected');
				if(!selected) {
					loadTimeData();
					loadService();
					loadAdresss();
				} else {
					localStorage.removeItem('timeData');
					localStorage.removeItem('singleServiceSelectData');
					loadAdresss();
					loadTechnician();
					
				}

				break;
			case 'beautician-detail': //技师详情
				if(localStorage.getItem('peopleBase'))
					$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				loadTechnician();
				var selected = localStorage.getItem('selected');
				localStorage.removeItem('selected')
				if(!selected) {
					loadTimeData();
					loadService();
					loadAdresss();
				} else {
					localStorage.removeItem('timeData');
					localStorage.removeItem('singleServiceSelectData');
					loadAdresss();
					loadTechnician();
				}

				break;

			case 'store-choseStore': //地址返回
				if(localStorage.getItem('peopleBase'))
					$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				
				$scope.orderInformation = angular.fromJson(localStorage.getItem('selectStore'));
				$scope.store_id = $scope.orderInformation.store_id;
//				console.log($scope.orderInformation);
//				$scope.sname = $scope.orderInformation.sname;
				loadAdresss();
				var selected = localStorage.getItem('selectStoreType');
				localStorage.removeItem('selectStoreType');
				if(!selected) {
					loadTimeData();
					loadService();
					loadTechnician();
				} else {
					localStorage.removeItem('timeData');
					localStorage.removeItem('singleServiceSelectData');
					localStorage.removeItem('selectTechnician');
				}

				if(localStorage.getItem('stampItem')) {
					$scope.orderInformation = angular.fromJson(localStorage.getItem('stampItem'));
					var packageId = $scope.orderInformation.packageid; //套票id
					var oid = $scope.orderInformation.oid; //订单id
					var orderType = $scope.orderInformation.order_type; //套票类型
					var storeId = $scope.orderInformation.storeid; // 店面id
					var iusetime = $scope.orderInformation.iusetime; //
				}
				break;
			case 'order-order-rule': //下单需知
				$scope.bFlag = 'true';
				interima = '';
				interimb = '';
				exeInterimb();
				if(localStorage.getItem('peopleBase'))
					$scope.orderInfo = angular.fromJson(localStorage.getItem('peopleBase'));
				loadTimeData();
				loadService();
				loadTechnician();
				break;
		}
	});
		//地址数据加载
	var loadAdresss = function() {
			var selAddress = localStorage.getItem('selectStore')
	        if (selAddress) {
	            selAddress = angular.fromJson(selAddress);
	            $scope.sname = selAddress.sname;
	            // $scope.orderInfo.detailaddres = selAddress.addressinfo;
	            $scope.storeId = selAddress.store_id;
	        }
		}
		//加载技师数据
	var loadTechnician = function() {
			var selectTechnician = localStorage.getItem('selectTechnician')
			if(localStorage.getItem('selectTechnician')) {
				selectTechnician = angular.fromJson(selectTechnician);
				$scope.selBName = selectTechnician.my_beaticain.nickname; //技师
				$scope.bphoto = selectTechnician.my_beaticain.photo_two; //技师头像
				$scope.bid = selectTechnician.my_beaticain.beauticianid; //技师id
			}
		}
		//加载服务数据
	var loadService = function() {
			var serviceData = localStorage.getItem('singleServiceSelectData');
			if(serviceData) {
				serviceData = angular.fromJson(serviceData);
				if(serviceData.selectedData.length > 0) {
					$scope.selExtraService = serviceData.selectedData;
					$scope.bFlag = 'true';
					exeInterimb();
				}
				//编辑的时候重新计算interimb
				if($scope.selExtraService.length > 0) {
					$scope.submitText = '立即下单';
					$scope.bFlag = 'true';
				}
				if($scope.selExtraService.length == 0) {
					localStorage.removeItem('singleServiceSelectData')
					localStorage.removeItem('singleServiceSelectDataCopy')
					$cookies.remove('isExeSer')
					$scope.bFlag = 'false';
					$scope.submitText = '预约';
				}
			} else {
				$scope.bFlag = 'false';
			}

		}
		//加载时间数据
	var loadTimeData = function() {
		var ticketordertimes = localStorage.getItem('timeData');
		if(localStorage.getItem('timeData')) {
			ticketordertimes = angular.fromJson(ticketordertimes);
			var timeItem = ticketordertimes.time_item; //开始时间 hh:mm
			var serviceData = localStorage.getItem('singleServiceSelectData');
			$scope.stime = ticketordertimes.starttime; //开始时间 y-m-d hh:mm
			if(serviceData) {
				serviceData = angular.fromJson(serviceData);
				$scope.atime = parseInt(serviceData.time) + parseInt(iusetime);
			} else {
				$scope.atime = iusetime;
			}
			$scope.serTime = $filter('timeSelf')($scope.stime, $scope.atime, 0);
		}
	}
});

//使用记录控制器
app.controller('MyTicketUseLogCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, $ionicActionSheet, $timeout, $window, $cookies, pageData) {
	document.title = "使用记录";
	
	localStorage.removeItem('oid');
	localStorage.removeItem('book_time');
	localStorage.removeItem('serviceEvaluate');
	localStorage.removeItem('serviceEvaluateList');
	localStorage.removeItem('oid');
	localStorage.removeItem("technicianEvaluate");
	
    
	var packageid = $stateParams.pid;
	var oid = $stateParams.oid1;
	if(localStorage.getItem('stampItem'))
	var stampItem = angular.fromJson(localStorage.getItem('stampItem'));
	$scope.canLoadMore = true;
	$scope.pageoffset = 0;
	$scope.items = [];
	$scope.v = 10;
	if($stateParams.pid) {
		var expireDate = new Date();
		expireDate.setDate(expireDate.getTime() + 2000000);
		$cookies.put('pid', packageid, {
			'path': '/',
			'expires': expireDate
		}); //支付页面
		$cookies.put('oid1', oid, {
			'path': '/',
			'expires': expireDate
		}); //支付页面
	}
	var loadData = function() {
			var options = {
				module: 'FM_APP_PAGEAGE_LOGS',
				params: {
					pagesize: $scope.v,
					pageoffset: $scope.pageoffset,
					packageid: packageid,
					oid: oid
				}
			};
			getInterface.jsonp(options, function(results) {
				if(results.status == 'Y') {
					angular.forEach(results.results, function(value, index) {
						$scope.items.push(value);
					})
					if(results.results.length < $scope.v) {
						$scope.canLoadMore = false;
					}
					$scope.items.length == 0 ? $scope.counts = true : $scope.counts = false;
					setTimeout(function() {
						$scope.$broadcast('scroll.infiniteScrollComplete');

					}, 1000);
				} else {
					Xalert.loading(results.error_msg, 1000);
				}
			});
		}
		//	loadData();

	$scope.loadMoreData = function(v) {
		if(v == 0) {
			$scope.pageoffset = 0;
			$scope.time = 0;
		} else if(v == $scope.v) {
			$scope.pageoffset = $scope.pageoffset + $scope.v;
			$scope.time = 500;
		} else {
			return false;
		}
		$timeout(function() {
			loadData();
		}, $scope.time);
	};
	//下拉刷新
	$scope.doRefresh = function() {
		$timeout(function() {
			$scope.items = [];
			$scope.pageoffset = 0;
			loadData();
			$scope.$broadcast('scroll.refreshComplete');
		}, 500);
	};
	$scope.orderState = function(i) {
		$scope.state = i;
		if(!$rootScope.appValues) {
			return $scope.state = '';
		}
		return $scope.state = $rootScope.appValues[$scope.state].dic_desc;
	};
	//	$scope.isShowBtn = function(state){
	//		if(state =='orderstate_waitservice'){
	//			return $scope.isShowSer = 2;
	//		}else if(state == 'orderstate_appointment'){
	//			return $scope.isShowSer = 1;
	//		}
	//	};
	//状态颜色控制
	$scope.isShowSkins = function(state) {
		if(state == 'orderstate_waitpay' || state == 'orderstate_appointment' || state == 'orderstate_waitrefund' || state == 'orderstate_inservice') {
			return $scope.isShowSkin = true;
		}
	};
	//详情跳转
	$scope.toLink = function(item) {
		localStorage.setItem('uselogDetail', angular.toJson(item))
		$state.go('my-uselog-detail');
	};

	//列表状态为“未支付”，“已过期”状态不提供跟踪入口 
	$scope.slotText = function(i) {
		$scope.state = i;
		if(stampItem.storeid && stampItem.storeid != null && stampItem.storeid != '') {} else {
			if(!(($scope.state == 'orderstate_waitpay') || ($scope.state == 'orderstate_expire'))) {
				return $scope.slot = '跟踪';
			}
		}

	};
	
	
	
	//跟踪事件
	$scope.onSlot = function(item, $event) {
		$event.stopPropagation();
		$state.go('order-track-order', {
			oid: item.orid
		});
	};
	
	//评价服务
    $scope.evaluateService = function (item) {
        var serviceList = item.itemlist;
        var items = [];
        for (var i = 0; i < serviceList.length; i++) {
            if (serviceList[i].iscommon == 'Y') {
                items.push(serviceList[i]);
            }
        }
        localStorage.setItem('oid', item.oid);
        localStorage.setItem('book_time', item.book_time);
        console.log(item.oid)
        console.log(localStorage.getItem('book_time', item.book_time))
        if (items.length == 1) {
            localStorage.setItem('serviceEvaluate', angular.toJson(items[0]));
            $state.go('order-evaluate');//跳转评价页面
            return;
        }
        localStorage.setItem('serviceEvaluateList', angular.toJson(items));
        $state.go('order-evaluate-service');
    }
    //评价技师
    $scope.evaluateTechnician = function (item) {
    	console.log(item);
        var beauticianList = [];
        //全部不可评价
        if (item.beautician.biscommon == "N" && item.biscommon == "N") {
            return;
        }
        //我的技师可评价
        if (item.beautician.biscommon && item.biscommon == "Y") {
            beauticianList.push(item.beautician);
        }
        //他的技师可评价
		//      if (item.beautician_other.biscommon && item.beautician_other.biscommon == "Y") {
		//          beauticianList.push(item.beautician_other);
		//      }
        //订单id
        localStorage.setItem('oid', item.oid);
        //只有一个可评价
        if (beauticianList.length == 1) {
            localStorage.setItem("technicianEvaluate", angular.toJson(beauticianList[0]));
            $state.go('order-evaluate');//跳转评价页面
            return;
        }
        //两个技师都可评价
        localStorage.setItem("evaluateTechnician", angular.toJson(beauticianList));
        $state.go('order-evaluate-technician');//跳转评价列表
    }

	//预约记录支付
	$scope.topay = function(item, $event) {
		localStorage.backoid = oid; //支付页面
		$event.stopPropagation();
		var loadData = function() {
			var options = {
				module: 'FM_APP_GET_PACKAGEINFO',
				params: {
					orid: item.orid,
				}
			};
			getInterface.jsonp(options, function(results) {
				if(results.status == 'Y') {
					$scope.tickerInfo = results.results;
					var time = $scope.tickerInfo.pay_surtime;
					var actualprice = $scope.tickerInfo.actualprice;

					$state.go('my-pay', {
						oid: item.oid,
						actualprice: actualprice,
						balance: item.balance,
						time: time,
						type: 'ticket',
						processType: 'ticketList'
					});

				} else {
					Xalert.loading(results.error_msg, 1000);
				}
			});
		}
		loadData();

	}
	$scope.cancelOrder = function(orid, $event) {
		$event.stopPropagation();
		var removePopup;
		$scope.$on('$destroy', function() {
			removePopup.close();
		});
		removePopup = $ionicPopup.show({
			template: '<p style="margin: 2em 0; text-align: center;font-family:微软雅黑;">是否取消预约？</p>',
			scope: $scope,
			buttons: [{
				text: '<font color="#999">取消</font>',
				onTap: function() {

				}
			}, {
				text: '<font color="#333">确定</font>',
				type: 'button-positive',
				onTap: function(e) {
					var loadData = function() {
						var options = {
							module: 'FM_APP_PACKAGE_ORDER_CANCEL',
							params: {
								orid: orid,
							}
						};
						getInterface.jsonp(options, function(results) {
							if(results.status == 'Y') {
								Xalert.loading('取消成功', 1000);
								$window.location.reload();
							} else {
								Xalert.loading(results.error_msg, 1000);
							}
						});
					}
					loadData();
				}
			}]
		})

	}
	$scope.$on('refresh', function(data) {
		if(data == 0) {
			$window.location.reload();
		}
	});
	//返回
	$scope.stampback = function() {
		localStorage.clear();
		history.go(-1)

	}
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(toState.name == 'my-use-log') {
			$scope.doRefresh();
		}

	});

});
//预约详情控制器
app.controller('MyTicketUseLogDetailCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, pageData, $timeout, $window, $interval, $filter, $cookies) {
	document.title = "预约详情";
	var uselogDetail = angular.fromJson(localStorage.getItem('uselogDetail'));
	var orid = uselogDetail.orid;
	$scope.isColor = 'true';
	var loadData = function() {
		var options = {
			module: 'FM_APP_GET_PACKAGEINFO',
			params: {
				orid: orid,
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				$scope.tickerInfo = results.results;
				console.log($scope.tickerInfo);
				if($scope.tickerInfo.service_list && ($scope.tickerInfo.service_list.length > 0)) {
					$scope.showOtherService = true;
				}
				if($scope.tickerInfo.cancel_able == 'Y') {
					document.getElementById('mainContent').style.bottom = '5.4rem'
				} else {
					document.getElementById('mainContent').style.bottom = '0rem';
				}

				/*倒计时*/
				$scope.paytext = '去支付';
				var text = '确认支付';
				var lbracket = '(';
				var rbracket = ')';
				var timer = null;
				if($scope.tickerInfo.pay_surtime > 0) {
					$interval.cancel(timer);
					timer = $interval(function() {
						$scope.tickerInfo.pay_surtime--;
						if(Math.floor($scope.tickerInfo.pay_surtime) <= 0) {
							$scope.tickerInfo.pay_surtim = 0;
							$interval.cancel(timer);
							$rootScope.$emit('refresh', 0);
							$timeout(function() {
								$window.location.reload();
							}, 500);

							$scope.btnclick = {
								background: '#dedede',
								pointerEvents: 'none'
							};
						}
						var minute = Math.floor(Math.floor($scope.tickerInfo.pay_surtime) / 60);
						var second = Math.floor($scope.tickerInfo.pay_surtime) % 60;
						if(minute > 0) {
							$scope.paytext = text + lbracket + $filter('toDub')(minute) + '分' + $filter('toDub')(second) + '秒 ' + rbracket
						} else {
							$scope.paytext = text + lbracket + $filter('toDub')(second) + '秒' + rbracket;
						}
					}, 1000)
				} else {
					$scope.isColor = 'false';
				}
			} else {
				Xalert.loading(results.error_msg, 1000);
			}
		});
	}

	loadData();
	$scope.$on('refresh', function(data) {
		if(data == 0) {
			//      	alert(1);
			$window.location.reload();
		}
	});
	//返回上一页
	$scope.backBefore = function() {
		history.go(-1)
	}

	$scope.orderState = function(i) {
		$scope.state = i;
		if(!$rootScope.appValues) {
			return $scope.state = '';
		}
		return $scope.state = $rootScope.appValues[$scope.state].dic_desc;
	};
	//取消预约
	$scope.cancelOrder = function() {
		var removePopup;
		$scope.$on('$destroy', function() {
			removePopup.close();
		});
		removePopup = $ionicPopup.show({
			template: '<p style="margin: 2em 0; text-align: center;font-family:微软雅黑;">是否取消预约？</p>',
			scope: $scope,
			buttons: [{
				text: '<font color="#999">取消</font>',
				onTap: function() {

				}
			}, {
				text: '<font color="#333">确定</font>',
				type: 'button-positive',
				onTap: function(e) {
					var cancleloadData = function() {
						var options = {
							module: 'FM_APP_PACKAGE_ORDER_CANCEL',
							params: {
								orid: orid,
							}
						};
						getInterface.jsonp(options, function(results) {
							if(results.status == 'Y') {
								Xalert.loading('取消成功', 1000);
								$timeout(function() {
									//                                      	$state.reload();
									$window.location.reload();
								}, 1200);
								loadData();
							} else {
								Xalert.loading(results.error_msg, 1000);
							}
						});
					}
					cancleloadData();
				}
			}]
		})

	};
	
	//预约详情支付
	$scope.topay = function() {
			var time = $scope.tickerInfo.pay_surtime;
			$state.go('my-pay', {
				oid: $scope.tickerInfo.oid,
				actualprice: $scope.tickerInfo.actualprice,
				balance: $stateParams.balance,
				time: time,
				type: 'ticket',
				processType: 'ticketDetail'
			});
		}
		//返回按钮
	$scope.goBack = function() {
		//		$state.go('my-use-log', { pid: pid, oid1: oid1 });
		history.go(-1);
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