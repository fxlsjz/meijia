'use strict';
/**
 * author wuhao
 * 提交订单
 */
app.controller('Submit-Order', function ($rootScope, $location, $ionicPopup, $stateParams, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, errorCode) {
    document.title = '提交订单';
    var host = $location.host(); //域名
    var singleServiceSelectData = localStorage.getItem("singleServiceSelectData"); //已选择的服务数据
    var roomTypename = localStorage.getItem("roomTypename"); //已选择的房间类型
    var timeData = localStorage.getItem("timeData"); //已选择的时间
    var selectTechnician = localStorage.getItem("selectTechnician"); //选择的技师
    var selectedAddress = localStorage.getItem("selectedAddress"); //已选择的地址
    var Record = localStorage.getItem("Record") * 1;

    var data = angular.fromJson($stateParams.data); //挂在链接上的参数
    $scope.isShowView = false; //判断是否显示布局 第一次计算价格成功之后为true
    //来自哪种订单from: 1：到店单次；2：到家单次；3：到店套票；4：到家套票
    $scope.from = data.from;
    $scope.payType = "PAYTYPE_PRICE"; //支付类型 PAYTYPE_WECHATWEB 微信支付;PAYTYPE_PRICE余额支付;为空字符串到店支付
    //userInfo
    $scope.userName = { //用户名称
        text: data.userName ? data.userName : $rootScope.$_userInfo.user_name
    };
    $scope.userMobile = { //联系电话
        text: data.userMobile ? data.userMobile : $rootScope.$_userInfo.user_mobile
    };
    //地址
    $scope.selectedAddress = selectedAddress ? angular.fromJson(selectedAddress) : undefined;
    //店面信息
    var storeId = data.storeId ? data.storeId : ''; //店面id
    $scope.storeName = $scope.from == 1 || $scope.from == 3 ? localStorage.getItem("storeName") : ""; //店面名称
    $scope.roomType = data.roomType ? data.roomType : ""; //房间类型

    $scope.remark = { //其他需求
        text: ""
    };
    //金额
    $scope.orderprice = 0; //服务金额
    $scope.actualprice = 0; //实付总计
    $scope.balance = 0; //余额

    //已选择的服务
    $scope.singleServiceSelectData = singleServiceSelectData ? angular.fromJson(singleServiceSelectData) : undefined;
    $scope.timeData = timeData ? angular.fromJson(timeData) : undefined; //选择的时 间
    $scope.roomTypename = roomTypename ? roomTypename : ""; //当前选择房间类型
    $scope.selectTechnician = selectTechnician ? angular.fromJson(selectTechnician) : undefined; //所选择的技师

    if (singleServiceSelectData) {
        //计算价格
        calculatePrice('PAYTYPE_PRICE');
    } else {
        getView();
    }
    //获取控件
    function getView() {
        countDown(3);
    }

    function countDown(m) {
        Xalert.loading(m + "秒后自动跳转页面", 1000);
        setTimeout(function () {
            if (m == 1) {
                localStorage.removeItem('Record');
                window.history.go(-(Record + 1));
            } else {
                countDown(m - 1);
            }
        }, 1000);
    }

    //返回按钮监听
    $scope.goBack = function () {
        window.history.go(-1);
    };
    //服务操作
    var bFlag = false;
    var removePopup;
    $scope.$on('$stateChangeStart', function (event, toState, fromState) {
        if (bFlag) {
            removePopup.close();
        }
    });
    //删除服务
    $scope.delete = function (index, item) {
        bFlag = true;
        removePopup = $ionicPopup.show({
            template: '<p style="margin: 2em 0; text-align: center">删除' + $rootScope.serviceText + '？</p>',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
                onTap: function () {
                    bFlag = false
                }
            }, {
                text: '<font color="#333">删除</font>',
                type: 'button-positive',
                onTap: function (e) { //计算服务item
                    $scope.singleServiceSelectData.selectedData.splice(index, 1);
                    //计算服务时长
                    $scope.singleServiceSelectData.time = $scope.singleServiceSelectData.time * 1 - item.iusetime * 1;
                    //计算服务id
                    $scope.singleServiceSelectData.itemid = "";
                    for (var i = 0; i < $scope.singleServiceSelectData.selectedData.length; i++) {
                        if ($scope.singleServiceSelectData.itemid == "") {
                            $scope.singleServiceSelectData.itemid = $scope.singleServiceSelectData.selectedData[i].itemid;
                        } else {
                            $scope.singleServiceSelectData.itemid = $scope.singleServiceSelectData.itemid + "," + $scope.singleServiceSelectData.selectedData[i].itemid;
                        }
                    }
                    //计算价格
                    $scope.money = parseFloat($scope.singleServiceSelectData.aprice) - parseFloat(item.nowprice);
                    $scope.singleServiceSelectData.aprice = $scope.money.toFixed(1);
                    localStorage.setItem("singleServiceSelectData", angular.toJson($scope.singleServiceSelectData));
                    localStorage.setItem("singleServiceSelectDataCopy", angular.toJson($scope.singleServiceSelectData));
                    calculatePrice($scope.payType, true);
                }
            }]
        })
    };
    //选择余额支付
    $scope.selectBalance = function () {
        if ($scope.payType == "PAYTYPE_PRICE") return;
        if ($scope.payType == "") { //线下支付切换到线上支付计算价格
            calculatePrice('PAYTYPE_PRICE');
        } else {
            $scope.payType = "PAYTYPE_PRICE";
        }
    };
    //选择微信支付
    $scope.selectWeChat = function () {
        if ($scope.payType == "PAYTYPE_WECHATWEB") return;
        if ($scope.payType == "") { //线下支付切换到线上支付计算价格
            calculatePrice('PAYTYPE_WECHATWEB');
        } else {
            $scope.payType = "PAYTYPE_WECHATWEB";
        }
    };
    //到店支付
    $scope.selectStorePay = function () {
        if ($scope.payType == "") return;
        calculatePrice('');
    };
    //确认支付按钮
    $scope.verify = function () {
        if ($scope.userName.text == '') {
            Xalert.loading('请输入联系人姓名', 1000);
            return;
        } else if ($scope.userMobile.text == '') {
            Xalert.loading('请输入联系人电话', 1000);
            return;
        } else {
            if ($scope.from == 1 || $scope.from == 2) { //到店单次or到家单次
                createOrder();
            } else if ($scope.from == 3 || $scope.from == 4) { //到店套票or到家套票
                createOrder();
            }
        }
    };
    /**
     * 计算价格
     * @param {支付方式} payType
     */
    function calculatePrice(payType, isRefresh) {
        var options = {};
        if ($scope.from == 1 || $scope.from == 2) {
            options = {
                module: 'FM_APP_CHECK_ORDERCOST',
                params: {
                    // is_buyins: 'N', //是否购买保险
                    iteminfo: $scope.singleServiceSelectData.itemid, //我的服务id集合
                    //他的服务id
                    iteminfo_other: ($scope.roomType == 'STORE_TYPE_DOUBLE_A' || $scope.roomType == 'STORE_TYPE_DOUBLE_T') ? $scope.singleServiceSelectData.itemidHer : "",
                    couponid: "", //优惠券id集合
                    packageid: "", //套票id集合
                    order_type: getOrderType(payType),
                    citycode: $scope.selectedAddress ? $scope.selectedAddress.code : '',
                    order_stime: $scope.timeData ? $scope.timeData.starttime : '',
                }
            };
        } else {
            options = {
                module: 'FM_APP_PACKAGE_CHECK_ORDERCOST',
                params: {
                    iteminfo: $scope.singleServiceSelectData.itemid,
                    order_type: getOrderType(payType),
                }
            };
        }

        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y' && results.results) {
                var actualprice = parseFloat(results.results.actualprice);
                var balance = parseFloat(results.results.balance);
                if (payType == 'PAYTYPE_PRICE') { //余额支付
                    if (actualprice > balance) { //余额不足
                        if ($scope.payType == 'PAYTYPE_PRICE') { //已选的支付状态是余额支付
                            $scope.payType = "PAYTYPE_WECHATWEB" //切换到第三方支付
                            calculatePrice($scope.payType);
                        } else {
                            Xalert.loading("余额不足", 1000);
                        }
                        return;
                    }
                }
                $scope.payType = payType;
                $scope.orderprice = parseFloat(results.results.orderprice).toFixed(1);
                $scope.actualprice = actualprice.toFixed(1);
                $scope.balance = balance.toFixed(1);
                $scope.isShowView = true;
                $scope.isShowNoData = false;
            } else {
                if (isRefresh) {
                    $scope.isShowView = false;
                    $scope.isShowNoData = true;
                }
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
        });
    };
    //生成订单(单次or套票)
    function createOrder() {
        var options = {};
        if ($scope.from == 1 || $scope.from == 2) { //单次
            options = {
                module: 'FM_APP_QUICK_ORDER',
                params: {
                    order_name: $scope.userName.text,
                    order_phone: $scope.userMobile.text,
                    order_address: $scope.selectedAddress ? $scope.selectedAddress.address + $scope.selectedAddress.addressinfo : '', //服务地址
                    order_addressinfo: '', //服务详细地址
                    order_stime: $scope.timeData.starttime, //预约时间
                    remark: $scope.remark.text, //其他需求
                    paytype: $scope.payType, //支付方式
                    iteminfo: $scope.singleServiceSelectData.itemid, //W我的服务id集合
                    //他的服务id集合
                    iteminfo_other: ($scope.roomType == 'STORE_TYPE_DOUBLE_A' || $scope.roomType == 'STORE_TYPE_DOUBLE_T') ? $scope.singleServiceSelectData.itemidHer : "",
                    order_type: getOrderType($scope.payType), //订单类型
                    beautician: $scope.selectTechnician.my_beaticain.beauticianid, //给我选技师id
                    //给他选的技师id
                    beautician_other: ($scope.roomType == 'STORE_TYPE_DOUBLE_A' || $scope.roomType == 'STORE_TYPE_DOUBLE_T') ? $scope.selectTechnician.her_beaticain.beauticianid : "", //
                    store_id: storeId, //店面id
                    citycode: $scope.selectedAddress ? $scope.selectedAddress.code : '', //城市id
                    store_type: $scope.roomType, //房间类型
                    useradd_longitude: $scope.selectedAddress ? $scope.selectedAddress.longitude : '',
                    useradd_latitude: $scope.selectedAddress ? $scope.selectedAddress.latitude : '',
                }
            };
        } else { //套票
            options = {
                module: 'FM_APP_PACKAGE_QUICK_ORDER',
                params: {
                    order_name: $scope.userName.text,
                    order_phone: $scope.userMobile.text,
                    remark: $scope.remark.text, //其他需求
                    paytype: $scope.payType, //支付方式
                    iteminfo: $scope.singleServiceSelectData.itemid, //W我的服务id集合
                    order_type: getOrderType($scope.payType), //订单类型
                    store_id: storeId, //店面id
                }
            };
        }

        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                localStorage.setItem("Record", Record);
                if ($scope.payType == 'PAYTYPE_WECHATWEB') { //微信支付
                    //如果选择的是第三方支付，调完生成订单接口以后需要先调订单支付接口然后再跳转订单列表
                    orderGoPay(results.results.oid, results.results.orderno, results.results.actualprice);
                } else if ($scope.payType == 'PAYTYPE_PRICE') { //余额
                    $rootScope.clearServiceOrder()
                    go();
                } else { //到店支付（到店支付$scope.paytype是空的）
                    $rootScope.clearServiceOrder()
                    go();
                }
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    };
    //订单支付（选择微信支付-生成订单-订单支付）
    function orderGoPay(oid, orderno, actualprice) {
        var options = {
            module: 'FM_APP_ORDER_REPAY',
            params: {
                oid: oid,
                paytype: $scope.payType,
                actualprice: actualprice,
            }
        };
        getInterface.jsonp(options, function (results) {
            $rootScope.clearServiceOrder()
            if (results.status == 'Y') {
                var company_id = $cookies.get('company_id');
                var payLink = $rootScope.payPath;//支付地址
                var backLink = '';
                var link = '';
                //刷新订单列表
                $rootScope.$broadcast('refreshServiceOrderList');
                // from: 1：到店单次；2：到家单次；3：到店套票；4：到家套票
                //套票订单需要告诉微信支付界面是否是套票订单
                if ($scope.from == 3 || $scope.from == 4) { //套票订单
                    if ($rootScope.isO2O) { //020模式
                        backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/tab/order?' + 'ticketOrder=Y'; //套票订单支付成功以后，订单列表显示已完成状态列表
                        link = payLink + 'actualprice=' + actualprice + '&oid=' + oid + '&company_id=' + company_id + "&processType=serviceFirst";
                    }
                    if ($rootScope.isShopO2O) { //020+电商模式
                        console.log(String(Date.parse(new Date())))
                        backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/order/index-two/?' + 'ticketOrder=Y';
                        link = payLink + 'actualprice=' + actualprice + '&oid=' + oid + '&company_id=' + company_id + "&processType=serviceFirst";
                    }
                } else { //单次订单
                    if ($rootScope.isO2O) { //020模式
                        backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/tab/order?';
                        link = payLink + 'actualprice=' + actualprice + '&oid=' + oid + '&company_id=' + company_id + "&processType=serviceFirst";
                    }
                    if ($rootScope.isShopO2O) { //020+电商模式
                        console.log(String(Date.parse(new Date())))
                        backLink = '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/order/index-two/?';
                        link = payLink + 'actualprice=' + actualprice + '&oid=' + oid + '&company_id=' + company_id + "&processType=serviceFirst";
                    }
                }
                $window.location.href = link + backLink;
            } else {
                Xalert.loading(results.error_msg, 1000);
                go("N");
            }
        });
    };
    //支付成功或者失败后页面跳转
    function go(paySuccess) {
        //刷新订单列表
        $rootScope.$broadcast('refreshServiceOrderList');
        if ($scope.from == 1 || $scope.from == 2) { //单次
            //如果选择的是余额支付，调完生成订单接口以后直接跳转订单列表
            if ($rootScope.isO2O) { //020
                $state.go('tab.order', {
                    ticketOrder: 'N'
                });
            }
            if ($rootScope.isShopO2O) { //020+电商
                $state.go('order-order-list-two', {
                    ticketOrder: 'N'
                });
            }
        } else { //套票
            if ($rootScope.isO2O) { //020
                $state.go('tab.order', {
                    ticketOrder: 'Y',
                    paySuccess: paySuccess ? paySuccess : 'Y'
                }); //套票余额支付成功，订单列表显示历史订单
            }
            if ($rootScope.isShopO2O) { //020+电商
                $state.go('order-order-list-two', {
                    ticketOrder: 'Y',
                    paySuccess: paySuccess ? paySuccess : 'Y'
                }); //套票余额支付成功，订单列表显示历史订单
            }
        }
    };
    /**
     * 获取订单类型
     */
    function getOrderType(payType) {
        //固定键值-ORDER_ONLINE上门ORDER_OFFLINE_ONLINE店面服务线上支付ORDER_OFFLINE_OFFLINE店面服务线下支付
        if ($scope.from == 2 || $scope.from == 4) return 'ORDER_ONLINE';
        if (payType == "") return "ORDER_OFFLINE_OFFLINE";
        return "ORDER_OFFLINE_ONLINE";
    };
});