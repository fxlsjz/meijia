'use strict';
/**
 * 商品订单
 */
app.controller('CommodityCtrl', function ($ionicScrollDelegate, $rootScope, $scope, $ionicGesture, $timeout, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, pageData) {

    var paySuccess = $stateParams.paySuccess;//Y:支付成功；N：支付失败
    // $scope.sortid - 0:未支付；1：未完成；2：全部
    if (paySuccess == 'Y') {
        $scope.sortid = 1;//未完成
    } else if (paySuccess == 'N') {
        $scope.sortid = 0;//未支付
    } else {
        $scope.sortid = 0;//未支付
    }

    var isLoadingList = false; //判断列表是否正在获取数据
    $scope.isNoData = false;//false：不显示无数据布局；true：显示无数据布局
    $scope.canLoadMore = true;
    $scope.isShowLoadMore = true;

    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }

    $scope.items = [];//订单列表
    $scope.page = 1;
    $scope.categoryOrder = function (sortid, pullDown) {

        if (isLoadingList) {
            return;
        }
        isLoadingList = true;

        $ionicScrollDelegate.$getByHandle('listScroll').scrollTop();//点击标签栏时滑动到顶部
        $scope.sortid = sortid;

        /****************切换标签时重置数据******************/
        $scope.items = [];
        $scope.page = 1;
        $scope.isNoData = false;//不显示无数据界面
        $scope.canLoadMore = true;
        if (pullDown) {//下拉
            $scope.isShowLoadMore = false;//不显示上拉动画
        } else {//非下拉刷新
            $scope.isShowLoadMore = true;//显示上拉动画
        }
        /****************切换标签时重置数据******************/

        if ($scope.sortid == 0) {
            $scope.order_statetype = "ORDER_WAITPAY"; //未支付
        } else if ($scope.sortid == 1) {
            $scope.order_statetype = "ORDER_IN"; //未完成

        } else if ($scope.sortid == 2) {
            $scope.order_statetype = 'ORDER_ALL'; //全部
        }

        loadData();

    }
    //商品订单列表接口
    var loadData = function () {
        var options = {
            module: 'FM_SHOP_ORDER_LIST',
            params: {
                current_page: $scope.page,
                page_size: 10,
                order_statetype: $scope.order_statetype
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                // $scope.page = params.page;
                // $scope.counts = results.counts;
                /*数组插入数据*/
                angular.forEach(results.results, function (value, index) {
                    $scope.items.push(value);
                })
                // $scope.order_state == $scope.items.order_state;

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
                $scope.isNoData = true;
                $scope.canLoadMore = false;
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }


    //刷新商品订单列表
    $rootScope.$on('refreshGoodsOrderList', function (event, data) {
        $scope.categoryOrder($scope.sortid, false);
    });

    //默认显示列表种类
    $scope.categoryOrder($scope.sortid, false);

    //下拉刷新
    $scope.doRefresh = function () {

        $timeout(function () {
            $scope.items = [];
            $scope.categoryOrder($scope.sortid, true);
            $scope.$broadcast('scroll.refreshComplete');
        }, 500);
    };

    //上拉加载
    $scope.loadMoreGoodsList = function () {
        if (isLoadingList) {
            return;
        }
        isLoadingList = true;
        $scope.isShowLoadMore = true;
        $scope.page++;
        loadData();
    };


    //跳转订单详情
    $scope.goGoodsOrderDetail = function (item) {
        //跳转时调该接口，获取余额和实付款传给订单详情
        var options = {
            page: false,
            module: 'FM_SHOP_ORDER_STATE',//18.3.	获取订单支付状态信息
            params: {
                oid: item.oid
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                $state.go('my-order-detail', {
                    oid: item.oid,
                    actualprice: results.results.actualprice,
                    balance: results.results.balance,
                    timestamp: String(Date.parse(new Date()))
                });
            }
        });
    }

    //取消订单
    var flag = false;
    var deletePopup;
    $scope.$on('$stateChangeStart', function (event, toState, tormState) {
        if (flag) {
            deletePopup.close();
        }
    })
    $scope.cancelOrder = function (item, $event) {
        $event.stopPropagation();
        flag = true;
        deletePopup = $ionicPopup.confirm({
            cssClass: 'index',
            title: '取消该订单?',
            buttons: [{
                text: '不取消',
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
                            module: 'FM_SHOP_ORDER_CANCEL',
                            params: {
                                oid: item.oid
                            }
                        };
                        getInterface.jsonp(options, function (results, params) {
                            if (results.status == 'Y') {
                                $timeout(function () {
                                    $scope.categoryOrder($scope.sortid, false);
                                }, 500);
                            } else {
                                Xalert.loading(results.msg, 500);
                            }
                        });
                    }
                    loadData();
                    flag = false;
                }
            }]
        });
    }

    //查看物流
    $scope.checkLogistics = function (item, $event) {
        $event.stopPropagation();
        $state.go('my-send', {id: item.oid});
    }

    //确认收货
    $scope.receiptCommodity = function (item, $event) {
        $event.stopPropagation();
        flag = true;
        deletePopup = $ionicPopup.confirm({
            cssClass: 'index',
            title: '确认收货',
            buttons: [{ //Array[Object] (可选)。放在弹窗footer内的按钮。
                text: '取消',
                type: 'button-default',
                onTap: function (e) {
                    flag = false;
                }
            }, {
                text: '确定',
                type: 'button-positive',
                onTap: function () {
                    var loadData = function () {
                        var options = {
                            page: false,
                            module: 'FM_SHOP_ORDER_CONFIRM',
                            params: {
                                oid: item.oid
                            }
                        };
                        getInterface.jsonp(options, function (results, params) {
                            if (results.status == 'Y') {
                                $timeout(function () {
                                    $scope.categoryOrder(2, false);
                                }, 500);

                            } else {
                                Xalert.loading(results.msg, 500);
                            }
                        });
                    }
                    loadData();
                    flag = false;
                }
            }]
        });
    }

    //去评价（一个或多个商品）
    $scope.goEvaluate = function (item, $event) {

        $event.stopPropagation();
        //清除之前保存的值
        localStorage.removeItem('commodityList');
        localStorage.removeItem('commodity');
        localStorage.removeItem('orderTime');
        localStorage.removeItem('orderOid');


        var commodityArray = [];//未评价商品列表
        angular.forEach(item.product_list, function (value, index, array) {
            if (value.iscommon == 'Y') {//可评价商品
                commodityArray.push(value);
            }
        });

        localStorage.setItem('orderTime', item.order_stime);
        localStorage.setItem('orderOid', item.oid);
        localStorage.setItem('evaluateFromPage', '1');//1：商品订单列表；2：商品订单详情
        if (commodityArray.length == 1) {//一个商品
            localStorage.setItem('commodity', angular.toJson(item.product_list[0]));
            $state.go('my-myassess', {timestamp: String(Date.parse(new Date()))});
        }
        if (commodityArray.length > 1) {//多个商品
            localStorage.setItem('commodityList', angular.toJson(commodityArray));
            $state.go('my-selece-evaluation');
        }

    }

    //去支付
    $scope.goPay = function (item, $event) {
        $event.stopPropagation();
        var options = {
            page: false,
            module: 'FM_SHOP_ORDER_STATE',//18.3.	获取订单支付状态信息
            params: {
                oid: item.oid
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                $scope.orderState = results.results;
                $scope.balance = $scope.orderState.balance;
                $scope.time = $scope.orderState.time;
            }
        });
        $timeout(function () {
            $state.go('my-pay', {
                oid: item.oid,
                actualprice: item.actualprice,
                balance: $scope.balance,
                time: $scope.time,
                type: 'mall',
                processType: 'commoditySecondList'
            });
        }, 800);
    }

    //获取订单中商品数量
    $scope.getNum = function (list) {
        var num = 0; //商品数量
        angular.forEach(list, function (value, index) {
            num += parseInt(value.num);
        });
        return num;
    }
});

/*
 订单详情主控制器
 */
app.controller('CommodityOrderDetail', function ($rootScope, $scope, $cookies, $location, $stateParams, $interval, $ionicSlideBoxDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state, $ionicPopup) {

    var oid = $stateParams.oid;
    var balance = $stateParams.balance;
    var host = $location.host(); //域名
    $scope.actualprice = '';//实付款
    $scope.balance = parseFloat(balance);//余额
    /*选填框清空*/
    $scope.cancle = function () {
        document.getElementById('notes').value = '';
    }

    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }
    //订单详情接口
    var loadCommodityDetail = function () {
        var options = {
            module: 'FM_SHOP_ORDER_INFO',
            params: {
                oid: oid
            }
        }

        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {

                $scope.iteming = results.results;
                $scope.counts = results.results.delivery_list.length;

                $scope.actualprice = $scope.iteming.actualprice;
                $scope.order_state = $scope.iteming.order_state;

                //倒计时
                $scope.time = $scope.iteming.pay_surtime;

                //默认支付方式处理
                if (parseFloat($scope.balance) < parseFloat($scope.actualprice)) {//余额小于实付款
                    $scope.bal = 2;
                    $scope.balNo = {pointerEvents: 'none'}
                } else {
                    $scope.bal = 1;
                    $scope.balNo = {pointerEvents: 'auto'}
                }
                if ($scope.bal == 1) {
                    $scope.paytype = 'PAYTYPE_PRICE';
                }
                if ($scope.bal == 2) {
                    $scope.paytype = 'PAYTYPE_WECHATWEB';
                }
                //订单状态
                if ($rootScope.appValues) {
                    $scope.orderStatus = $rootScope.appValues[$scope.iteming.order_state].dic_desc;
                }
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }
    loadCommodityDetail();


    //查看物流
    $scope.sendFunc = function () {
        $state.go('my-send', {id: oid});
    }

    //取消订单
    var flag = false;
    var deletePopup;
    $scope.$on('$stateChangeStart', function (event, toState, tormState) {
        if (toState.name == 'tob.forum') {
            if (flag) {
                deletePopup.close();
            }
        }
    })
    //取消订单
    $scope.quxiao = function (oid) {
        var confirmPopup = $ionicPopup.confirm({
            cssClass: 'index',
            title: '取消该订单?',
            buttons: [{ //Array[Object] (可选)。放在弹窗footer内的按钮。
                text: '不取消',
                type: 'button-default',
                onTap: function (e) {
                    flag = false;
                }
            }, {
                text: '取消订单',
                type: 'button-positive',
                onTap: function () {
                    var options = {}
                    var loadData = function () {
                        options = {
                            page: false,
                            module: 'FM_SHOP_ORDER_CANCEL',
                            params: {
                                oid: oid
                            }
                        };

                        getInterface.jsonp(options, function (results, params) {
                            if (results.status == 'Y') {
                                $timeout(function () {
                                    window.history.go(-1);
                                    $rootScope.$broadcast('refreshGoodsOrderList');//刷新商品订单列表
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
        confirmPopup.then(function (res) {

        });

    }

    //确认收货
    $scope.reward = function (oid) {
        var confirmPopup = $ionicPopup.confirm({
            cssClass: 'index',
            title: '确认收货',
            buttons: [{ //Array[Object] (可选)。放在弹窗footer内的按钮。
                text: '取消',
                type: 'button-default',
                onTap: function (e) {
                    flag = false;
                }
            }, {
                text: '确定',
                type: 'button-positive',
                onTap: function () {
                    var options = {}
                    var loadData = function () {
                        options = {
                            page: false,
                            module: 'FM_SHOP_ORDER_CONFIRM',
                            params: {
                                oid: oid
                            }
                        };
                        getInterface.jsonp(options, function (results, params) {
                            if (results.status == 'Y') {
                                $timeout(function () {
                                    window.history.go(-1);
                                    $rootScope.$broadcast('refreshGoodsOrderList');//刷新商品订单列表
                                }, 500);

                            } else {
                                Xalert.loading(results.msg, 500);
                            }
                        });

                    }
                    loadData();
                    flag = false;
                }
            }]

        });
        confirmPopup.then(function (res) {

        });

    }


    /*支付方式*/
    $scope.bal = 1;//1:余额支付2：微信支付
    $scope.balancing = function (s) {
        $scope.bal = s;
    }

    /*倒计时*/
    $scope.countdown = $interval(function () {
        $scope.time--;
        $scope.timeM = parseInt($scope.time / 60);
        $scope.timeS = $scope.time % 60;
        $scope.timeM > 0 ? $scope.TimeFormat = $scope.timeM + ' 分 ' + $scope.timeS + ' 秒 ' : $scope.TimeFormat = $scope.timeS + ' 秒 ';
        if ($scope.time == 0) {
            //alert('00000')
            $scope.time = 1;
            $interval.cancel($scope.countdown);
            $scope.btnclick = {
                background: '#dedede',
                pointerEvents: 'none'
            };
            $rootScope.$broadcast('refreshGoodsOrderList');//刷新商品订单列表
        }
    }, 1000);


    //去支付
    $scope.quickPay = function () {

        if ($scope.bal == 1) {
            $scope.paytype = 'PAYTYPE_PRICE';
        }
        if ($scope.bal == 2) {
            $scope.paytype = 'PAYTYPE_WECHATWEB';
        }

        //18.4.	订单支付
        var options = {
            module: 'FM_SHOP_ORDER_REPAY',
            params: {
                oid: oid,
                paytype: $scope.paytype,
                actualprice: $scope.actualprice
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                if ($scope.bal == 1) {//余额支付
                    Xalert.loading('支付成功');
                    window.history.go(-1);
                } else {//微信支付
                    var company_id = $cookies.get('company_id');
                    var backLink = '&processType=serviceSecondDetail' + '&timestamp=' + (String(Date.parse(new Date()))) + '&back=http://' + host + '/my/commoditylist/?pay=2';
                    var payLink = $rootScope.payPath;
                    var link = payLink + 'actualprice=' + $scope.actualprice + '&oid=' + oid + '&company_id=' + company_id;
                    $window.location.href = link + backLink;
                }
                $rootScope.$broadcast('refreshGoodsOrderList');//刷新商品订单列表
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }
    //	跳转去评价
    $scope.goEvaluate = function (item) {
        //清除之前保存的值
        localStorage.removeItem('commodityList');
        localStorage.removeItem('commodity');
        localStorage.removeItem('orderTime');
        localStorage.removeItem('orderOid');


        var commodityArray = [];//未评价商品列表
        angular.forEach(item.product_list, function (value, index, array) {
            if (value.iscommon == 'Y') {//可评价商品
                commodityArray.push(value);
            }
        });

        localStorage.setItem('orderTime', item.order_time);
        localStorage.setItem('orderOid', item.oid);
        localStorage.setItem('evaluateFromPage', '2');//1：商品订单列表；2：商品订单详情
        if (commodityArray.length == 1) {//一个商品
            localStorage.setItem('commodity', angular.toJson(item.product_list[0]));
            $state.go('my-myassess', {timestamp: String(Date.parse(new Date()))});
        }
        if (commodityArray.length > 1) {//多个商品
            localStorage.setItem('commodityList', angular.toJson(commodityArray));
            $state.go('my-selece-evaluation');
        }
    }

    //刷新订单详情数据
    $rootScope.$on('refreshCommodityOrderDetail', function (event, data) {
        loadCommodityDetail();
    });


});

/*商品评价
 author wanghui
 */

//商品评价
app.controller('GoodsAssessCtrl', function ($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, $ionicPlatform, Util, pageData, $cookies, $window, QyWechat, ImagePreviewModal, $timeout) {

    ImagePreviewModal.initModal($scope);
    $scope.evainfo = angular.fromJson(localStorage.getItem('commodity')); //评价商品信息
    $scope.time = parseInt(localStorage.getItem('orderTime'));//下单时间
    $scope.oid = localStorage.getItem('orderOid');//订单id
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
        $scope.product_id = $scope.evainfo.product_id;
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

            var options = {
                module: 'FM_SHOP_COMMENT_PRODUCT',
                params: {
                    product_id: $scope.product_id, //产品id
                    cimg: img, //图片
                    commscore: $scope.evaDime, //好中差评价
                    content: $scope.inut.text, //评价内容
                    score: $scope.courseValue, //星级
                    poiid: $scope.poiid, //订单详情id
                    oid: $scope.oid, //订单id
                    is_anonymity: $scope.nm //是否匿名
                }
            };
            getInterface.post(options, function (results) {
                if (results.status == 'Y') {
                    Xalert.loading('评价成功');
                    $timeout(function () {
                        $scope.inut.text = ''; //数据初始化
                        $scope.mark = 5;
                        $scope.courseValue = 5;
                        $scope.type = 1;
                        $scope.evaDime = 'COMMENT_TYPE_PRAISE';
                        if (localStorage.getItem('commodityList')) {
                            var commArr = [];
                            var commodityArr = angular.fromJson(localStorage.getItem('commodityList'));
                            if (commodityArr.length > 1) {//返回选择评价界面
                                angular.forEach(commodityArr, function (value, index, array) {
                                    if (value.product_id != $scope.product_id) {
                                        commArr.push(value);
                                    }
                                });
                                localStorage.setItem('commodityList', angular.toJson(commArr));
                                $rootScope.$broadcast('refreshSelectEvaluateList');//刷新选择评价界面
                                window.history.go(-1);
                            } else {//不返回选择评价界面
                                if (localStorage.getItem('evaluateFromPage') == '2') {//;来自订单详情多商品评价
                                    window.history.go(-3);
                                    localStorage.removeItem('evaluateFromPage');
                                } else {//来自订单列表多商品评价
                                    window.history.go(-2);
                                    localStorage.removeItem('evaluateFromPage');
                                }
                            }
                        } else {
                            if (localStorage.getItem('evaluateFromPage') == '2') {//;来自订单详情单商品评价
                                window.history.go(-2);
                                localStorage.removeItem('evaluateFromPage');
                            } else {//来自订单列表多商品评价
                                window.history.go(-1);
                                localStorage.removeItem('evaluateFromPage');
                            }
                        }
                    }, 500);
                    $rootScope.$broadcast('refreshGoodsOrderList');//刷新商品订单列表
                    $rootScope.$broadcast('refreshCommodityOrderDetail');//刷新商品订单详情
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
                    window.history.go(-1);
                    bFlag = false
                }
            }]
        })
    }

});

/**
 * 选择评价 by zhoulei
 */

//选择评价
app.controller('SeleceEvaluationCtrl', function ($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, $timeout, pageData, $cookies) {
    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }
    //取值
    $scope.items = angular.fromJson(localStorage.getItem('commodityList'));
    //刷新选择评价列表
    $rootScope.$on('refreshSelectEvaluateList', function (event, data) {
        var commJson = localStorage.getItem('commodityList');
        $scope.items = angular.fromJson(commJson);
    });
    //	跳转去评价
    $scope.goEvaluate = function (item) {
        localStorage.setItem('commodity', angular.toJson(item));
        $state.go('my-myassess');
    }
});