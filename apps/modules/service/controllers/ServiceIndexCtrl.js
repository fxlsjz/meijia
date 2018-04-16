'use strict';
/*
 author wanghui tzb wuhao
 */
//服务列表tab

app.controller('ServiceIndexCtrl', function ($rootScope, $stateParams, $scope, $state, $ionicScrollDelegate, getInterface, Xalert, Authentication, SwitchShopService, serviceChange, $ionicPopup) {


    $scope.openModal = function () {
        //城市列表
        $state.go('service-city');
    }

    $scope.choseStore = function () {
        //选择店面
        $state.go('store-choseStore');
    }

    $scope.tabType = '';
    $scope.servicetype_id = '';//分类Id
    $scope.orderPriceMode = '';//排序方式
    $scope.sortid = 0;


    var isBorder = $scope.sortid; // 保存actice项
    var aSpan = document.getElementById('tsb-hscroll').getElementsByClassName('scroll')[0].getElementsByTagName('span');
    $scope.categoryOrder = function (sortid) {
        $scope.items = [];
        $scope.sortid = sortid;
        isBorder = sortid;
        if ($scope.sortid == 1) {
            if (!$scope.isShow) { //价格
                $scope.isUp = !$scope.isUp;
                $scope.isDown = !$scope.isUp;
                if ($scope.isUp) {
                    $scope.orderPriceMode = 'ORDER_ASC'; //正序 [低-高]
                }
                if ($scope.isDown) {
                    $scope.orderPriceMode = 'ORDER_DESC'; //倒序 【高-低】
                }
            }
//			$scope.orderType = 'ORDER_PRICE'; //价格
            $scope.tabType = 'ORDER_PRICE';//价格
        } else if ($scope.sortid == 2) { //好评率
//			$scope.orderType = 'ORDER_COMMENT'; //好评
            $scope.tabType = 'ORDER_GOODCOMMENT';
            $scope.orderPriceMode = '';
            $scope.isUp = false;
            $scope.isDown = false;
        } else { //人气
//			$scope.orderType = 'ORDER_SALESVOLUME'; //人气
            $scope.tabType = 'ORDER_SALESVOLUME';//人气
            $scope.orderPriceMode = '';
            $scope.isUp = false;
            $scope.isDown = false;
        }
        getServiceList();
    }

    var isLoadingList = false; //判断列表是否正在获取数据
    var cityInfo = $rootScope.selCityInfo; //城市编码
    var isLoagingCollection = false; //判断是否正在访问收藏接口
    var searchText = ""; //需要搜索的文本

    $scope.searchText = { //搜索框文本
        text: ''
    };
//	$scope.switchTitle = true; //是否显示搜索栏
    $scope.serviceTypeWidth = window.innerWidth / 4; //服务分类item的宽度
    $scope.noData = false; //是否显示无数据
    $scope.isShowLoadMore = false; //是否显示上拉加载
    $scope.current_page = 1; //加载的页数
    $scope.selectServiceTypeId = ""; //选择的服务分类id
    $scope.serviceType = []; //服务分类列表
    $scope.items = []; //服务列表
    $scope.selectedData = []; //加入购买的数据
    $scope.money = 0; //总金额
    $scope.time = 0; //给我选的总时长
    $scope.singleServiceSelectDataCopy; //所选中的服务数据


    var serversEntrance = localStorage.getItem('serversEntrance');
    if (serversEntrance == "meijia") {
//		alert("美甲入口");
        $scope.servicetype_id = '1';
        getServiceList();

    } else if (serversEntrance == "meijie") {
//		alert("美睫入口");
        $scope.servicetype_id = '2';
        getServiceList();
    } else {
//		alert("tab切换");
        $scope.servicetype_id = '';

    }
    localStorage.setItem('serversEntrance', "");

//	$scope.openSearch = function() { //打开搜索
//		$scope.switchTitle = false;
//	}
//	$scope.closeSearch = function() { //关闭搜索
//		$scope.switchTitle = true;
//		$scope.searchText.text = ''; //关闭搜索框，并清空内容
//	}
    //切换店面
    //	SwitchShopService.initModal($scope);
    //跳转店面列表
    $scope.goStoreList = function () {
        $rootScope.clearServiceOrderData();
        $state.go('store', {
            isStamp: 1
        });
    };
    //搜索
    $scope.search = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e.keyCode == 13) {
            if (isLoadingList) return;
            searchText = $scope.searchText.text;
            isLoadingList = true;
            $scope.items = [];//清空数据
            getServiceList(false, true, false, 1);
        }
    };
    //下拉刷新
    $scope.doRefresh = function () {
        if (isLoadingList) {
            $scope.$broadcast('scroll.refreshComplete');
            return;
        }
        $scope.items = [];
        getServiceList(false, true, true, 1);
    };
    // 上拉加载
    $scope.loadMoreGoodsList = function () {
        if (isLoadingList) return;
        isLoadingList = true;
        getServiceList(true, false, false, $scope.current_page);
    };
    /**
     * 切换服务分类
     * @param {服务分类id} serviceTypeId
     */
    $scope.tab = function (serviceTypeId) {
        if (serviceTypeId == $scope.selectServiceTypeId) return;
        if (isLoadingList) return;
        isLoadingList = true;
        $scope.selectServiceTypeId = serviceTypeId;

        getServiceList(false, true, false, 1);
    };

    //加入购买or取消购买
    $scope.joinCar = function ($event, item) {
        $event.stopPropagation();
        if (!item.selected) { //添加购买
            item.selected = true;
            $scope.money = parseFloat($scope.money) + parseFloat(item.nowprice);
//			$scope.money = $scope.money.toFixed(1);
            $scope.money = $scope.money;
            $scope.time += item.iusetime;
            $scope.selectedData = $scope.selectedData.concat(item);
        } else { //取消购买
            item.selected = false;
            $scope.money = parseFloat($scope.money) - parseFloat(item.nowprice);
//			$scope.money = $scope.money.toFixed(1);
            $scope.money = $scope.money;
            for (var i = 0; i < $scope.selectedData.length; i++) {
                if ($scope.selectedData[i].itemid == item.itemid) {
                    $scope.selectedData.splice(i, 1);
                    continue;
                }
            }
            $scope.time -= item.iusetime;
        }
        if ($scope.selectedData.length == 0) {
            localStorage.removeItem("singleServiceSelectDataCopy");
        } else {
            $scope.singleServiceSelectDataCopy.selectedData = $scope.selectedData;
            $scope.singleServiceSelectDataCopy.time = $scope.time;
            $scope.singleServiceSelectDataCopy.aprice = $scope.money;
            localStorage.setItem('singleServiceSelectDataCopy', angular.toJson($scope.singleServiceSelectDataCopy));
        }

    };
    //跳转详情
    $scope.goDetail = function (item) {
        localStorage.setItem('isActive', 'true'); //给我选
        localStorage.setItem('from', 'home'); //从哪来
        localStorage.setItem('type', 'SERVICE_SINGLE'); //单次
        localStorage.setItem("serviceType", "SERVICE_ONLINE"); //到家
        localStorage.setItem('serviceItem', angular.toJson(item));
        $state.go('store-service-detail');
    };
    //服务收藏
    $scope.goodsCollection = function (item, $event) {
        $event.stopPropagation();
        if (isLoagingCollection) return;
        isLoagingCollection = true;
        serviceChange.collection(item.itemid, function (results) {
            if (results.status == 'Y') {
                item.iscollection = 'Y';
            } else {
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
            isLoagingCollection = false;
        });
    };
    //服务取消收藏
    $scope.goodsCollectionDel = function (item, $event) {
        $event.stopPropagation();
        if (isLoagingCollection) return;
        isLoagingCollection = true;
        serviceChange.uncollection(item.itemid, function (results) {
            if (results.status == 'Y') {
                item.iscollection = 'N';
            } else {
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
            isLoagingCollection = false;
        });
    };
    //下一步提交
    $scope.next = function () {
        //是否登录
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        ;
        if ($scope.selectedData.length == 0) {
            Xalert.loading('请选择 ' + $rootScope.serviceText);
            return;
        }
        if ($scope.time < $rootScope.mintime) {
            Xalert.loading($rootScope.serviceText + '时长至少为 ' + $rootScope.mintime + '分钟');
            return;
        }
        var confirmSelectedData = $scope.singleServiceSelectDataCopy;
        //所选服务id 逗号隔开
        var serviceid = '';
        for (var i = 0; i < $scope.selectedData.length; i++) {
            if (i == 0) {
                serviceid = $scope.selectedData[i].itemid;
            } else {
                serviceid = serviceid + ',' + $scope.selectedData[i].itemid;
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
        });
    };
    /**
     * 获取服务分类
     */
    function getServiceType() {
        isLoadingList = true;
        var options = {
            module: 'FM_APP_SERVICETYPE_ONE_LEVEL_LIST',
            params: {}
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y' && results.results != null && results.results.length > 0) {
                $scope.serviceType = results.results;
            } else {
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
            getServiceList(false, false, false, 1); //获取服务列表
        });
    }

    /**
     *获取服务列表数据
     * @param {调用成功后是否是添加数据} isAddData
     * @param {调用失败后是否需要清空数据} isEmptyData
     * @param {是否是下拉刷新} isRefresh
     * @param {加载的页数} current_page
     */
    $scope.items = [];
    function getServiceList(isAddData, isEmptyData, isRefresh, current_page) {
        var options = {
            module: 'FM_APP_SERVICE_LIST',
            params: {
                pageoffset: $scope.items.length,
                page_size: 10,
                city_code: cityInfo.cityCode, //城市code
                type: 'SERVICE_SINGLE',
                service_type: 'SERVICE_ONLINE',
//				servicetype_id: $scope.selectServiceTypeId,
                service_search: searchText,
                service_ordertype: $scope.tabType,//排序类型
                servicetype_id: $scope.servicetype_id,//服务分类
                service_ordermode: $scope.orderPriceMode//排序方式
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (isRefresh)
                $scope.$broadcast('scroll.refreshComplete');
            if (results.status == 'Y' && results.results != null) {
                var items = results.results;

                if (items && items.length > 0) { //有数据
                    initServiceList(items);
                    if (isAddData) { //添加数据
                        $scope.items = $scope.items.concat(items);
                    } else { //刷新数据
                        $scope.items = items;
                    }
                } else if (!isAddData) {
                    $scope.items = [];
                }
                //判断是否显示空数据提示
                if ($scope.items && $scope.items.length > 0) {
                    $scope.noData = false;
                } else {
                    $scope.noData = true;
                }
                //判断是否显示上拉加载
                if (!items || items.length == 0 || items.length % 10 != 0) {
                    $scope.isShowLoadMore = false;
                } else {
                    $scope.isShowLoadMore = true;
                }
                $scope.current_page = current_page;
                var view = $ionicScrollDelegate.$getByHandle('scrollContent');
                view.resize();
                if (!isAddData) view.scrollTop(true);
            } else {
                if (isEmptyData) {
                    $scope.items = [];
                    var view = $ionicScrollDelegate.$getByHandle('scrollContent');
                    view.resize();
                    view.scrollTop(true);
                    $scope.isShowLoadMore = false;
                    $scope.isShowNoData = true;
                }
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
            isLoadingList = false;
        });
    };
    //遍历服务列表数据添加已加入购物车的参数
    function initServiceList(items) {
        if (items == null || items.length == 0) return;
        for (var i = 0; i < items.length; i++) {
            items[i].selected = false;
            for (var j = 0; j < $scope.selectedData.length; j++) {
                if (items[i].itemid == $scope.selectedData[j].itemid) {
                    items[i].selected = true;
                }
            }
        }
    }

    //监听页面跳转
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (toState.name == 'tab.service' && fromState.name == "sure-order") { //确认订单返回
            $scope.singleServiceSelectDataCopy = angular.fromJson(localStorage.getItem('singleServiceSelectData'));
            $scope.selectedData = $scope.singleServiceSelectDataCopy.selectedData;
            $scope.money = $scope.singleServiceSelectDataCopy.aprice; //总价格
            $scope.time = $scope.singleServiceSelectDataCopy.time; //总时间
        }
        if (fromState.name == "store-service-detail") {
            if (localStorage.getItem('singleServiceSelectDataCopy')) {
                $scope.singleServiceSelectDataCopy = angular.fromJson(localStorage.getItem('singleServiceSelectDataCopy'));
                $scope.selectedData = $scope.singleServiceSelectDataCopy.selectedData;
                $scope.money = $scope.singleServiceSelectDataCopy.aprice; //总价格
                $scope.time = $scope.singleServiceSelectDataCopy.time; //总时间
            }
        }
        if (toState.name == 'tab.service' && fromState.name != "sure-order") { //不是确认订单返回
            $scope.singleServiceSelectDataCopy = localStorage.getItem("singleServiceSelectDataCopy");
            $scope.singleServiceSelectDataCopy = $scope.singleServiceSelectDataCopy ? angular.fromJson($scope.singleServiceSelectDataCopy) : {
                selectedData: [],
                aprice: 0.0,
                time: 0
            };
            $scope.selectedData = $scope.singleServiceSelectDataCopy.selectedData; //加入购买的数据
            $scope.money = $scope.singleServiceSelectDataCopy.aprice; //总金额
            $scope.time = $scope.singleServiceSelectDataCopy.time; //给我选的总时长
        }
        if (toState.name == 'tab.service') {
            getServiceType();
        }
        //if(fromState.name == 'tab.home') {
        //	var type = $stateParams.type;
        //	alert(type)
//			if(type == "meijia"){
//				alert(1)
//			}
//		}
    });

    $scope.activeItemc = '';
    //分类
    var loadProType = function () {
        var options = {
            data: $scope.itemsType,
            module: 'FM_APP_SERVICETYPE_ONE_LEVEL_LIST',
            params: {}
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.itemsType = results.results;
                if (serversEntrance == "meijia") {
                    $scope.activeItemc = $scope.servicetype_id;
                }
                if (serversEntrance == "meijie") {
                    $scope.activeItemc = $scope.servicetype_id;
                }
            }
        });
    }
    loadProType();
    //点击分类
    var removePopup;
    var bFlag = false;
    $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (bFlag) {
            removePopup.close();
        }

    });
    $scope.proType = function () {
        bFlag = true;
        if (aSpan) {
            if (document.getElementsByClassName('backdrop')[0]) {
                document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active backdropSelf';
            }
            angular.forEach(aSpan, function (value, index) {
                value.className = 'disable-user-behavior';
            })
        }
        $scope.isShow = !$scope.isShow;
        removePopup = $ionicPopup.show({
            cssClass: 'mall',
            templateUrl: 'apps/modules/service/templates/serviceGoods-type.html',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
                onTap: function () {
                    $scope.isShow = !$scope.isShow;
                    $scope.sortid = isBorder;
                    if (aSpan[isBorder]) {
                        aSpan[isBorder].className = 'disable-user-behavior active';
                    }
                    if (document.getElementsByClassName('backdrop')[0]) {
                        document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active ';
                    }
                    bFlag = false;
                }
            },
                {
                    text: '<font color="#333">确定</font>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.items = [];
                        if (aSpan[isBorder]) {
                            aSpan[isBorder].className = 'disable-user-behavior active';
                        }
                        if (document.getElementsByClassName('backdrop')[0]) {
                            document.getElementsByClassName('backdrop')[0].className = 'backdrop visible active ';
                        }
                        $scope.categoryOrder($scope.sortid);
                        $scope.isShow = !$scope.isShow;
                        bFlag = false;
                    }
                }
            ]
        })
    }
    //分类-con
    $scope.proTypeItem = function (servicetype_id, name) {
        $scope.activeItemc = servicetype_id;
        if (name != '全部') {
            $scope.servicetype_id = servicetype_id;
        } else {
            $scope.servicetype_id = '';
        }
    };
});