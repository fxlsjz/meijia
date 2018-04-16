'use strict';
/**
 * author zhoulei
 * 追踪订单
 */
app.controller('TrackOrder', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, errorCode, $ionicPopup, $stateParams) {
    var oid = $stateParams.oid;
    var loadData = function () {
        var options = {
            module: 'FM_APP_REALTIMEORDER_LIST',
            params: {
                oid: oid
            }
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.data = results.results;
            }
        });
    }
    loadData();

//返回
    $scope.backButton = function () {
        history.go(-1)
    }

});

/**
 * 下单须知
 *
 */
app.controller('OrderRule', function ($rootScope, $stateParams, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, errorCode) {

    $scope.rule = $rootScope.appValues?$rootScope.appValues.SYSTEM_ORDER_INFORMATION.dic_desc:"";
    $scope.goBack = function () {
        window.history.go(-1);
    }

});