'use strict';
/**
 * author zhoulei
 */
//用户协议
app.controller('UserAgreementCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, userInfo, $interval, $cookies, $timeout) {
	document.title = '用户协议';

	$scope.userAgreement = $rootScope.appValues?$rootScope.appValues.SYSTEM_USER_AGREEMENTS.dic_desc:'';

});