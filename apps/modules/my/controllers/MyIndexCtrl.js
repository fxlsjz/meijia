'use strict';
/*
 我的主控制器
 */
app.controller('MyIndexCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, userInfo, $cookies, $location, Authentication) {
	document.title = "我的";
	$scope.trueOrFalse = true; //是否显示防伪验证
	$scope.showMyTicket = false; //是否显示我的套票true:显示；false：不显示

	if($rootScope.appValues && $rootScope.appValues.IS_FAKE && $rootScope.appValues.IS_FAKE.dic_desc == "Y") {
		$scope.trueOrFalse = true;
	} else {
		$scope.trueOrFalse = false;
	}
//	if(!$rootScope.appValues ||
//		(!$rootScope.appValues.IS_PACKAGE || $rootScope.appValues.IS_PACKAGE.dic_desc == 'N') ) {
//		$scope.showMyTicket = false;
//	} else {
//		$scope.showMyTicket = true;
//	}

	//登录状态下，调3.3接口
	if($rootScope.$_userInfo.user_name) {
		var options = {
			module: 'FM_APP_USER_INFO',
			params: {}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				$scope.myAllCounts = results.results;
			}
		});
	} else {

	}

	$scope.contactTo = function() {
		if($scope.userInfo) return; //还为完善
		$state.go('login');
	}
	$scope.shopCar = function() {
		var timestamp = Date.parse(new Date()) + '';
		$state.go('my-car', {
			timestamp: timestamp
		});
	};
	//  我的收藏
	$scope.MyCollect = function() {
			$state.go('my-mycollect');
		}
		//商品订单
	$scope.MyCommodity = function() {
			var timestamp = Date.parse(new Date()) + '';
			$state.go('my-commoditylist', {
				timestamp: timestamp
			});
		}
		//服务订单
	$scope.goServiceListTwo = function() {
			var timestamp = Date.parse(new Date()) + '';
			$state.go('order-order-list-two', {
				timestamp: timestamp
			});
		}
		//修改个人资料
	$scope.ModifyData = function() {
		localStorage.removeItem('modify_user_name');
		localStorage.removeItem('modify_user_sex');
		localStorage.removeItem('modify_user_mobile');
		$state.go('my-modify-data');
	}

	/*跳转监听*/
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		if(fromState.name == 'tab.home') {
			$rootScope.clearServiceOrderData(); //清空数据
		}
	});
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

/*
 我的设置
 */
app.controller('SeetingCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, userInfo, $window, $cookies, Authentication) {
	document.title = "设置";
	//获取手机号,打电话
	$scope.tel_num = $rootScope.appValues ? $rootScope.appValues.SYSTEM_CONTACTUS_PHONE.dic_desc : '';
	//获取广告图
	$scope.adPicPath = $rootScope.appValues ? $rootScope.appValues.ADERVERTISEMENT_IMG.dic_desc : "";

	$scope.signOut = function() {
			$ionicPopup.show({
				template: '<p style="margin: 2em 0; text-align: center;font-family:微软雅黑;">亲，您确定要退出吗？</p>',
				scope: $scope,
				buttons: [{
					text: '<font color="#999">取消</font>'
				}, {
					text: "确定",
					type: 'button-positive',
					onTap: function(e) {
						userInfo.logout();
						Xalert.loading('退出成功', 500);
						setTimeout(function() {
							//$window.location.href = '/tab/home';
							$state.go('tab.home');
						}, 800);
					}
				}]
			})
		}
		//跳转地址列表
	$scope.MyAddress = function() {
		$state.go('my-addrecss', {
			form: 'my-seeting'
		});
	}

});

//广告页
app.controller('MyAD', function($rootScope, $scope, $state, getInterface, sourseChange, $ionicPopup, Xalert, $timeout) {
	//获取广告图
	$scope.adPic = $rootScope.appValues ? $rootScope.appValues.ADERVERTISEMENT_IMG.dic_desc : '';
});

/*
 服务地址填写
 author caixiaojuan
 */
app.controller('ServiceReadCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService) {

});
/*
 物流详情
 author caixiaojuan
 */
app.controller('SendDetail', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService) {

	//返回上一页
	$scope.onBackPressed = function() {
		history.go(-1);
	}

	var oid = $stateParams.id;
	var loadData = function() {
		var options = {
			module: 'FM_SHOP_DELIVERY_INFO',
			params: {
				oid: oid
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				$scope.SendDetail = results.results;
			}
		});
	}
	loadData();

});
/*
 *扫一扫主控制器
 */
app.controller('ScanItCtrl', function($rootScope, $scope, QyWechat, $ionicGesture, $state, $timeout, $ionicPlatform, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService) {

	/*-------验证--------*/
	$scope.securitycode = {
		key: ''
	}; //防伪码
	$scope.verify = function() {
		if($scope.securitycode.key) {
			$state.go('my-scan-detail', {
				'code': $scope.securitycode.key
			});
		} else {
			Xalert.loading('请输入防伪码。');
		}
	}
});

/*
 防伪验证详情
 */
app.controller('ScanDetailCtrl', function($rootScope, $scope, $timeout, QyWechat, $ionicGesture, $state, $ionicPlatform, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService) {

	var securitycode = $stateParams.code;

	var loadData = function() {
		var options = {
			module: 'FM_SHOP_ANTI_FAKE',
			params: {
				securitycode: securitycode,
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'N') {
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
			$scope.item = results.results;
		});
	}
	loadData();

	//返回
	$scope.scanGoback = function() {
		//此处使用js原生方式回退
		history.go(-1)
	}

});

/*我的收藏
 author wanghui
 */

//我的收藏

app.controller('MyCollectCtrl', function($rootScope, $scope, $ionicScrollDelegate, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, $timeout) {

	//跳转商品详情
	$scope.goGoodsDetail = function(id) {
			var timestamp = Date.parse(new Date()) + '';
			$state.go('mall-detail', {
				id: id,
				timestamp: timestamp
			});
		}
		//		收藏列表
	var isLoadingList = false; //判断列表是否正在获取数据
	var firstIn = true; //首次进入
	$scope.isNoData = false; //false：不显示无数据布局；true：显示无数据布局
	$scope.canLoadMore = true; //初次进入显示加载动画
	$scope.isShowLoadMore = true; //初次进入显示加载动画
	$scope.items = [];
	$scope.page = 1;
	$scope.categoryOrder = function() {
		if(isLoadingList) {
			return;
		}
		isLoadingList = true;
		$ionicScrollDelegate.scrollTop();
		$scope.isNoData = false; //不显示无数据界面
		$scope.canLoadMore = true; //可加载更多
		if(firstIn) {
			$scope.isShowLoadMore = true;
		} else {
			$scope.isShowLoadMore = false;
		}

		$scope.page = 1;
		$scope.items = [];
		loadData();
	}

	var loadData = function() {
		var options = {
			module: 'FM_SHOP_COLLECT_LIST',
			params: {
				current_page: $scope.page,
				page_size: 10,
			}
		};
		getInterface.jsonp(options, function(results, params) {
			firstIn = false;
			if(results.status == 'Y') {

				/*数组插入数据*/
				angular.forEach(results.results, function(value, index) {
						$scope.items.push(value);
					})
					/*判断隐藏上拉刷新*/
				if(results.results.length < 10) {
					$scope.canLoadMore = false;
					$scope.isShowLoadMore = false;
				} else {
					$scope.canLoadMore = true;
					$scope.isShowLoadMore = true;
				}
				/*设置isNoData值,用于判断是否显示无数据视图*/
				$scope.items.length == 0 ? $scope.isNoData = true : $scope.isNoData = false;
				setTimeout(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}, 500);
				isLoadingList = false;
			} else {
				$scope.isNoData = true;
				Xalert.loading(results.error_msg, 1000);
			}
		});
	}

	$scope.categoryOrder();

	//下拉刷新
	$scope.doRefresh = function() {
		$timeout(function() {
			$scope.categoryOrder();
			$scope.$broadcast('scroll.refreshComplete');
		}, 500);
	};

	// 		上拉加载
	$scope.loadMoreGoodsList = function() {
		if(isLoadingList) {
			return;
		}
		isLoadingList = true;
		$scope.page++;
		$scope.isShowLoadMore = true;
		loadData();

	};

	var bFlag = false;
	var removePopup;
	$scope.$on('$stateChangeStart', function(event, toState, fromState) {
		if(bFlag) {
			removePopup.close();
		}
	});
	//删除当前项
	$scope.deleteItem = function(index) {
		bFlag = true;
		removePopup = $ionicPopup.show({
			cssClass: 'Mycollect',
			template: '<p style="margin: 2em 0; text-align: center">亲，您确定要删除当前收藏商品吗？</p>',
			scope: $scope,
			buttons: [{
				text: '<font color="#999">取消</font>',
				onTap: function() {
					document.getElementsByClassName('item-content')[index].style.WebkitTransform = 'translate3d(0px, 0px, 0px)';
					bFlag = false;
				}
			}, {
				text: "确定",
				type: 'button-positive',
				onTap: function(e) {
					var options = {
						module: 'FM_SHOP_CANCELCOLLECT_PRODUCT',
						params: {
							product_id: $scope.items[index].product_id //技师id
						}
					};
					getInterface.jsonp(options, function(results) {
						if(results.status == 'Y') {
							$scope.items.splice(index, 1);
							$scope.categoryOrder();
						}
					});
					bFlag = false;
				}
			}]
		})
	}

});

/*
 关于我们
 auth:tzb
 */
app.controller('mySetAbout', function($rootScope, $scope, $timeout, QyWechat, $ionicGesture, $state, $ionicPlatform, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService) {
	document.title = "关于我们";
	if(!$rootScope.appValues){
		$scope.aboutUstx ="";
		return;
	}
	$scope.aboutUstx =$rootScope.appValues.SYSTEM_ABOUT_US.dic_desc;
	
});
/*
 我的钱包
 auth:tzb
 */
app.controller('myWallet', function($rootScope, $scope, $timeout, QyWechat, $ionicGesture, $state, $ionicPlatform, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService) {
	document.title = "我的钱包";

	//返回上一页
	$scope.onBackPressed = function() {
		window.history.go(-1);
	}
	$scope.numSelect = ''; //选择的常用金额
	$scope.submit = {
		key: ''
	}; //自定义金额
	//常用充值金额
	var loadData = function() {
		var options = {
			module: 'FM_APP_COMMON_MONEY_LIST',
			params: {}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				$scope.moneyList = results.results.money_num_list;
				$scope.numSelect = $scope.moneyList[0].money_num;
				$scope.balance = results.results.balance;
				if($scope.balance == '' | $scope.balance == null) {
					$scope.balance = '-.-'
				}
			}
			console.log(results);
		});
	}
	loadData();
	//	$rootScope.defer.promise.then(function(results) {  
	//		$scope.data = results.results.res_value;
	//		//充值规则
	//		for(var i = 0; i < $scope.data.length; i++) {
	//			if($scope.data[i].dic_code == 'SYSTEM_RECHARGE_RULE') {
	//				$rootScope.wallettype = $scope.data[i].dic_desc;
	//				alert($rootScope.wallettype);
	//			}
	//		}
	//	});
	// 常用金额点击
	$scope.index = 0;
	$scope.moneySelect = function(num,index) {
		$scope.submit.key = '';
		$scope.index = index;
		$scope.numSelect = num;
	}
	//点击立即充值
	$scope.recharge = function() {
		var seach = $scope.submit.key;
		if(seach) {
			$scope.numSelect = seach;
		}
		var options = {
			module: 'FM_APP_USER_RECHARGE',
			params: {
				recharge_val: $scope.numSelect
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y') {
				$scope.wallte = results.results;
				$scope.order_id = results.results.order_id;
				$scope.order_num = results.order_num;
				$scope.order_amount = results.order_amount;
				$state.go('my-pay', {
					oid: $scope.order_id,
					actualprice: $scope.numSelect,
					balance: $scope.balance,
					type: 'charge'
				});
			} else {
				Xalert.loading(results.error_msg, 1000);
				return false;
			}
		});
	}
	//监听输入框
	$scope.$watch('submit.key', function(newValue, oldValue) {
		if(newValue) {
			$scope.numSelect = '';
		}
	})
	var value = '';
	$scope.myWallet = function() {
		$scope.index = -1;
		console.log($scope.submit.key);
		if($scope.submit.key && $scope.submit.key != '') {
			value = $scope.submit.key.substring(0, value.length);
		}
		if(!/^[0-9]*$/.test($scope.submit.key)) {
			$scope.submit.key = value;
		} else {
			value = $scope.submit.key;
		}

		if($scope.submit.key > 10000) {
			$scope.submit.key = 10000;
		}

	}
	//充值
	/*$scope.recharge = function() {
		alert($scope.numSelect);
		var seach = $scope.submit.key;
		if(seach) {
			$scope.numSelect = seach;
		}
		var loadData = function() {
			var options = {
				module: 'FM_APP_USER_RECHARGE',
				params: {
					recharge_val: $scope.numSelect

				}
			};
			getInterface.jsonp(options, function(results, params) {
				if(results.status == 'Y') {
					$scope.wallte = results.results;
					$scope.order_id = results.results.order_id;
					$scope.order_num = results.order_num;
					$scope.order_amount = results.order_amount;
					//                  alert($scope.numSelect)
					if($scope.numSelect < 10) {
						return false;
					} else {
						$state.go('my-pay', {
							oid: $scope.order_id,
							actualprice: $scope.numSelect,
							balance: $scope.balance,
							type: 'charge'
						});
					}

				} else {
					Xalert.loading(results.error_msg, 1000);
					return false;
				}
			});
		}
		loadData();

	}*/

});