'use strict';
/**
 *  评价服务列表
 *  tzb
 */
app.controller('OrderEvaluateServiceCtrl', function ($rootScope, $location, $ionicPopup, $stateParams, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, errorCode) {
    document.title = '评价列表'
    $scope.items = angular.fromJson(localStorage.getItem("serviceEvaluateList"));
    var oid = localStorage.getItem('oid');
    $scope.iusetime = localStorage.getItem("book_time");
    $scope.toEvaluate = function (item) {
        localStorage.setItem('oid', oid);
        localStorage.setItem("serviceEvaluate", angular.toJson(item));
        $state.go('order-evaluate');
    }
});
/**
 * 评价技师列表
 */
app.controller('OrderEvaluateTechnicianCtrl', function ($rootScope, $location, $ionicPopup, $stateParams, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, errorCode) {
    document.title = '评价列表'
    $scope.items = angular.fromJson(localStorage.getItem("evaluateTechnician"));//技师数据
    var oid = localStorage.getItem('oid');
    //去评价页面
    $scope.toEvaluate = function (item) {
        localStorage.setItem('oid', oid);
        localStorage.setItem("technicianEvaluate", angular.toJson(item));
        $state.go('order-evaluate');
    }
});
/**
 * 评价页面
 */
app.controller('OrderEvaluateCtrl', function ($rootScope, $location, $ionicPopup, $stateParams, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, errorCode, Util) {
    document.title = '评价'
    $scope.evainfo = localStorage.getItem('technicianEvaluate'); //评价技师信息
    $scope.oid = localStorage.getItem('oid');//订单id
    $scope.iusetime = parseInt(localStorage.getItem("book_time"));//下单时间
    $scope.isService = (!$scope.evainfo || $scope.evainfo == null || $scope.evainfo == 'undefind') ? true : false;//true 显示服务 false  显示技师
    if ($scope.isService == true) {
        $scope.evainfo = angular.fromJson(localStorage.getItem('serviceEvaluate')); //评价服务信息
    } else {
        $scope.evainfo = angular.fromJson(localStorage.getItem('technicianEvaluate'));//评价技师信息
    }
    $scope.bgHeight = window.screen.availWidth / 3;//顶部高度
    $scope.AnoIsNo = false; //是否匿名
    $scope.anSwitch = function () {
        $scope.AnoIsNo = !$scope.AnoIsNo;
    }

    $scope.inut = {
        text: ''
    };
    //图片上传
    $scope.init = function () {
        $scope.imgs = [];
        $scope.thumbnail = [];
        $scope.content = '';
        $scope.nopublic = false;
    };

    $scope.init();
    //  星级评分
    $scope.mark = 5;
    $scope.courseValue = 5;
    $scope.courseClick = function (val) {
        $scope.mark = val;
        $scope.courseValue = val;
    };

    //点击上传
    $scope.uploadImg = function () {
        var input = document.getElementById("Img");
        input.click();
    }
    //选择图片后加到列表
    $scope.upload = function (obj) {
        //Xalert.loading(obj)
        Xalert.loading('loading...', false);
        angular.forEach(obj.files, function (file, key) {

            Util.resizeFile(file, {}, function (blob_data) {
                if (blob_data.indexOf('data:image/') == -1) {
                    Xalert.loading(file.name + '处理失败，请重试');
                } else {
                    Util.compressImage(blob_data, {maxWidth: 120, maxHeight: 160, ratio: 0.8}, function (thumbnail) {
                        //alert(thumbnail);
                        if (thumbnail.indexOf('data:image/') != -1) {
                            if ($scope.thumbnail.length >= 6) {
                                return false;
                            }
                            $scope.imgs.push(blob_data);
                            //var background = {
                            //    "background-image" : "url("+thumbnail+")",
                            //};
                            $scope.thumbnail.push({src: thumbnail, name: file.name});
                        }
                    });
                }

            });
        });
        Xalert.loading('loading...', 500);
    }

    //移除上传图片
    $scope.remove = function (index) {
        $scope.thumbnail.splice(index, 1)
        $scope.imgs.splice(index, 1);
    }

    $scope.type = 1;
    $scope.evaDime = 'COMMENT_TYPE_PRAISE'
    $scope.evatype = function (type) {
        $scope.type = type;
        if (type == 1) {
            $scope.evaDime = 'COMMENT_TYPE_PRAISE' //好评
        } else if (type == 2) {
            $scope.evaDime = 'COMMENT_TYPE_SECO' //中评
        } else if (type == 3) {
            $scope.evaDime = 'COMMENT_TYPE_BAD' //差评
        }
    }
    $scope.textlength = function () {
        //英文
        if (/^[a-z]*|[A-Z]*$/.test($scope.inut.text)) {
            if ($scope.inut.text.length >= 500) {
                Xalert.loading('超过500字');
                return false;
            }
        }
        //中文
        if (/[^\u4e00-\u9fa5]/.test($scope.inut.text)) {
            if ($scope.inut.text.length >= 500) {
                Xalert.loading('超过500字');
                return false;
            }
        }
    }
    $scope.nm = 'N';
    $scope.AnoIsNo == false;
    //提交
    var isEvaluating = false;//正在评价
    $scope.submit = function () {
        if (isEvaluating) {
            return;
        }
        isEvaluating = true;
        $scope.poiid = $scope.evainfo.poiid;
        var img = [];
        angular.forEach($scope.imgs, function (value) {
            img.push(value.replace('data:image/png;base64,', ''));
        });
        // 是否匿名
        if ($scope.AnoIsNo == false) {
            $scope.nm = 'N'
        } else if ($scope.AnoIsNo == true) {
            $scope.nm = 'Y'
        }
        //验证
        if ($scope.inut.text == '') {
            Xalert.loading('请输入评价内容')
            return false;
        } else if ($scope.inut.text.length < 10) {
            Xalert.loading('输入字数不能少于10个哦')
            return false;
        } else {
            var itemid = '';// 服务id
            var beauticianid = '';//技师id
            if ($scope.isService == true) {
                itemid = $scope.evainfo.itemid;
                beauticianid = '';
            } else {
                itemid = '';
                beauticianid = $scope.evainfo.beauticianid;
            }
            var options = {
                module: 'FM_COMMENT_SERVICE_BEAUTICIAN',
                params: {
                    oiid: $scope.evainfo.oiid ? $scope.evainfo.oiid : "",
                    itemid: itemid,
                    beauticianid: beauticianid,
                    cimg: img, //图片
                    commscore: $scope.evaDime, //好中差评价
                    content: $scope.inut.text, //评价内容
                    score: $scope.courseValue, //星级
                    poiid: $scope.poiid, //订单详情id
                    oid: $scope.oid, //订单id
                    is_anonymity: $scope.nm //是否匿名
                }
            };
            getInterface.post(options, function (results, params) {
                if (results.status == 'Y') {
                    Xalert.loading('评价成功');
                    history.go($scope.backCode);
                } else {
                    Xalert.loading(results.error_msg, 1000);
                }
                isEvaluating = false;
            });
        }
    }
    //确定是否离开
    var bFlag = false;
    var removePopup;
    $scope.$on('$stateChangeStart', function (event, toState, fromState) {
        if (bFlag) {
            removePopup.close();
        }
    });
    $scope.leave = function () {
        bFlag = true;
        removePopup = $ionicPopup.show({
            cssClass: 'assess',
            template: '<p style="margin: 2em 0; text-align: center">亲，评价还未完成，您确定要离开？</p>',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
                onTap: function () {
                    bFlag = false
                }
            }, {
                text: '确定',
                type: 'button-positive',
                onTap: function (e) {
                    history.go($scope.backCode);
                    bFlag = false;
                }
            }]
        })
    }
    //跳转监听
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name == 'order-evaluate-service' || fromState.name == 'order-evaluate-technician') {
            $scope.backCode = -2;
        } else {
            $scope.backCode = -1;
        }
    });

});