'use strict';
/**
 * 修改个人资料and修改手机号 by zl
 *
 */

app.controller('ModifyDataCtrl', function ($rootScope, $scope, $ionicActionSheet, $timeout, $ionicModal, $ionicGesture, $state, $window, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, userInfo, $cookies, $location, Authentication, pageData) {
	document.title = "编辑个人资料";
    $scope.userName = {key: ''};//昵称
    $scope.userSex = {key: ''};//性别
    $scope.userMobile = {key: ''};//手机号
    $scope.userName.key = $rootScope.$_userInfo.user_name;//昵称
    $scope.userSex.key = $rootScope.$_userInfo.user_sex;//性别
    $scope.userMobile.key = $rootScope.$_userInfo.user_mobile;//手机号
    //显示男女
    if ($scope.userSex.key == 'user_sex_man') {
        $scope.gender_value = '男';
    } else {//女
        $scope.gender_value = '女';
    }

    //保存原始昵称，性别，手机号，用以判断是否修改了个人资料
    if ($rootScope.$_userInfo.user_name) {
        localStorage.setItem('modify_user_name', $rootScope.$_userInfo.user_name);
    }
    if ($rootScope.$_userInfo.user_sex) {
        localStorage.setItem('modify_user_sex', $rootScope.$_userInfo.user_sex);
    }
    if ($rootScope.$_userInfo.user_mobile) {
        localStorage.setItem('modify_user_mobile', $rootScope.$_userInfo.user_mobile);
    }

    //验证码+手机号（由修改手机号页面返回）
    var changed_phone = $stateParams.changed_phone;
    var se_code = $stateParams.se_code;


    //由修改手机号页面返回
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        //由修改手机号返回，并且保存过当前姓名等信息
        if ((fromState.name == 'my-modify-phone') && (localStorage.getItem('curName'))) {
            $scope.userName.key = localStorage.getItem('curName');
            $scope.userSex.key = localStorage.getItem('curSexKey');
            $scope.gender_value = localStorage.getItem('curSexValue');

            if (changed_phone) {//由修改手机号页面返回时，需要修改手机号
                $scope.userMobile.key = changed_phone;
            } else {
                $scope.userMobile.key = localStorage.getItem('curPhone');
            }

            localStorage.removeItem('curName');
            localStorage.removeItem('curSexKey');
            localStorage.removeItem('curSexValue');
            localStorage.removeItem('curPhone');
        }
    });

    //判断是否修改了数据
    $scope.judgeDataChange = function () {
        //说明：验证码不为空，说明修改了手机号

        if (($scope.userName.key == localStorage.getItem('modify_user_name')) && ($scope.userSex.key == localStorage.getItem('modify_user_sex')) && (!se_code)) {
            return false;//未修改
        } else {
            return true;//已修改
        }
    }


    //保存用户资料（有修改调接口，没修改关闭界面）
    $scope.onSave = function () {
        if (!$scope.userName.key) {
            Xalert.loading('用户姓名不能为空', 2000);
            return;
        } else if ($scope.userName.key.length > 12) {
            Xalert.loading('用户姓名不能超过12个字', 2000);
            return;
        }
        if ($scope.judgeDataChange()) {
            if (se_code) {
                loadData(2);
            } else {
                loadData(1);
            }
        } else {
            window.history.go(-1);
        }
    }
    //返回键
    $scope.onBackPressed = function () {
        if ($scope.judgeDataChange()) {
            $scope.cancelModify();//确认弹窗
        } else {
            window.history.go(-1);
        }
    }

    //apiType:1,修改个人资料接口(不修改手机号);2,修改个人资料接口(修改手机号)
    var loadData = function (apiType) {
        var options = {};
        if (apiType == 1) {
            options = {
                module: 'FM_APP_USER_CHANGE',
                params: {
                    user_nickname: $scope.userName.key,
                    user_sex: $scope.userSex.key
                }
            };
        } else if (apiType == 2) {
            options = {
                module: 'FM_APP_USER_CHANGE',
                params: {
                    user_nickname: $scope.userName.key,
                    user_sex: $scope.userSex.key,
                    user_mobile: $scope.userMobile.key,
                    se_code: se_code
                }
            };
        }
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
                return false;
            }
            if (results.status == 'Y') {
                //修改个人资料成功以后，更新用户信息全局变量
                $rootScope.$_userInfo = userInfo.getObject();
                $rootScope.$_userInfo.user_name = results.results.user_name;
                $rootScope.$_userInfo.user_sex = results.results.user_sex;
                $rootScope.$_userInfo.user_mobile = results.results.user_mobile;
                userInfo.setObject($rootScope.$_userInfo);
                Xalert.loading('修改成功');
                window.history.go(-1); //返回上一层
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });

    }

    //放弃修改确认弹窗
    var bFlag = false;
    var cancelPopup;
    $scope.$on('$stateChangeStart', function (event, toState, fromState) {
        if (bFlag) {
            cancelPopup.close();
        }
    });
    $scope.cancelModify = function (index) {
        bFlag = true;
        cancelPopup = $ionicPopup.show({
            cssClass: 'my_index',
            template: '<p style="margin: 2em 0; text-align: center">亲，您确定要放弃对基本资料的修改吗？</p>',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
                onTap: function () {
                    bFlag = false;
                }
            }, {
                text: '确定',
                type: 'button-positive',
                onTap: function (e) {
                    bFlag = false;
                    // $cookies.put('se_code', '');//返回我的界面时，清除验证码
                    $state.go('tab.my'); //返回上一层
                }
            }]
        })
    }
    /****************跳转修改手机号******************/
    $scope.changePhone = function () {
        localStorage.setItem('curName', $scope.userName.key);
        localStorage.setItem('curSexKey', $scope.userSex.key);
        localStorage.setItem('curSexValue', $scope.gender_value);
        localStorage.setItem('curPhone', $scope.userMobile.key);
        $state.go('my-modify-phone'); //修改手机号界面
    }
    /***************性别选择弹窗****************/
    $scope.show = function () {

        var hideSheet = $ionicActionSheet.show({

            cancelOnStateChange: true,
            buttons: [{
                text: '<font color="#e64d65" >男</font>'
            }, {
                text: '<font color="#e64d65" >女</font>'
            }],

            buttonClicked: function (index) {

                if (index == 0) { //男
                    $scope.userSex.key = 'user_sex_man';
                    $scope.gender_value = '男';
                } else if (index == 1) { //女
                    $scope.userSex.key = 'user_sex_woman';
                    $scope.gender_value = '女';
                }
                return true;
            }
        });

//      $timeout(function () {
//          hideSheet();
//      }, 50000000);

    };

});

//修改手机号
app.controller('ModifyPhoneCtrl', function ($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, userInfo, $interval, $timeout, $location, $cookies) {
	document.title="修改手机号";
    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }


    $scope.phone = {key: ''}; //手机号
    $scope.se_code = {key: ''}; //验证码
    //验证码
    $scope.verCon = '发送验证码';
    var bSign = false;
    $scope.verification = function () {
        if (bSign) return;
        bSign = true;
        if ($scope.phone.key == '') {
            Xalert.loading('请输入手机号');
            bSign = false;
            return false;
        } else {
            if (!userInfo.checkMobile($scope.phone.key)) {
                Xalert.loading('请填写正确的手机号');
                bSign = false;
                return false;
            } else {
                var loadData = function () {
                    var options = {
                        module: 'FM_APP_GET_SECODE',
                        params: {
                            mobile: $scope.phone.key
                        }
                    };
                    getInterface.jsonp(options, function (results) {
                        if (results.status == 'N') {
                            Xalert.loading(results.error_msg);
                            bSign = false;
                            return false;
                        } else {
                            //倒计时
                            // Xalert.loading('亲，发送成功', 500);
                            var totle = 60;
                            var timer = null;
                            $interval.cancel(timer);
                            timer = $interval(function () {
                                totle--
                                $scope.verCon = totle + 's';
                                $scope.ptimer = true;
                                if (totle == 0) {
                                    $interval.cancel(timer);
                                    bSign = false;
                                    $scope.verCon = '发送验证码';
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
    //确定按钮
    $scope.ok = function () {

        if ($scope.phone.key) {
            if (!userInfo.checkMobile($scope.phone.key)) {
                Xalert.loading('请输入正确的手机号');
                $scope.phone.key = '';
                return;
            } else if ($scope.se_code.key == '') {
                Xalert.loading('请输入验证码');
                return;
            } else if (!(/^\d{6}$/.test($scope.se_code.key))) {
                Xalert.loading('请输入正确格式的验证码');
                $scope.se_code.key = '';
                return;
            } else {
                $state.go('my-modify-data', {
                    changed_phone: $scope.phone.key,
                    se_code: $scope.se_code.key
                });
            }
        } else {
            Xalert.loading('请输入手机号');
        }

    }

});