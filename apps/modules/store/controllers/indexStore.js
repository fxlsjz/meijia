'use strict';
/*
 * author wuhao
 * 预约到店主控制器
 */
app.controller('indexStore', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $stateParams, $ionicScrollDelegate) {
    $scope.openModals = function () {
        //城市列表
        $state.go('service-city');
    }
    $scope.searchTxt = {
        "text": ''
    };
    SwitchEnterpriseService.initModal($scope);
    $scope.isStamp = $stateParams.isStamp; //2是套票
    $scope.storeType = 'ORDER_POSITION'; //排序类型
    $scope.items = []; //列表内容
    $scope.current_page = 1; //第几页数据
    $scope.noData = false; //是否显示无数据
    $scope.isShowLoadMore = false; //是否显示上拉加载
    var isLoadingList = false; //判断列表是否正在获取数据
    var isCollect = false; //判断是否正在访问收藏接口
    var cityInfo = $rootScope.selCityInfo; //城市编码
    var coordinate = $rootScope.coordinate; //定位信息

    var searchText = ""; //搜索文本
    $scope.latitude = coordinate ? coordinate.latitude : ''; //定位纬度
    $scope.longitude = coordinate ? coordinate.longitude : ''; //定位经度
    getData(false, false, false, $scope.current_page); //获取数据
    localStorage.setItem("Record", 2); //记录页面个数
    /**
     *获取店面列表数据
     * @param {调用成功后是否是添加数据} isAddData
     * @param {调用失败后是否需要清空数据} isEmptyData
     * @param {是否是下拉刷新} isRefresh
     * @param {加载的页数} current_page
     */
    $scope.items = [];
    function getData(isAddData, isEmptyData, isRefresh, current_page) {
        var options = {
            //data: $scope.items,
            //canLoadMore: false,
            module: 'FM_APP_STORE_LIST',
            params: {
                city_code: cityInfo.cityCode, //城市code
                page_size: 10, //页大小
//				current_page: current_page, //访问页
                pageoffset: $scope.items.length,
                service_search: searchText, //检索内容
                service_ordertype: $scope.storeType, //排序类型
                longitude: $scope.longitude, //经度
                latitude: $scope.latitude //纬度
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (isRefresh)
                $scope.$broadcast('scroll.refreshComplete');
            if (results.status == 'Y') { //接口访问成功
                var result = results.results;
                //设置数据
                if (result && result.length > 0) { //有数据
                    if (isAddData) { //添加数据
                        $scope.items = $scope.items.concat(result);
                    } else { //刷新数据
                        $scope.items = result;
                    }
                } else if (!isAddData) {
                    $scope.items = [];
                }
                //判断是否显示上拉加载
                if (!result || result.length == 0 || result.length % 10 != 0) {
                    $scope.isShowLoadMore = false;
                } else {
                    $scope.isShowLoadMore = true;
                }
                $scope.current_page = current_page;
                var view = $ionicScrollDelegate.$getByHandle('scrollContent');
                view.resize();
                if (!isAddData) view.scrollTop(true);
            } else { //接口访问失败
                if (isEmptyData) {
                    $scope.items = [];
                    var view = $ionicScrollDelegate.$getByHandle('scrollContent');
                    view.resize();
                    view.scrollTop(true);
                    $scope.isShowLoadMore = false;
                }
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
            //判断是否显示空数据提示
            if ($scope.items && $scope.items.length > 0) {
                $scope.noData = false;
            } else {
                $scope.noData = true;
            }
            isLoadingList = false;
        });
    }

    //返回按钮
    $scope.goback = function () {
        history.go(-1);
    };
    //下拉刷新
    $scope.stroeDoRefresh = function () {
        //判断是否正在访问接口
        if (isLoadingList)
            return;
        isLoadingList = true;
        $scope.items = [];//清空数据
        getData(false, false, true, 1); //获取数据
    };
    //上拉加载
    $scope.loadMoreGoodsList = function () {
        //判断是否正在访问接口
        if (isLoadingList)
            return;
        isLoadingList = true;
        getData(true, false, false, $scope.current_page + 1); //获取数据
    };
    //切换排序类型
    $scope.selStoreType = function (storeType) {
        $scope.items = [];
        //判断是否正在访问接口
        if (isLoadingList)
            return;
        isLoadingList = true;
        if ($scope.storeType == storeType)
            return;
        $scope.storeType = storeType;
        getData(false, true, false, 1);
    };
    //搜索
    $scope.search = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e.keyCode == 13) {
            //判断是否正在访问接口
            if (isLoadingList)
                return;
            isLoadingList = true;
            searchText = $scope.searchTxt.text;
            $scope.items = [];
            getData(false, true, false, 1);

        }
    };
    //收藏
    $scope.collectClick = function ($event, item) {
        $event.stopPropagation();
        //登录超时
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        //判断是否正在访问接口
        if (isCollect) return;
        isCollect = true;

        var loadData = function () {
            var options = {
                module: item.iscollection == "Y" ? 'FM_APP_CANCELCOLLECT_STORE' : 'FM_APP_COLLECT_STORE',
                params: {
                    store_id: item.store_id //店面id
                }
            };
            getInterface.jsonp(options, function (results, params) {
                if (results.status == 'Y') {
                    item.iscollection = item.iscollection == "Y" ? "N" : "Y";
                } else {
                    if (results.error_msg)
                        Xalert.loading(results.error_msg, 1000);
                }
                isCollect = false;
            });
        }
        loadData();
    }

    //查看地图
    $scope.goMap = function () {
        if ($scope.items.length == 0) return;
        localStorage.storelist = angular.toJson($scope.items);
        $state.go('store-map', ({
            type: $scope.storeType,
            isStamp: $scope.isStamp,
            isFromList: 'list'
        }));
    };
    //进详情
    $scope.goDetail = function (storeInfo) {

        //		if($scope.isStamp == 1) { //预约到店店面详情
        //			$state.go('store-details', ({
        //				storeId: storeInfo.store_id,
        //				store_dis: storeInfo.store_dis,
        //				Record: 3
        //			}));
        //		} else if($scope.isStamp == 2) { //店面套票详情
        //			$state.go('store-stamps', ({
        //				storeId: storeInfo.store_id,
        //				store_dis: storeInfo.store_dis,
        //				Record: 3
        //			}));
        //		}
        $state.go('store-details', ({
            storeId: storeInfo.store_id,
            store_dis: storeInfo.store_dis,
            Record: 3
        }));

    };
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (toState.name == "tab.store") {
            localStorage.clear();
        }
    });
});


/**
 * 店面相册
 * wuhao
 */
app.controller('storeAlbumCtrl', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $stateParams) {
    $scope.bgImag = $stateParams.list;
    $scope.imgPath = $scope.bgImag.split(",");
    $scope.imgPathNum = $scope.imgPath.length;
    $scope.storeId = $stateParams.storeId;
    $scope.isStamp = $stateParams.isStamp;

    $scope.goBack = function () {
        window.history.go(-1);
    }
});
//搜索服务
app.controller('searchCtrl', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $stateParams) {
    $scope.searchTxt = {
        "text": ''
    };
    $scope.storeId = $stateParams.storeId;
    $scope.isStamp = $stateParams.isStamp;
    $scope.searchTxt.text = $stateParams.search;
    $scope.searcht = $scope.searchTxt.text;
    $scope.serviceTypeId = $stateParams.typeId;
    //收藏服务
    $scope.serviceClick = function ($event, id, subscript) {
        $event.stopPropagation();
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        ;
        var loadData = function () {
            if (subscript == 'N') {
                $scope.serviceType = 'FM_APP_COLLECT_SERVICE';
            } else {
                $scope.serviceType = 'FM_APP_CANCELCOLLECT_SERVICE';
            }
            var options = {
                module: $scope.serviceType,
                params: {
                    itemid: id

                }
            };
            getInterface.jsonp(options, function (results, params) {
                $scope.subscri = '';
                if (results.status == 'Y') {

                    if ($scope.serviceType == 'FM_APP_COLLECT_SERVICE') {
                        $scope.subscri = 'Y';
                    } else {
                        $scope.subscri = 'N';
                    }
                    for (var i = 0; i < $scope.serviceList.length; i++) {
                        if ($scope.serviceList[i].itemid == id) {
                            $scope.serviceList[i].iscollection = $scope.subscri;
                        }
                    }
                }
            });
        }
        loadData();
    }
    //		跳转服务详情
    $scope.goServiceDetail = function (serviceId) {
        $state.go('service-detail', ({
            serviceid: serviceId
        }));
    }
    //添加购买
    $scope.shopcarList = [];
    $scope.isHave = 0; //1取消
    $scope.moneySubNum = '0.0'; //加入购买的套票总价格
    $scope.serviceTimeSum = 0; //加入购买的套票总时间
    $scope.addShopCarStamps = function ($event, itemid) {
        $event.stopPropagation();
        $scope.isHave = 0;
        if ($scope.shopcarList.length != 0) {
            for (var i = 0; i < $scope.shopcarList.length; i++) {
                if ($scope.shopcarList[i].itemid == itemid) {
                    $scope.isHave = 1;
                    $scope.shopcarList.splice(i, 1);
                }
            }
        }

        switch ($scope.isHave) {
            case 0:
                for (var i = 0; i < $scope.serviceList.length; i++) {
                    if ($scope.serviceList[i].itemid == itemid) {
                        $scope.shopcarList.push($scope.serviceList[i]);
                        $scope.serviceList[i].addScuse = true;
                        $scope.serviceList[i].addScuseName = '取消购买';
                        $scope.moneySubNum = Number($scope.moneySubNum) + Number($scope.serviceList[i].nowprice);
                        $scope.serviceTimeSum = $scope.serviceTimeSum + $scope.serviceList[i].iusetime;
                    }
                }
                break;
            case 1:
                for (var i = 0; i < $scope.serviceList.length; i++) {
                    if ($scope.serviceList[i].itemid == itemid) {

                        $scope.serviceList[i].addScuse = false;
                        $scope.serviceList[i].addScuseName = '加入购买';
                        $scope.moneySubNum = Number($scope.moneySubNum) - Number($scope.serviceList[i].nowprice);
                        $scope.serviceTimeSum = $scope.serviceTimeSum - $scope.serviceList[i].iusetime;
                    }
                }

                break;
        }
        if (($scope.moneySubNum + '').indexOf('.') == -1) {
            $scope.moneySubNum = $scope.moneySubNum + '.0';
        }

    }
    //服务类型点击
    $scope.serviceList = [];
    $scope.typeSelector = function (id) {
        $scope.page = 1;
        var loadData = function () {
            var options = {
                page: $scope.page,
                data: $scope.serviceList,
                canLoadMore: false,
                module: 'FM_APP_SERVICE_LIST',
                params: {
                    current_page: $scope.page,
                    page_size: 10,
                    servicetype_id: $scope.serviceTypeId,
                    service_type: 'SERVICE_OFFLINE',
                    type: 'SERVICE_MANY',
                    service_search: $scope.searchTxt.text,
                    store_id: $scope.storeId
                }
            };
            getInterface.jsonp(options, function (results, params) {
                if (results.status == 'Y') {
                    $scope.items = params.data;
                    $scope.page = params.page;
                    $scope.canLoadMoreGoodsList = params.canLoadMore;
                    $scope.serviceList = results.results;

                    for (var i = 0; i < $scope.serviceList.length; i++) {
                        $scope.serviceList[i].addScuse = false;
                        $scope.serviceList[i].addScuseName = '加入购买';
                    }
                    if ($scope.canLoadMoreGoodsList == false) {
                        $scope.isShowLoadMore = false;
                    }
                }
            });
        }
        loadData();
        //	上拉加载
        $scope.loadMoreGoodsList = function () {
            $scope.isShowLoadMore = true;
            setTimeout(function () {
                $scope.canLoadMoreGoodsList = false;
                loadData();
                setTimeout(function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, 1000);
            }, 1000);
        };
    }
    $scope.typeSelector('');
    //				下拉刷新
    $scope.stroeDoRefresh = function () {

        $scope.page = 1;
        $timeout(function () {
            $scope.items = [];
            $scope.selStoreType($scope.storeTypeId);
            $scope.$broadcast('scroll.refreshComplete');

        }, 500);
    };

});