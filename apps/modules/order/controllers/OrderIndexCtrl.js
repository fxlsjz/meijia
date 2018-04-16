'use strict';
/**
 * author zhoulei
 * 020订单列表and020订单详情控制器
 */
app.controller('OrderIndexCtrl', function ($ionicScrollDelegate, $rootScope, $stateParams, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, errorCode, $ionicPopup) {
    var ticketOrder = $stateParams.ticketOrder; //Y：套票订单；N：普通服务订单
    var paySuccess = $stateParams.paySuccess; //Y：支付成功；N：支付失败
    // $scope.sortid = 0; //0:进行中；1：历史订单
    // $scope.isLeft = true; //true:按下状态；false：正常状态
    if (ticketOrder == 'Y') { //套票订单
        if (paySuccess == 'Y') { //支付成功
            $scope.sortid = 1;
            $scope.isLeft = false;
            $scope.order_statetype = 'ORDER_COMP'; //全部
        } else { //支付失败
            $scope.sortid = 0;
            $scope.isLeft = true;
            $scope.order_statetype = "ORDER_IN"; //服务
        }
    } else if (ticketOrder == 'N') { //普通服务订单
        $scope.sortid = 0;
        $scope.isLeft = true;
        $scope.order_statetype = "ORDER_IN"; //服务
    } else { //从'我的'界面进入
        $scope.sortid = 0;
        $scope.isLeft = true;
        $scope.order_statetype = "ORDER_IN"; //服务
    }

    var isLoadingList = false; //判断列表是否正在获取数据

    //返回上一页
    $scope.onBackPressed = function () {
        history.go(-1);
    }

    $scope.isNoData = false; //false：不显示无数据布局；true：显示无数据布局
    $scope.canLoadMore = true;
    $scope.isShowLoadMore = true;
    $scope.items = []; //订单列表

    //获取订单时间显示文本
    $scope.getOrderTimeText = function (isPackage) {
        if (isPackage == 'Y') { //套票订单
            return '购买时间';
        } else { //单次服务订单
            return (($rootScope.serviceText) + ('时间'));
        }
    }

    //根据订单类型调接口
    $scope.categoryOrder = function (sortid, gestureType) {
        if (isLoadingList) {
            return;
        }
        isLoadingList = true;
        $ionicScrollDelegate.$getByHandle('orderListScroll').scrollTop(); //点击标签栏时滑动到顶部
        // $ionicScrollDelegate.scrollTop();
        $scope.sortid = sortid;

        /****************切换标签时重置数据******************/
        $scope.isNoData = false; //不显示无数据界面
        $scope.canLoadMore = true; //可加载更多
        if (gestureType) { //下拉刷新
            $scope.isShowLoadMore = false;
        } else { //点击标签
            $scope.isShowLoadMore = true;
        }
        $scope.page = 1;
        $scope.items = [];
        /****************切换标签时重置数据******************/

        if ($scope.sortid == 0) {
            $scope.order_statetype = "ORDER_IN"; //服务
            $scope.isLeft = true;
        } else if ($scope.sortid == 1) {
            $scope.order_statetype = 'ORDER_COMP'; //全部
            $scope.isLeft = false;
        }
        loadData();
    }

    //获取订单列表
    var loadData = function () {
        var options = {
            module: 'FM_APP_ORDER_LIST',
            params: {
                pageoffset: $scope.items.length,
                page_size: 10,
                order_statetype: $scope.order_statetype
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                /*数组插入数据*/
                if (results.results && results.results != '' && results.results != null && results.results != 'undefind') {
                    for (var i = 0; i < results.results.length; i++) {
                        $scope.items.push(results.results[i]);

                    }
                }
                /*判断隐藏上拉刷新*/
                if (results.results.length < 10) {
                    $scope.canLoadMore = false;
                    $scope.isShowLoadMore = false;
                } else {
                    $scope.canLoadMore = true;
                    $scope.isShowLoadMore = true;
                }
                /*设置isNoData值,用于判断是否显示无数据视图*/
                $scope.items.length == 0 ? $scope.isNoData = true : $scope.isNoData = false;
                setTimeout(function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, 1000);
                isLoadingList = false;
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }

    $scope.categoryOrder($scope.sortid, false);

    //上拉加载
    $scope.loadMoreList = function () {
        if (isLoadingList) {
            return;
        }
        isLoadingList = true;
        $scope.isShowLoadMore = true;
        $scope.page++;
        loadData();
    };

    //下拉刷新
    $scope.doRefresh = function () {
        $timeout(function () {
            $scope.categoryOrder($scope.sortid, true);
            $scope.$broadcast('scroll.refreshComplete');
        }, 500);
    }

    //刷新订单列表
    $rootScope.$on('refreshServiceOrderList', function (event, data) {
        $ionicScrollDelegate.scrollTop();
        $scope.doRefresh();
    });

    //返回弹出框消失
    var flag = false;
    var deletePopup;
    $scope.$on('$stateChangeStart', function (event, toState, tormState) {
        if (flag) {
            deletePopup.close();
        }
    })
    /*--------------取消订单-------------------*/
    $scope.cancel = function (oid) {
        flag = true;
        deletePopup = $ionicPopup.confirm({
            cssClass: 'orderDetail',
            title: '<p style="margin: 2em 0; text-align: center">取消该订单?</p>',
            buttons: [{
                text: '<font color="#999">不取消</font>',
                type: 'button-default',
                onTap: function (e) {
                    flag = false;
                }
            }, {
                text: '取消订单',
                type: 'button-positive',
                onTap: function () {
                    var loadData = function () {
                        var options = {
                            page: false,
                            module: 'FM_APP_ORDER_CANCEL',
                            params: {
                                oid: oid
                            }
                        };
                        getInterface.jsonp(options, function (results, params) {
                            if (results.status == 'Y') {
                                $timeout(function () {
                                    $scope.categoryOrder($scope.sortid, false);
                                }, 500);
                            } else {
                                Xalert.loading(results.error_msg, 1000);
                            }
                        });
                    }
                    loadData();
                    flag = false;
                }
            }]
        });
    }

    /**
     * 返回键
     */
    $scope.orderBack = function () {
        if ($rootScope.isShopO2O) { //020+电商
            window.history.go(-1);
        }
    }
    //订单详情
    $scope.goServiceOrderDetail = function (oid) {
        localStorage.setItem('oid', oid);
        $state.go('order-order-detail', {
            timestamp: String(Date.parse(new Date()))
        });
    }

    //评价服务
    $scope.evaluateService = function (item) {

        var serviceList = item.service_list.concat(item.serviceother_list);
        console.log(serviceList)
        var items = [];
        for (var i = 0; i < serviceList.length; i++) {
            if (serviceList[i].iscommon == 'Y') {
                items.push(serviceList[i]);
            }
        }
        console.log(items);
        if (items.length == 0) {
            return;
        }
        localStorage.setItem('oid', item.oid);
        localStorage.setItem("book_time", item.book_time);//下单时间
        if (items.length == 1) {
            localStorage.setItem('serviceEvaluate', angular.toJson(items[0]));
            $state.go('order-evaluate');//跳转评价页面
            return;
        }
        localStorage.setItem('serviceEvaluateList', angular.toJson(items));
        $state.go('order-evaluate-service');
    }
    //评价技师
    $scope.evaluateTechnician = function (item) {
        var beauticianList = [];
        //全部不可评价
        if (item.beautician.biscommon == "N" && item.beautician_other.biscommon == "N") {
            return;
        }
        //我的技师可评价
        if (item.beautician.biscommon && item.beautician.biscommon == "Y") {
            beauticianList.push(item.beautician);
        }
        //他的技师可评价
        if (item.beautician_other.biscommon && item.beautician_other.biscommon == "Y") {
            beauticianList.push(item.beautician_other);
        }
        //订单id
        localStorage.setItem('oid', item.oid);
        //只有一个可评价
        if (beauticianList.length == 1) {
            localStorage.setItem("technicianEvaluate", angular.toJson(beauticianList[0]));
            $state.go('order-evaluate');//跳转评价页面
            return;
        }
        //两个技师都可评价
        localStorage.setItem("evaluateTechnician", angular.toJson(beauticianList));
        $state.go('order-evaluate-technician');//跳转评价列表
    }
    /******************订单跟踪*********************/
    $scope.follow = function (oid) {
        $state.go('order-track-order', {
            oid: oid
        });
    }
    //18.3.	获取订单支付状态信息 -->去支付
    $scope.loadDataPay = function (oid, actualprice, is_package) {
        // var order_type = '';//o2o:单次服务订单；ticket：套票服务订单
        // if (is_package == 'Y') {
        //     order_type = 'ticket';
        // } else {
        //     order_type = 'o2o';
        // }
        var options = {
            module: 'FM_SHOP_ORDER_STATE',
            params: {
                oid: oid
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
                return false;
            }
            if (results.status == 'Y') {
                $state.go('my-pay', {
                    oid: oid,
                    actualprice: actualprice,
                    balance: results.results.balance,
                    time: results.results.time,
                    type: 'o2o',
                    ticket: is_package,
                    processType: 'serviceSecondList'
                });
            }
        });
    }
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        // localStorage.clear();
        if (fromState.name == 'order-evaluate' || fromState.name == 'order-evaluate-technician' || fromState.name == 'order-evaluate-service') {
            localStorage.removeItem('technicianEvaluate');
            localStorage.removeItem('serviceEvaluate');
            localStorage.removeItem('serviceEvaluateList');
        }
    });

});

//订单列表
//app.controller('OrderListTwoCtrl', function($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, errorCode, $ionicPopup) {
//
//});

/**
 * 订单详情控制器
 */
app.controller('ServiceOrderDetail', function ($rootScope, $scope, $stateParams, $interval, $cookies, $ionicSlideBoxDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $ionicPopup, pageData) {
    document.title = '订单详情';
    var oid = localStorage.getItem('oid');

    //返回上一页
    $scope.onBackPressed = function () {
        history.go(-1);
    }
    //获取详情数据
    var orderDetails = function () {
        var options = {
            page: false,
            module: 'FM_APP_ORDER_INFO',
            params: {
                oid: oid
            }
        };

        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                $scope.iteming = results.results;
                $scope.loadBtn = true;// 是否可以加载按钮
                $scope.order_state = $scope.iteming.order_state;
                //是否是套票订单
                // $scope.is_package = $scope.iteming.is_package;
                //是否可取消
                if ($scope.iteming.cencal_able == 'Y') {
                    $scope.showCancel = true;
                } else {
                    $scope.showCancel = false;
                }
                //是否可支付
                if ($scope.iteming.pay_surtime && parseInt($scope.iteming.pay_surtime) > 0) { //显示去支付
                    $scope.showPay = true;
                } else {
                    $scope.showPay = false;
                }
                //是否显示追踪
                if (($scope.iteming.is_package == 'N') && ($scope.iteming.order_type == 'ORDER_ONLINE') && (($scope.order_state == 'orderstate_waitservice') || ($scope.order_state == 'orderstate_complete') || ($scope.order_state == 'orderstate_inservice'))) {
                    $scope.showTrack = true;
                } else {
                    $scope.showTrack = false;
                }

                //是否显示预约时间
                if ($scope.iteming.is_package == 'N') { //显示
                    $scope.showOrderTime = true;
                } else { //不显示
                    $scope.showOrderTime = false;
                }
                //是否显示地址
                if ($scope.iteming.is_package == 'Y' && ($scope.iteming.order_type == 'ORDER_ONLINE')) { //多次到家不显示
                    $scope.showOrderAddress = false;
                } else { //其他都显示
                    $scope.showOrderAddress = true;
                }
                //地址一栏显示文案
                if ($scope.iteming.order_type == 'ORDER_ONLINE') { //到家
                    $scope.addressTxt = $rootScope.serviceText + '地址';
                } else { //到店
                    $scope.addressTxt = $rootScope.serviceText + '店面';
                }
                //倒计时时间
                $scope.time = parseInt($scope.iteming.pay_surtime);
                //订单状态
                if ($rootScope.appValues) {
                    $scope.orderStatus = $rootScope.appValues[$scope.iteming.order_state].dic_desc;
                }
            }
        });
    }
    orderDetails();

    /*倒计时*/
    $scope.countdown = $interval(function () {
        $scope.time--;
        $scope.timeM = parseInt($scope.time / 60);
        $scope.timeS = $scope.time % 60;
        $scope.timeM > 0 ? $scope.TimeFormat = $scope.timeM + ' 分 ' + $scope.timeS + ' 秒 ' : $scope.TimeFormat = $scope.timeS + ' 秒 ';
        if ($scope.time == 0) {
            $scope.time = 1;
            $interval.cancel($scope.countdown);
            $scope.btnclick = {
                background: '#dedede',
                pointerEvents: 'none'
            };
            $rootScope.$broadcast('refreshServiceOrderList'); //刷新服务订单列表
        }
    }, 1000);

    //取消订单
    var flag = false;
    var deletePopup;
    $scope.$on('$stateChangeStart', function (event, toState, tormState) {
        if (flag) {
            deletePopup.close();
        }
    })
    $scope.cancelOrder = function (oid) {
        flag = true;
        deletePopup = $ionicPopup.confirm({
            cssClass: 'orderDetail',
            title: '<p style="margin: 2em 0; text-align: center">取消该订单?</p>',
            buttons: [{
                text: '<font color="#999">不取消</font>',
                type: 'button-default',
                onTap: function (e) {
                    flag = false;
                }
            }, {
                text: '取消订单',
                type: 'button-positive',
                onTap: function () {
                    var loadData = function () {
                        var options = {
                            page: false,
                            module: 'FM_APP_ORDER_CANCEL',
                            params: {
                                oid: oid
                            }
                        };
                        getInterface.jsonp(options, function (results, params) {
                            if (results.status == 'Y') {
                                $rootScope.$broadcast('refreshServiceOrderList');
                                window.history.go(-1);
                            } else {
                                Xalert.loading(results.error_msg, 1000);
                            }
                        });
                    }
                    loadData();
                    flag = false;
                }
            }]
        });
    }

    //追踪订单
    $scope.orderTrack = function (oid) {
        $state.go('order-track-order', {
            'oid': oid
        });
    }

    //18.3.	获取订单支付状态信息 -->去支付
    $scope.loadDataPay = function (oid) {
        $rootScope.$broadcast('refreshServiceOrderList'); //刷新服务订单列表
        var options = {
            module: 'FM_SHOP_ORDER_STATE',
            params: {
                oid: oid
            }
        };
        getInterface.jsonp(options, function (results, params) {
            $rootScope.$broadcast('refreshServiceOrderList');
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
                return false;
            }
            if (results.status == 'Y') {
                $state.go('my-pay', {
                    oid: oid,
                    actualprice: $scope.iteming.actualprice,
                    balance: results.results.balance,
                    time: results.results.time,
                    type: 'o2o',
                    processType: 'serviceSecondDetail'
                });
            }
        });
    }

    //评价服务
    $scope.evaluateService = function (item) {

        var serviceList = item.service_list.concat(item.serviceother_list);
        var items = [];
        for (var i = 0; i < serviceList.length; i++) {
            if (serviceList[i].iscommon == 'Y') {
                items.push(serviceList[i]);
            }
        }
        if (items.length == 0) {
            return;
        }
        localStorage.setItem('oid', oid);
        localStorage.setItem("book_time", item.order_time);//下单时间
        if (items.length == 1) {
            localStorage.setItem('serviceEvaluate', angular.toJson(items[0]));
            $state.go('order-evaluate');//跳转评价页面
            return;
        }
        localStorage.setItem('serviceEvaluateList', angular.toJson(items));
        $state.go('order-evaluate-service');
    }
    //评价技师
    $scope.evaluateTechnician = function (item) {
        var beauticianList = [];
        //全部不可评价
        if (item.beautician.biscommon == "N" && item.beautician_other.biscommon == "N") {
            return;
        }
        //我的技师可评价
        if (item.beautician.biscommon && item.beautician.biscommon == "Y") {
            beauticianList.push(item.beautician);
        }
        //他的技师可评价
        if (item.beautician_other.biscommon && item.beautician_other.biscommon == "Y") {
            beauticianList.push(item.beautician_other);
        }
        //订单id
        localStorage.setItem('oid', oid);
        //只有一个可评价
        if (beauticianList.length == 1) {
            localStorage.setItem("technicianEvaluate", angular.toJson(beauticianList[0]));
            $state.go('order-evaluate');//跳转评价页面
            return;
        }
        //两个技师都可评价
        localStorage.setItem("evaluateTechnician", angular.toJson(beauticianList));
        $state.go('order-evaluate-technician');//跳转评价列表
    }
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        // localStorage.clear();
        if (fromState.name == 'order-evaluate' || fromState.name == 'order-evaluate-technician' || fromState.name == 'order-evaluate-service') {

            localStorage.removeItem('technicianEvaluate');
            localStorage.removeItem('serviceEvaluate');
            localStorage.removeItem('serviceEvaluateList');
        }
    });
    $scope.loadBtn = false;
    var view = "";
    while (!view || $scope.loadBtn == false) {
        view = document.getElementById('content');
    }
    // 按钮高度
//  if (!$scope.showCancel && !$scope.showPay && $scope.iteming.iscommon == 'N' && $scope.iteming.biscommon == 'N') {
//      view.style.bottom = 0 + 'rem';
//  } else {
//      view.style.bottom = 5.4 + 'rem';
//  }
});