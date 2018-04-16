'use strict';
/*
 * 意见反馈控制器
 */
app.controller('MySeetingFeedbackCal', function ($rootScope, $scope, $ionicGesture, $state,$stateParams, $ionicLoading, $ionicPopup, ENV, Xalert, SwitchEnterpriseService, userInfo,$cookies, $location, Authentication, getInterface) {
    document.title="意见反馈";                                            	
    $scope.feedbackContent = {key: ''};//反馈内容
    $scope.feedbackContact = {key: ''};//联系方式

    /**
     * 提交反馈信息
     */
    $scope.submitFeedback = function () {
        var u = navigator.userAgent;
        if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
            var iphonetype = 'PLATFORM_ANDROID'
        } else if (u.indexOf('iPhone') > -1) {//苹果手机
            var iphonetype = 'PLATFORM_IPHONE'
        }
        if ($scope.feedbackContent.key == '') {
            Xalert.loading('请输入反馈意见');
            return;
        } else {
            var loadDate = function () {
                var options = {
                    module: 'FM_APP_FEEDBACK',
                    params: {
                        platform: iphonetype,
                        user_id: $cookies.get('openid'),
                        content: $scope.feedbackContent.key,
                        contact: $scope.feedbackContact.key
                    }
                };
                getInterface.jsonp(options, function (results) {
                    if (results.status == 'Y') {
                        Xalert.loading('意见提交成功，我们会尽快处理', 1000);
                        $state.go('my-seeting');
                    } else {
                        Xalert.loading(results.error_msg);
                        return;
                    }
                });
            }
        }
        loadDate();
    }
});