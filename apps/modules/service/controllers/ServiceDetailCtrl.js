'use strict';

/**
 * 服务详情
 */
app.controller('storeSingleServiceDetail', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, $stateParams, serviceChange, $ionicScrollDelegate) {

    var storeData = $stateParams.data; //店面数据
    var from = localStorage.getItem('from'); //1.my-ticket 套票 2.技师 technician3. 单次到家  home  4 到店 store
    var isActive = localStorage.getItem('isActive'); //true 给我选 false 给他选
    var type = localStorage.getItem('type'); //单次多次(套票) SERVICE_MANY套票
    var serviceType = localStorage.getItem('serviceType'); //到店还是到家
    var serviceData = localStorage.getItem('singleServiceSelectDataCopy'); //服务选择数据
    var selectedData = []; //给我选服务集合 or单人选择
    var selectedDataHer = []; //给他选服务集合
    var needTime = ''; //最大服务时长
    var serviceItem = localStorage.getItem('serviceItem') //服务对象
    var service_id = ''; //服务id

    if (serviceData)
        serviceData = angular.fromJson(serviceData); //已选服务数据
    if (serviceData && serviceData.selectedData && serviceData.selectedData != '')
        selectedData = serviceData.selectedData;
    if (serviceData && serviceData.selectedDataHer && serviceData.selectedDataHer != '')
        selectedDataHer = serviceData.selectedDataHer;
    if (serviceData) {
        var selectedTimer = serviceData.time; //给我选服务时长or 单次选择时长
        var selectedTimerHim = serviceData.timeHer; //给她选服务时长
        var selectedPrice = parseFloat(serviceData.aprice); //所选服务价格
    } else {
        var selectedPrice = 0;
        var selectedTimer = 0; //给我选服务时长or 单次选择时长
        var selectedTimerHim = 0; //给她选服务时长
    }
    if (serviceItem) {
        serviceItem = angular.fromJson(serviceItem); //当前服务对象
        service_id = serviceItem.itemid; //服务id
    }

    $scope.orderNext = true; //显示下单按钮
    $scope.isStampDetail = false; //显示样式区分
    $scope.imageHeight = window.innerWidth / 1.785714285714286; //top图片高度
    //来自我的套票 -隐藏按钮
    from == 'my-ticket' ? $scope.orderNext = false : $scope.orderNext = true;

    //	是否为套票
    if (type == 'SERVICE_MANY' || from == 'my-ticket') {
        $scope.isStampDetail = true;
    }
    $scope.cartext = "加入购买";
    var only = 'true'; //单人
    if (serviceItem)
        var selected = serviceItem.selected;
    if (selected == true) {
        $scope.cartext = "取消购买"
    }
    //	服务详情获取
    var serviceDetailLoad = function () {

        var options = {
            module: 'FM_APP_SERVICE_INFO',
            params: {
                service_id: service_id
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
                return false;
            } else {
                if (results.results && results.results != '') {
                    $scope.service = results.results;
                    $scope.content = results.results.service_content; //服务内容
                    $scope.productid = results.results.service_product; //产品清单

                    if (results.results.service_content)
                        var contentNum = results.results.service_content.length; //内容个数
                    if (results.results.service_product)
                        var productNum = results.results.service_product.length; //产品个数
                    $scope.contentWidth = {
                        width: 285 * contentNum + 'px'
                    };
                    $scope.productidWidth = {
                        width: 285 * productNum + 'px'
                    };
                    if (results.results.iexplain)
                        $scope.prompt = results.results.iexplain.replace(/\r\n/ig, "<br/>"); //温馨提示

                } else {
                    Xalert.loading('网络异常!~', 1000);
                }
            }
        });
    }
    serviceDetailLoad();

    //服务收藏
    $scope.goodsCollection = function (item) {
        serviceChange.collection(item.itemid, function (results) {
            if (results.status == 'Y') {
                if (item.iscollection == 'N') {
                    item.iscollection = 'Y';
                    //发通知刷新服务列表
                    $rootScope.$broadcast('listUpdate');
                    return;
                } else {
                    Xalert.loading('亲，您已经收藏');
                    return;
                }
            }
        });
    };
    //服务取消收藏
    $scope.goodsCollectionDel = function (item) {
        serviceChange.uncollection(item.itemid, function (results) {
            if (results.status == 'Y') {
                if (item.iscollection == 'Y') {
                    item.iscollection = 'N';
                    //发通知刷新服务列表
                    $rootScope.$broadcast('listUpdate');
                    return;
                } else {
                    Xalert.loading('亲，您已经收藏');
                    return;
                }
            }
        });
    };
    // 加入取消购买
    $scope.backCar = function () {
        if ($scope.cartext == '加入购买') {
            Xalert.loading('加入购买成功'); //提示语

            if (isActive == 'true') {
                selectedTimer += serviceItem.iusetime;
                selectedData.push(serviceItem); //添加
            } else {
                selectedTimerHim += serviceItem.iusetime;
                selectedDataHer.push(serviceItem); //添加
            }
            selectedPrice += parseFloat(serviceItem.nowprice);
            serviceItem.selected = true;
            selected = true;
            serviceItem.text = '取消购买';
            $scope.cartext = '取消购买';

        } else if ($scope.cartext == '取消购买') {
            if (isActive == 'true') {
                for (var i = 0; i < selectedData.length; i++) {
                    if (serviceItem.itemid == selectedData[i].itemid) {
                        selectedData.splice(i, 1);
                    }
                }
                selectedTimer -= serviceItem.iusetime;
            } else {
                for (var i = 0; i < selectedDataHer.length; i++) {
                    if (serviceItem.itemid == selectedDataHer[i].itemid) {
                        selectedDataHer.splice(i, 1);
                    }
                }
                selectedTimerHim -= serviceItem.iusetime;
            }

            selectedPrice -= parseFloat(serviceItem.nowprice);
            serviceItem.selected = false;
            selected = false;
            serviceItem.text = '加入购买';
            $scope.cartext = '加入购买';
        }
        var orderService = {
            aprice: selectedPrice,
            time: selectedTimer,
            timeHer: selectedTimerHim,
            selectedData: selectedData,
            selectedDataHer: selectedDataHer
        }
        localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(orderService));
        $timeout(function () {
            history.go(-1);
        }, 300);
    }
    //020+电商模式，点击产品列表，跳转至商品详情

    $scope.goGoodsDetail = function (productid) {
        if ($rootScope.isShopO2O) { //020+电商模式
            $state.go('mall-detail', {
                'id': productid
            });
        }
    }
    //立即下单
    $scope.next = function () {
        //防止数据丢失
        var from = localStorage.getItem('from');
        var isActive = localStorage.getItem('isActive'); //true 给我选 false 给他选
        var type = localStorage.getItem('type'); //单次多次(套票)
        var serviceType = localStorage.getItem('serviceType'); //到店还是到家
        var serviceData = localStorage.getItem('singleServiceSelectDataCopy');
        if (serviceData)
            serviceData = angular.fromJson(serviceData); //已选服务数据

        var selectedData = []; //给我选服务集合 or单人选择
        var selectedDataHer = []; //给他选服务集合
        if (serviceData && serviceData.selectedData && serviceData.selectedData != '')
            selectedData = serviceData.selectedData;
        if (serviceData && serviceData.selectedDataHer && serviceData.selectedDataHer != '')
            selectedDataHer = serviceData.selectedDataHer;
        if (serviceData) {
            var selectedTimer = serviceData.time; //给我选服务时长or 单次选择时长
            var selectedTimerHim = serviceData.timeHer; //给她选服务时长
            var selectedPrice = parseFloat(serviceData.aprice); //所选服务价格
        }
        var serviceItem = localStorage.getItem('serviceItem')
        var service_id = '';
        if (serviceItem) {
            serviceItem = angular.fromJson(serviceItem); //当前服务对象
            service_id = serviceItem.itemid; //服务id
        }

        //serviceData.item 当前服务对象
        //是否登录
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        ;
        if (selected == false) {
            $scope.cartext = '取消购买'
            if (isActive == 'true') {
                //判断是否已存在
                var ownAdd = true; //不存在
                for (var i = 0; i < selectedData.length; i++) {
                    if (serviceItem.itemid == selectedData[i].itemid) {
                        ownAdd = false;
                        continue;
                    } else {
                        ownAdd = true;
                    }
                }
                if (ownAdd == true) {
                    serviceItem.selected = true;
                    localStorage.setItem('serviceItem', angular.toJson(serviceItem));
                    selectedData.push(serviceItem);
                    selectedPrice += parseFloat(serviceItem.nowprice);
                    selectedTimer += serviceItem.iusetime;
                }
            } else {
                //判断是否已存在
                var ownAdd = true; //不存在
                for (var i = 0; i < selectedDataHer.length; i++) {
                    if (serviceItem.itemid == selectedDataHer[i].itemid) {
                        ownAdd = false;
                        continue;
                    } else {
                        ownAdd = true;
                    }
                }
                if (ownAdd == true) {
                    selectedDataHer.push(serviceItem);
                    selectedPrice += parseFloat(serviceItem.nowprice);
                    selectedTimerHim += serviceItem.iusetime;
                }
            }

            var orderService = {
                selectedData: selectedData,
                selectedDataHer: selectedDataHer,
                aprice: selectedPrice,
                time: selectedTimer,
                timeHer: selectedTimerHim
            }
            localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(orderService));
        }
        //服务数据存在
        if (selectedData.length > 0) {
            if (only == 'true') { //单次单人选择
                if (type != 'SERVICE_MANY') { //套票不需要时间限制
                    if (needTime && needTime == '') needTime = 0;
                    if (parseInt(selectedTimer) >= parseInt(needTime)) {
                        if (from == 'technician' && selectedTimer != needTime && needTime != -1) {
                            Xalert.loading($rootScope.serviceText + '时长最多为 ' + needTime + '分钟', 1000);
                            return;
                        }
                    } else if (parseInt(selectedTimer) < $rootScope.mintime) {
                        Xalert.loading($rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟', 1000);
                        return;
                    }

                }
                var orderService = {
                    selectedData: selectedData,
                    selectedDataHer: selectedDataHer,
                    aprice: selectedPrice,
                    time: selectedTimer,
                    timeHer: selectedTimerHim
                }
                localStorage.setItem('singleServiceSelectData', angular.toJson(orderService));
                var data = {
                    selectedData: selectedData,
                    selectedDataHer: selectedDataHer,
                    aprice: selectedPrice,
                    time: selectedTimer,
                    timeHer: selectedTimerHim
                }
                if (from == 'home' && type != 'SERVICE_MANY') { //确认订单
//					$state.go('sure-order');
//所选服务id 逗号隔开
                    var confirmSelectedData = angular.fromJson(localStorage.getItem("singleServiceSelectData"));
                    var serviceid = '';
                    for (var i = 0; i < selectedData.length; i++) {
                        if (i == 0) {
                            serviceid = selectedData[i].itemid;
                        } else {
                            serviceid = serviceid + ',' + selectedData[i].itemid;
                        }
                    }
                    confirmSelectedData.itemid = serviceid;
                    localStorage.setItem('singleServiceSelectData', angular.toJson(confirmSelectedData)); //服务所选数据

                    var baseData = { //基础链接数据
                        from: 1,
                        userName: $rootScope.$_userInfo.user_name, //联系人
                        userMobile: $rootScope.$_userInfo.user_mobile //电话
                    }
                    $state.go('submit-service-order', {
                        data: angular.toJson(baseData)
                    })
                } else if (type == 'SERVICE_MANY') {
                    //所选服务id 逗号隔开
                    var serviceid = '';
                    for (var i = 0; i < selectedData.length; i++) {
                        if (i == 0) {
                            serviceid = selectedData[i].itemid;
                        } else {
                            serviceid = serviceid + ',' + selectedData[i].itemid;
                        }
                    }
                    var orderService = {
                        selectedData: selectedData,
                        selectedDataHer: selectedDataHer,
                        aprice: selectedPrice,
                        time: selectedTimer,
                        timeHer: selectedTimerHim,
                        itemid: serviceid
                    }
                    localStorage.setItem('singleServiceSelectData', angular.toJson(orderService)); //服务所选数据
                    var num = '';
                    if (from == 'store') {
                        num = 3;
                    } else {
                        num = 4;
                    }
                    if (storeData) {
                        storeData = angular.fromJson(storeData);
                        storeData.from = num;
                    } else {
                        storeData = {
                            from: num
                        }
                    }
                    $state.go('submit-order', {
                        data: angular.toJson(storeData)
                    });
                } else {
                    localStorage.setItem('selectServieData', 'true') //是否结算
                    history.go(-2);
                }
            } else { //单次双人选择
                if (selectedDataHer.length > 0) {
                    if (parseInt(selectedTimer) < $rootScope.mintime) {
                        Xalert.loading('给我选' + $rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟', 1000);
                    } else {
                        if (only == 'false' && parseInt(selectedTimerHim) < $rootScope.mintime) {
                            Xalert.loading('给他/她选' + $rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟', 1000);
                        } else {
                            var orderService = {
                                selectedData: selectedData,
                                selectedDataHer: selectedDataHer,
                                aprice: selectedPrice,
                                time: selectedTimer,
                                timeHer: selectedTimerHim
                            }
                            localStorage.setItem('singleServiceSelectData', angular.toJson(orderService));
                            localStorage.setItem('selectServieData', 'true') //是否结算
                            history.go(-2);
                        }
                    }
                } else {
                    Xalert.loading('请给他选' + $rootScope.serviceText, 1000)
                }
            }
        } else {
            Xalert.loading('请给我选' + $rootScope.serviceText, 1000)
        }
    }
    //页面跳转监听
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        switch (fromState.name) {
            case 'service-two':
                only = 'false'; //双人
                break;
            case 'tab.service':
                localStorage.setItem('Record', 2);
                break;
            case 'sure-order':
                serviceItem = angular.fromJson(localStorage.getItem('serviceItem')); //当前服务对象
                selected = serviceItem.selected;
                if (selected == true) {
                    $scope.cartext = "取消购买"
                }
                break;
            case 'store-single-service':
                if (from == 'home') {
                    localStorage.setItem('Record', 3);
                }
                if (localStorage.getItem('from') && localStorage.getItem('from') == 'technician') {
                    needTime = localStorage.getItem('needtime');
                    if (needTime == 'undefined') {
                        needTime = 0;
                    }
                }
                break;
            case 'store-stamps':
                localStorage.setItem('Record', 4);
                break;
        }
    });

    //返回按钮
    $scope.detailBack = function () {
        history.go(-1);
    }

    //	window.addEventListener("beforeunload", function(event) {
    //		Xalert.loading("逗比", 1000);
    //		history.go(-1);
    //	});
});