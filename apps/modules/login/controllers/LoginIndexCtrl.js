'use strict';
/* 登录
 author huoyuanyuan
 */
app.controller('LoginIndexCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, userInfo, $interval, $cookies, $timeout, $location) {
	//JS动态修改微信浏览器中的title
	document.title = '登录';

	$scope.isSelected = true;
	var openid = $cookies.get('openid');
	console.log("openid" + openid);

	var wechatname = $cookies.get('wechatname');
	var isLoginTimeOut = $stateParams.isLoginTimeOut; //是否是登录超时
	$scope.agreement = function() {
		$scope.isSelected = !$scope.isSelected;
	};
	$scope.phone = {
		key: ''
	}; //手机号
	$scope.verifiCode = {
		key: ''
	}; //验证码
	//验证码
	$scope.verCon = '获取验证码';

	//返回上一页
	$scope.onBackPressed = function() {
		if(isLoginTimeOut == 'true') {
			$state.go('tab.home');
		} else {
			window.history.go(-1);
		}
	}
	//获取验证码
	var bSign = false;
	$scope.verification = function() {
		if(bSign) return;
		bSign = true;
		if(!$scope.phone.key) {
			Xalert.loading('请输入手机号');
			bSign = false;
			return false;
		} else {
			if(!userInfo.checkMobile($scope.phone.key)) {
				Xalert.loading('请填写正确的手机号');
				bSign = false;
				return false;
			} else {
				var loadData = function() {
					var options = {
						module: 'FM_APP_GET_SECODE',
						params: {
							mobile: $scope.phone.key
						}
					};
					getInterface.jsonp(options, function(results) {
						if(results.status == 'N') {
							Xalert.loading(results.error_msg);
							bSign = false;
							return false;
						} else {
							//倒计时
							// Xalert.loading('亲，发送成功',500);
							var totle = 60;
							var timer = null;
							$interval.cancel(timer);
							timer = $interval(function() {
								totle--
								$scope.verCon = totle + 's';
								$scope.ptimer = true;
								if(totle == 0) {
									$interval.cancel(timer);
									bSign = false;
									$scope.verCon = '获取验证码';
									$scope.ptimer = false;
								}
							}, 1000);
						}
					});
				}
				loadData();
			}
		}
	};
	//登录
	$scope.login = function() {
		if(!$scope.isSelected) return;
		if($scope.phone.key) {
			if(!userInfo.checkMobile($scope.phone.key)) {
				Xalert.loading('请输入正确的手机号');
				return;
			} else if(!$scope.verifiCode.key) {
				Xalert.loading('请输入验证码');
				return;
			}
			else {
				var options = {
					module: 'FM_APP_LOGIN_SYSTEM',
					params: {
						se_code: $scope.verifiCode.key,
						mobile: $scope.phone.key,
						openid: openid,
						wechatname: wechatname
					}
				};
				getInterface.jsonp(options, function(results) {
					if(results.status == 'Y') {
						userInfo.setObject(results.results);

						if(isLoginTimeOut == 'true') {
							$state.go('tab.home');
						} else {
							window.history.go(-1);
						}
						localStorage.removeItem("Record");
					} else {
						Xalert.loading(results.error_msg, 1000);
					}
				});
			}
		} else {
			Xalert.loading('请输入手机号');
		}
	};



	//微信登录授权
	$scope.loginAuthor = function() {

		var options = {
			module: 'FM_APP_THIED_LOGIN_SYSTEM',
			params: {
				openid: openid,
				login_source: "WX",
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
				Xalert.loading("登录成功", 1000);

				userInfo.setObject(results.results);
				if(isLoginTimeOut == 'true') {
					$state.go('tab.home');
				} else {
					window.history.go(-1);
				}
				localStorage.removeItem("Record");

			} else {
				Xalert.loading(results.error_msg, 1000);
			}
		});
	};

});