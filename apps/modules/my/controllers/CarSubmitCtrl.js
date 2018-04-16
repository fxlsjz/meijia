'use strict';
/*
 提交订单
 author caixiaojuan
 */
app.controller('CarSubmitCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $ionicSlideBoxDelegate, $ionicPopup, pageData, $cookies, $location) {

    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }

    //点击叉子，清空留言
    $scope.cancle = function () {
        $scope.notesText.text = '';
    }

    //支付回来
    var alreadyPaid = localStorage.getItem('alreadyPaid');
    if (alreadyPaid == 'Y') {
        localStorage.removeItem('alreadyPaid');//进入的时候也要清空
        window.history.go(-1);
    }

    // 选择地址
    $scope.selectAddress = function () {
        $state.go('my-addrecss', {my: '', form: 'goods-order'});
    }

    /*************积分*************/
    $scope.showIntegral = false;//true:显示积分选项；false：不显示积分选项(默认)
    $scope.canClickIntegral = false;//true:可点击积分选项；false：不可点击积分选项（默认）
    $scope.selIntegral = false;//true:选中积分；false：不选中
    //切换积分开关
    $scope.selectIntegral = function () {
        if ($scope.canClickIntegral) {
            $scope.selIntegral = !$scope.selIntegral;
        }
    }

    /*选填框清空*/
    $scope.notesText = {text: ''};
    $scope.searchClear = function () {
        if ($scope.notesText.text.length > 0) {
            $scope.notesText.text = '';
        }
    }

    var productinfo = localStorage.getItem('cartSelectedData');//获取要购买的商品列表
    var host = $location.host(); //域名
    //18.1.计算价格
    var loadData = function () {
        var options = {
            module: 'FM_SHOP_CHECK_ORDERCOST',
            params: {
                productinfo: productinfo
            }
        }
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.submitlist = results.results;
                $scope.balance = $scope.submitlist.balance;
                var actualprice = $scope.submitlist.actualprice;
                if (productinfo) {//显示商品列表
                    $scope.proinfo = angular.fromJson(productinfo);
                }
                if (parseFloat($scope.balance) == 0.0) {//余额为0
                    $scope.pay = 2;
                    $scope.balNo = {pointerEvents: 'none'};
                } else if (parseFloat($scope.balance) < parseFloat(actualprice)) {//余额小于实付款
                    $scope.pay = 2;
                    $scope.balNo = {pointerEvents: 'none'};
                } else {//余额大于实付款
                    $scope.pay = 1;
                    $scope.balNo = {pointerEvents: 'auto'};
                }
                //积分是否显示
                if ($scope.submitlist.isscore == '0') {//0:不显示
                    $scope.showIntegral = false;
                } else if ($scope.submitlist.isscore == '1') {//1:显示
                    $scope.showIntegral = true;
                } else {
                    $scope.showIntegral = false;
                }
                //积分是否可点击
                if ($scope.submitlist.inscore && ($scope.submitlist.inscore > 0)) {
                    $scope.canClickIntegral = true;//true:可点击积分选项；false：不可点击积分选项（默认）
                } else {
                    $scope.canClickIntegral = false;//true:可点击积分选项；false：不可点击积分选项（默认）
                }
            }
        });
    }
    loadData();
    /*支付方式*/
    $scope.pay = true;
    $scope.pays = function (n) {
        $scope.n = n;
        $scope.pay = $scope.n;
    }
    /*默认地址*/
    var addressList = function () {
        var options = {
            module: 'FM_SHOP_USERADDREDD_LIST',
            params: {}
        }
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.addressList = results.results;
                $scope.addressLength = $scope.addressList.length;
                for (var i = 0; i < $scope.addressLength; i++) {
                    if ($scope.addressList[i].isdefault == 'Y') {
                        $scope.receiver = $scope.addressList[i].receiver;//收货人
                        $scope.addressinfo = $scope.addressList[i].address_text + $scope.addressList[i].addressinfo;//省市区文本+详情地址
                        $scope.mobile = $scope.addressList[i].mobile;//联系方式
                    }
                }
            }
        });
    }

    /*路由控制*/
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if ((fromState.name == 'my-addrecss') && (localStorage.getItem('selectedAddress'))) {
            event.preventDefault();
            $scope.datas = angular.fromJson(localStorage.getItem('selectedAddress'));
            $scope.receiver = $scope.datas.receiver;//收货人
            $scope.addressinfo = $scope.datas.address_text + $scope.datas.addressinfo;//地址文本+详细地址
            $scope.mobile = $scope.datas.mobile;//联系方式
        } else {
            addressList();
        }
    });
    /*生成订单*/
    var orderDate = function () {
        if ($scope.pay == 1) {
            $scope.paytype = 'PAYTYPE_PRICE';
        }
        if ($scope.pay == 2) {
            $scope.paytype = 'PAYTYPE_WECHATWEB'; //18②接口
        }
        var options = {
            module: 'FM_SHOP_QUICK_ORDER',
            params: {
                order_name: $scope.receiver,
                order_phone: $scope.mobile,
                address: $scope.addressinfo,
                remark: $scope.notesText.text,
                paytype: $scope.paytype,
                usescore: $scope.selIntegral ? '1' : '0',
                productinfo: productinfo
            }
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                localStorage.setItem('alreadyPaid', 'Y');//已经生成订单
                $scope.orders = results.results;
                $scope.oid = $scope.orders.oid;
                $scope.actualprice = $scope.orders.actualprice;
                if ($scope.pay == 1) {//余额
                    Xalert.loading('订单提交成功', 1000);
                    $state.go('my-commoditylist', {paySuccess: 'Y'});
                    //通知商品订单列表刷新
                    $rootScope.$broadcast('refreshGoodsOrderList');
                }
                if ($scope.pay == 2) {//微信
                    orderPay();
                }
            }
            if (results.status == 'N') {
                Xalert.loading('订单提交失败');
            }
        });
    }

    /*订单支付(微信支付)*/
    var orderPay = function () {
        var options = {
            module: 'FM_SHOP_ORDER_REPAY',
            params: {
                oid: $scope.oid,
                paytype: $scope.paytype,
                actualprice: $scope.actualprice
            }
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                var company_id = $cookies.get('company_id');
                var backLink = '&processType=commodityFirst' + '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/my/commoditylist/?';
                var payLink = $rootScope.payPath;
                var link = payLink + 'actualprice=' + $scope.actualprice + '&oid=' + $scope.oid + '&company_id=' + company_id;
                $window.location.href = link + backLink;
            }
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }
    /*去支付*/
    $scope.toPays = function () {
        if ($scope.addressinfo && $scope.addressinfo != '') {
            if ($scope.pay == 1) {
                orderDate();
            } else if ($scope.pay == 2) {
                orderDate();
            }
        } else {
            Xalert.loading('请填写您的地址', 1000);
        }

    }
});