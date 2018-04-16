'use strict';
/*支付方式
 author tzb
 */
app.controller('PayMethodCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $ionicPopup, $interval, pageData, $cookies, $location) {
    document.title = "支付";
    var oid = $stateParams.oid; //订单Id
    var processType = $stateParams.processType;
    var actualprice = $stateParams.actualprice; //应付金额
    var balance = $stateParams.balance; //钱包金额
    var time = $stateParams.time; // 倒计时时间
    var type = $stateParams.type; //4情况
    var ticket = $stateParams.ticket;
    var record; //fanhui
    var host = $location.host(); //域名
    var weiOid;
    if (localStorage.weiOid) {
        weiOid = localStorage.weiOid; //购买附加服务支付时的id
    }
    var pid;
    if ($cookies.get('pid')) {
        pid = $cookies.get('pid'); // 套票Id
    }
    var backId;
    if (localStorage.backoid) {
        backId = localStorage.backoid;
    }

    var company_id = $cookies.get('company_id'); //公司Id
    var payLink = $rootScope.payPath; //支付地址
    var link = '';

    if (oid) {
        link = payLink + 'actualprice=' + actualprice + '&oid=' + oid + '&company_id=' + company_id + '&processType=' + 'subscribe' //支付地址
        console.log(link)
    } else {
        link = payLink + 'actualprice=' + actualprice + '&oid=' + weiOid + '&company_id=' + company_id //支付地址
    }
    var backLink; // 返回地址

    $scope.time = time;
    $scope.actualprice = actualprice;
    $scope.balance = balance;
    /*支付方式*/
    $scope.pay = true;
    $scope.n = 1;
    $scope.pays = function (n) {
        $scope.n = n;
        $scope.pay = $scope.n;
    }
    /*倒计时*/
    $scope.countdown = $interval(function () {
        if ($scope.time <= 0) {
            $scope.time = 1;
            $interval.cancel($scope.countdown);
            $scope.btnclick = {
                background: '#dedede',
                pointerEvents: 'none'
            };
        }
        $scope.time--;
        $scope.timeM = parseInt($scope.time / 60);
        $scope.timeS = $scope.time % 60;
        $scope.timeM > 0 ? $scope.TimeFormat = $scope.timeM + ' 分 ' + $scope.timeS + ' 秒 ' : $scope.TimeFormat = $scope.timeS + ' 秒 ';
    }, 1000)
    /*余额和微信的显示情况*/
    /*if($scope.balance == 0.0){
     $scope.pay=2;
     $scope.balNo={pointerEvents:'none'};
     }
     else if($scope.balance > $scope.actualprice){
     $scope.pay=2;
     $scope.balNo={pointerEvents:'none'};
     }else{
     $scope.pay=1;
     $scope.balNo={pointerEvents:'auto'};
     }*/
    if (parseFloat($scope.balance) == 0.0) {
        $scope.pay = 2;
        $scope.balNo = {
            pointerEvents: 'none'
        };
    } else if (parseFloat($scope.balance) < parseFloat($scope.actualprice)) {
        $scope.pay = 2;
        $scope.balNo = {
            pointerEvents: 'none'
        };
    } else {
        $scope.pay = 1;
        $scope.balNo = {
            pointerEvents: 'auto'
        };
    }
    /*不同的方式赋值*/

    /*订单支付*/
    var moduleType;
    if (type == 'mall') {
        moduleType = 'FM_SHOP_ORDER_REPAY';
        $scope.isShow = true;
    } else if (type == 'o2o') {
        moduleType = 'FM_APP_ORDER_REPAY';
        $scope.isShow = true;
    } else if (type == 'ticket') {
        moduleType = 'FM_APP_PACKAGE_ORDER_REPAY';
        $scope.isShow = true;
    }

    //来自我的钱包隐藏余额支付，默认选择微信支付
    if (type == 'charge') {
        $scope.isShow = false;
        $scope.pay = 2;
    }

    if (time) {
        $scope.isShowT = 1; //倒计时的确认按钮
    } else {
        $scope.isShowT = 2; //没有倒计时的确认按钮
    }
    //订单支付接口
    var payMethod = function () {
        if ($scope.pay == 1) {
            $scope.paytype = 'PAYTYPE_PRICE';
        } else if ($scope.pay == 2) {
            //	        $scope.paytype = 'PAYTYPE_WECHATWEB';
            $scope.paytype = 'PAYTYPE_WECHATWEB';
        }
        // alert($scope.paytype);
        var options = {
            module: moduleType,
            params: {
                oid: oid,
                paytype: $scope.paytype,
                actualprice: $scope.actualprice
            }
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                if ($scope.pay == 1) { //余额支付
                    Xalert.loading('支付成功');
                    if (type == 'mall') {
                        history.go(-1)
                    } else if (type == 'o2o') {
                        localStorage.setItem('sucess', true);
                        if ($rootScope.isO2O) { //020
                            $scope.go();
                            //							$state.go('tab.order', { ticketBalance: 'Y' }); //套票余额支付成功，订单列表显示历史订单
                        }
                        if ($rootScope.isShopO2O) { //020+电商
                            $scope.go();
                            //							$state.go('order-order-list-two', { ticketBalance: 'Y' }); //套票余额支付成功，订单列表显示历史订单
                        }
                    } else if (type == 'ticket') {
                        $scope.go();
                        //						$state.go('my-use-log', { pid: pid, oid1: backId });
                    }

                } else if ($scope.pay == 2) { //微信支付
                    // alert('微信支付')

                    if (type == 'ticket') {
                        backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/my/use-log/?pid=' + pid + '&oid1=' + backId;
                    } else if (type == 'mall') {
                        backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/my/commoditylist/?pay=2'; //待完善
                    } else if (type == 'o2o') { // alert('type == o2o');
                        if (ticket && (ticket == "Y")) { //套票服务订单支付
                            if ($rootScope.isO2O) { //020模式
                                backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/tab/order?' + 'ticketOrder=Y';
                            }
                            if ($rootScope.isShopO2O) { //020+电商模式
                                backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/order/index-two/?' + 'ticketOrder=Y';
                            }
                        } else { //单次服务订单支付
                            if ($rootScope.isO2O) { //020模式
                                backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/tab/order?';
                            }
                            if ($rootScope.isShopO2O) { //020+电商模式
                                backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/order/index-two/?';
                            }
                        }
                    }
                    $window.location.href = link + '&processType=' + processType + backLink;
                }
            } else if (results.status == 'N') {
                Xalert.loading('支付失败');
            }
        });
    }
    /*去支付*/
    $scope.quickPay = function () {
        if (type == 'charge') { //充值支付
            backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/my/my-wallet?';
            $window.location.href = link + backLink;
        } else { //非充值支付
            payMethod(); //订单支付接口
        }

        //    if ($scope.pay == 1) {
        //    	$scope.paytype = 'PAYTYPE_PRICE';
        //      payMethod();
        //    } else if ($scope.pay == 2) {
        //    	$scope.paytype = 'PAYTYPE_WECHATWEB';
        //      payMethod();
        //    }
    }
    //返回
    $scope.backbefore = function () {
        history.go(-1)
    }

    $scope.go = function () {
        switch (processType) {
            case 'ticketList': //套票使用记录
                history.go(-1);
                break;
            case 'ticketDetail': //套票使用记录详情
                history.go(-2);
                break;
            case 'serviceSecondList': //服务订单列表
                history.go(-1);
                break;
            case 'serviceSecondDetail': //服务订单详情
                history.go(-2);
                break;
            case 'commoditySecondList': //商品订单
                history.go(-1);
                break;
        }
    }
});