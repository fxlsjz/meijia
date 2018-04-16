'use strict';
/*
 * author wuhao
 * 预约到店主控制器
 */
app.controller('storeIndeCtrl', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, $stateParams, $ionicScrollDelegate) {

    $scope.searchTxt = {
        "text": ''
    };
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
    function getData(isAddData, isEmptyData, isRefresh, current_page) {
        var options = {
            //data: $scope.items,
            //canLoadMore: false,
            module: 'FM_APP_STORE_LIST',
            params: {
                city_code: cityInfo.cityCode, //城市code
                page_size: 10, //页大小
                current_page: current_page, //访问页
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
        if ($scope.isStamp == 1) { //预约到店店面详情
            $state.go('store-details', ({
                storeId: storeInfo.store_id,
                store_dis: storeInfo.store_dis,
                Record: 3
            }));
        } else if ($scope.isStamp == 2) { //店面套票详情
            $state.go('store-stamps', ({
                storeId: storeInfo.store_id,
                store_dis: storeInfo.store_dis,
                Record: 3
            }));
        }

    };
});
/**
 * 店面详情
 * author wuhao
 */
app.controller('makeAppointmentStoreDetails', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, pageData2, $stateParams, $ionicScrollDelegate, $ionicPopup) {

    var roomTypename = localStorage.getItem("roomTypename"); //已选择的房间类型
    var singleServiceSelectData = localStorage.getItem("singleServiceSelectData"); //已选择的服务数据
    var timeData = localStorage.getItem("timeData"); //已选择的时间
    var technicianData = localStorage.getItem("selectTechnician"); //推荐技师
    /*表单数据*/
    //已选择的服务;

    $scope.tankuag = false;//立即下单的弹框

    $scope.singleServiceSelectData = singleServiceSelectData ? angular.fromJson(singleServiceSelectData) : undefined;
    $scope.timeData = timeData ? angular.fromJson(timeData) : undefined; //选择的时间
    $scope.roomTypename = roomTypename ? roomTypename : ""; //当前选择房间类型
    $scope.technicianData = technicianData ? angular.fromJson(technicianData) : undefined; //推荐技师

    localStorage.setItem("Record", $stateParams.Record * 1);
    $scope.isStamp = 1; //1 单次 2套票
    $scope.store_dis = $stateParams.store_dis; //距离
    $scope.storeId = $stateParams.storeId; //店面id
    $scope.imageHeight = window.innerWidth / 1.785714285714286; //店面图片高度
    $scope.isShowNoData = false; //是否显示无数据提示
    $scope.storeInfo = undefined; //店面信息
    $scope.roomTypeList = []; //房间类型列表
    $scope.imgPath = []; //店面图片集合
    $scope.selectServiceName = ""; //所选的服务名称
    $scope.timeShow = ''; //显示用的时间段

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name == 'tab.store') {//店面列表tab
            $scope.tankuag = false;
        } else if (fromState.name == 'tab.home') {//首页
            $scope.tankuag = false;
        } else if (fromState.name == 'store-album') {//店面相册
            $scope.tankuag = false;
        } else if (fromState.name == 'store-map') {//地图
            $scope.tankuag = false;
        } else if (fromState.name == 'store-assessList') {//店面详情的评价列表
            $scope.tankuag = false;
        } else if (fromState.name == 'technician-evaluatList') {//店面详情的评价列表
            $scope.tankuag = false;
        }

        if (fromState.name == 'service-two') { //双人服务列表页面返回
            $scope.tankuag = true;
            var selectServieData = localStorage.getItem("selectServieData");
            if (selectServieData == "true")
                removeData(2);
        } else if (fromState.name == 'store-service-detail') { //双人服务详情返回
            $scope.tankuag = true;
            var selectServieData = localStorage.getItem("selectServieData");
            if (selectServieData == "true")
                removeData(2);
        } else if (fromState.name == 'store-single-service') { //单人服务列表页面返回
            $scope.tankuag = true;
            var selectServieData = localStorage.getItem("selectServieData");
            if (selectServieData == "true")
                removeData(2);
        } else if (fromState.name == 'store-single-service-detail') { //单人服务详情页面返回
            $scope.tankuag = true;
            var selectServieData = localStorage.getItem("selectServieData");
            if (selectServieData == "true")
                removeData(2);
        } else if (fromState.name == "service-time") { //选择时间返回
            $scope.tankuag = true;
            var selectTime = localStorage.getItem("selectTime");
            if (selectTime == "true")
                removeData(1);
            if (selectTime == "true")
                getTechnician();
        } else if (fromState.name == 'home-technician' || fromState.name == 'beautician-detail') {
            $scope.tankuag = true;
        }
        if (toState.name == 'store') { //退出当前页面
            $rootScope.clearServiceOrderData();
        }
        if (fromState.name != 'store' && fromState.name != 'store-details') { //子集页面返回
            initData(); //初始化数据
        }
    });
    init();

    function init() {

        if (!$rootScope.appValues) {
            $scope.isShowNoData = true;
            return;
        }
        $scope.roomTypeList.push({
            'type': 'STORE_TYPE_SINGLE',
            'value': '单人预约'
        });
        $scope.roomTypeList.push({
            'type': 'STORE_TYPE_DOUBLE_A',
            'value': '双人预约'
        });
        //单人间
//		var STORE_TYPE_SINGLE = $rootScope.appValues.STORE_TYPE_SINGLE;
//		if(STORE_TYPE_SINGLE && STORE_TYPE_SINGLE.dic_desc == 'Y') {
//			var rname_z = $rootScope.appValues.rname_z;
//			$scope.roomTypeList.push({
//				'type': 'STORE_TYPE_SINGLE',
//				'value': rname_z.dic_desc
//			});
//
//		}
        //双人单间
//		var STORE_TYPE_DOUBLE_A = $rootScope.appValues.STORE_TYPE_DOUBLE_A;
//		if(STORE_TYPE_DOUBLE_A && STORE_TYPE_DOUBLE_A.dic_desc == 'Y') {
//			var rname_o = $rootScope.appValues.rname_o;
//			$scope.roomTypeList.push({
//				'type': 'STORE_TYPE_DOUBLE_A',
//				'value': rname_o.dic_desc
//			});
//
//		}
        //双人单间
//		var STORE_TYPE_DOUBLE_T = $rootScope.appValues.STORE_TYPE_DOUBLE_T;
//		if(STORE_TYPE_DOUBLE_T && STORE_TYPE_DOUBLE_T.dic_desc == 'Y') {
//			var rname_t = $rootScope.appValues.rname_t;
//			$scope.roomTypeList.push({
//				'type': 'STORE_TYPE_DOUBLE_T',
//				'value': rname_t.dic_desc
//			});
//
//		}
        if ($scope.roomTypeList.length > 0) {
            if ($scope.roomTypename == "") {
                $scope.roomTypename = $scope.roomTypeList[0].type;
                localStorage.setItem("roomTypename", $scope.roomTypename); //保存房间类型
            }
            getStoreDelails(); //获取店面详情
        } else {
            $scope.isShowNoData = true;
        }
    }

    //返回按钮
    $scope.goback = function () {
        history.go(-1);
    };
    //查看地图
    $scope.goMap = function () {
        var storeItem = [{
            sname: $scope.storeInfo.sname,
            store_dis: $scope.store_dis,
            adress: $scope.storeInfo.adress,
            useradd_longitude: $scope.storeInfo.useradd_longitude,
            useradd_latitude: $scope.storeInfo.useradd_latitude
        }];
        localStorage.storelist = angular.toJson(storeItem);
        $state.go('store-map', ({
            isFromList: 'details'
        }));
    };

    //查看门店相册
    $scope.goAlbum = function () {
        if ($scope.imgPath.length > 0) {
            $state.go('store-album', ({
                list: $scope.bgImag
            }));
        }
    };
    /**
     * 房间类型选择
     * @param {房间类型} item
     */
    $scope.roomSelctor = function (item) {
        $scope.roomTypename = item.type;
        localStorage.setItem("roomTypename", $scope.roomTypename); //保存房间类型
        removeData(3);
    };
    //获取服务
    $scope.getService = function () {
        //登录超时
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        if ($scope.roomTypename == 'STORE_TYPE_SINGLE') { //进入单人服务列表选择服务
            localStorage.setItem("storeId", $scope.storeId);
            localStorage.setItem("type", "SERVICE_SINGLE");
            localStorage.setItem("serviceType", "SERVICE_OFFLINE")
            localStorage.setItem("from", "store");
            $state.go('store-single-service');
        } else {
            //选择多人服务
            $state.go('service-two', ({
                store_id: $scope.storeId,
            }));
        }
    };
    //获取服务时间
    $scope.getServiceTime = function () {
        if ($scope.selectServiceName != "") {
            var data = {
                store_id: $scope.storeId,
                store_type: $scope.roomTypename,
            }
            data = JSON.stringify(data);
            $state.go('service-time', ({
                form: 'store',
                data: data
            }));
        } else {
            Xalert.loading('请先选择' + $rootScope.serviceText + '项目');
        }
    };
    //选择技师进入技师列表
    $scope.selectTechnician = function () {
        if ($scope.selectServiceName == "") {
            Xalert.loading('请先选择' + $rootScope.serviceText + '项目');
            return;
        }
        if (!$scope.timeData) {
            Xalert.loading('请先选择' + $rootScope.serviceText + '时间');
            return;
        }
        localStorage.setItem('storeName', $scope.storeInfo.sname); //店面名称
        if ($scope.roomTypename != 'STORE_TYPE_SINGLE') { //多人
            //清除技师页面的历史本地数据
            localStorage.removeItem('isGiveMe');
            localStorage.removeItem('service_ordertype');
            localStorage.removeItem('myTechnician');
            localStorage.removeItem('herTechnician');
            $state.go('shop-two-technician', ({
                store_id: $scope.storeId,
                store_type: $scope.roomTypename,
            }));
        } else {
            var data = {
                form: 'store',
                store_id: $scope.storeId,
                store_type: $scope.roomTypename
            }
            $state.go('home-technician', ({
                data: angular.toJson(data)
            }));
        }
    };

    //点击好评
    $scope.goAssess = function (store_id) {
        var data = {
            store_id: store_id,
        }
        data = JSON.stringify(data);
        $state.go('technician-evaluatList', ({
            form: 'store',
            data: data
        }));
    }

    /**
     * 结算
     */
    $scope.newOpen = function () {
        //登录超时;
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        else {
            $scope.tankuag = true;
        }
    }
    $scope.closeNewOpen = function () {
        $scope.tankuag = false;
    }
    $scope.settlement = function () {
        //登录超时
        if (!Authentication.checkLogin(true)) {
            return false;
        }
//		alert('1234')
//		if(不存在){
//			初始化弹窗 
//			retu;
//		}
//		var formatJson = {};
//  $scope.format = function () {
//      //loadData();
//      var bFlag = false;
//      var removePopup;
//      $scope.$on('$stateChangeStart', function (event, toState, fromState) {
////          if (bFlag) {
//              removePopup.close();
////          }
//      });
//      $scope.aFrame = function () {
////      	alert(1)
////          bFlag = true;
//          formatJson = {
//              cssClass: 'detail',
//              templateUrl: 'apps/modules/mall/templates/shop-format.html',
//              scope: $scope,
//              buttons: [{
//                  text: '<font color="#000">取消</font>',
//                  type: 'button-default',
//                  onTap: function () {
//                     
//                  }
//              }, {
//                  text: '<font color="#000">加入购物车</font>',
//                  type: 'button-positive',
//                  onTap: function (e) {
//                    
//                  }
//              }]
//          }
//          removePopup = $ionicPopup.show(formatJson);
//          if ($scope.productIsstock == '0') {
//              formatJson.buttons[1].type = "button-positive noGoods";
//          } else {
//              formatJson.buttons[1].type = "button-positive";
//          }
//      }
//      $scope.aFrame();
//  }
//  $scope.format();
        if ($scope.selectServiceName == "") {
            Xalert.loading('请先选择' + $rootScope.serviceText + '项目');
            return;
        }
        if (!$scope.timeData) {
            Xalert.loading('请先选择' + $rootScope.serviceText + '时间');
            return;
        }
        if (!$scope.technicianData) {
            Xalert.loading('请先选择' + $rootScope.technicianText);
            return;
        }
        var data = {
            from: '1',
            userMobile: $rootScope.$_userInfo.user_mobile,
            userName: $rootScope.$_userInfo.user_name,
            storeId: $scope.storeId,
            roomType: $scope.roomTypename
        };
        //存储技师信息
        localStorage.setItem("selectTechnician", angular.toJson($scope.technicianData));
        localStorage.setItem('storeName', $scope.storeInfo.sname); //店面名称
        $state.go('submit-order', ({
            data: angular.toJson(data)
        }));
    };
    /**
     * 移除所选的数据
     * @param {Object} type 3切换房间类型移除数据;2选择服务
     */
    function removeData(type) {
        if (type > 2) {
            localStorage.removeItem("singleServiceSelectData"); //清空服务数据
            $scope.singleServiceSelectData = {};
            $scope.selectServiceName = "";
        }
        if (type > 1) { //清空时间数据
            localStorage.removeItem("selectServieData") //清空选择服务标识
            localStorage.removeItem("timeData");
            $scope.timeShow = "";
            $scope.timeData = undefined;
        }
        if (type > 0) { //清空技师数据
            localStorage.removeItem("selectTime"); //清空选择时间标识
            localStorage.removeItem("selectTechnician");
            $scope.technicianData = undefined;
        }
    }

    /**
     * 初始化数据
     */
    function initData() {
        //初始化服务名称和服务id
        var selectServiceName = "";
        if ($scope.singleServiceSelectData) {
            var itemid = "";
            for (var i = 0; i < $scope.singleServiceSelectData.selectedData.length; i++) {
                if (selectServiceName == "") {
                    itemid = $scope.singleServiceSelectData.selectedData[i].itemid;
                    selectServiceName = $scope.singleServiceSelectData.selectedData[i].iname;
                } else {
                    itemid = itemid + "," + $scope.singleServiceSelectData.selectedData[i].itemid;
                    selectServiceName = selectServiceName + "+" + $scope.singleServiceSelectData.selectedData[i].iname;
                }
            }
            $scope.singleServiceSelectData.itemid = itemid;
            if ($scope.singleServiceSelectData.selectedDataHer) {
                var itemidHer = "";
                for (var i = 0; i < $scope.singleServiceSelectData.selectedDataHer.length; i++) {
                    if (itemidHer == "") {
                        itemidHer = $scope.singleServiceSelectData.selectedDataHer[i].itemid;
                    } else {
                        itemidHer = itemidHer + "," + $scope.singleServiceSelectData.selectedDataHer[i].itemid;
                    }
                    selectServiceName = selectServiceName + "+" + $scope.singleServiceSelectData.selectedDataHer[i].iname;
                }
                $scope.singleServiceSelectData.itemidHer = itemidHer;
            }
            localStorage.setItem("singleServiceSelectData", angular.toJson($scope.singleServiceSelectData));
        }
        $scope.selectServiceName = selectServiceName;
        //初始化时间显示文本
        if ($scope.timeData) {
            $scope.timeShow = $filter('timeSelf')($scope.timeData.starttime, $scope.roomTypename == 'STORE_TYPE_SINGLE' || $scope.singleServiceSelectData.time > $scope.singleServiceSelectData.timeHer ? $scope.singleServiceSelectData.time : $scope.singleServiceSelectData.timeHer, 0);
            $scope.timeData.timeShow = $scope.timeShow;
            localStorage.setItem("timeData", angular.toJson($scope.timeData));
        }
    }

    /**
     * 获取店面详情
     */
    function getStoreDelails() {
        var options = {
            module: 'FM_APP_STORE_INFO_NEW',
            params: {
                store_id: $scope.storeId
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y' && results.results) {
                $scope.storeInfo = results.results;
                $scope.newComment = $scope.storeInfo.item_comment;
                $scope.bgImag = $scope.storeInfo.store_background;
                $scope.imgPath = $scope.bgImag.split(",");
            } else {
                $scope.isShowNoData = true;
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
        });
    };


    //获取大图数组
    $scope.getLargePicArray = function (newComments) {
        var picArray = [];
        if (newComments) {
            angular.forEach(newComments, function (value, key) {
                picArray.push(value.cimg_large);
            });
        }
        return picArray;
    }

    /**
     * 获取推荐技师
     */
    function getTechnician() {

        var options = {
            module: 'FM_APP_RECOMMED_BEAUTICIAN',
            params: {
                store_id: $scope.storeId,
                my_itemid: $scope.singleServiceSelectData.itemid,
                her_itemid: $scope.singleServiceSelectData.itemidHer,
                starttime: $scope.timeData.starttime,
                store_type: $scope.roomTypename
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y' && results.results != null) {
                var tech = results.results;
                //没有返回我的技师
                if (!tech.my_beaticain) {
                    Xalert.loading(results.error_msg, 1000);
                    return;
                }
                //多人没有返回他的技师
                if ($scope.roomTypename != 'STORE_TYPE_SINGLE' && !tech.her_beaticain) {
                    Xalert.loading(results.error_msg, 1000);
                    return;
                }


                $scope.technicianData = {};
                $scope.technicianData.my_beaticain = tech.my_beaticain;
                if ($scope.roomTypename != 'STORE_TYPE_SINGLE') {
                    $scope.technicianData.her_beaticain = tech.her_beaticain;
                }
                localStorage.setItem("selectTechnician", angular.toJson($scope.technicianData));
            } else {
                if (results.error_msg)
                    Xalert.loading(results.error_msg); //错误提示
            }
        });

    };
});
/**
 * 套票店面详情
 * author wuhao
 */
app.controller('storeDetailsCtrl', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, userInfo, $http, pageData, pageData2, $stateParams, $ionicScrollDelegate) {

    localStorage.setItem("Record", $stateParams.Record * 1); //记录页面个数
    $scope.imageHeight = window.innerWidth / 1.785714285714286; //店面图片高度
    $scope.serviceTypeWidth = window.innerWidth / 4; //服务分类item的宽度
    $scope.cWidth = 0; //服务分类列表的宽度
    $scope.store_dis = $stateParams.store_dis; //距离
    $scope.searchTxt = { //搜索框文字
        "text": ''
    };
    $scope.storeId = $stateParams.storeId; //店面id
    $scope.storeInfo = undefined; //店面详情
    $scope.imgPath = []; //店面图片集合
    $scope.serviceType = []; //服务分类集合
    $scope.items = []; //服务列表
    $scope.selectedData = []; //已选择的服务列表
    $scope.selectServiceTypeId = ""; //选择的服务分类id
    $scope.current_page = 1; //加载的页数
    $scope.noData = false; //是否显示无数据
    $scope.isShowLoadMore = false; //是否显示上拉加载
    $scope.isShowNoData = false; //是否显示无数据提示
    $scope.isSearchshow = false; //是否显示搜索框
    $scope.isShowSearch = 0; //是否显示搜索框
    $scope.money = 0; //总金额
    $scope.serviceTime = 0; //服务总时长
    var isLoagingCollection = false; //判断是否在收藏服务
    var isLoadingList = false; //判断列表是否正在获取数据
    var searchText = ""; //需要搜索的文本

    getStoreDelails();

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name == 'store-service-detail' || fromState.name == 'store-map' || fromState.name == 'store-album') { //服务详情页面 地图页面 店面相册页面返回
            var singleServiceSelectDataCopy = angular.fromJson(localStorage.getItem("singleServiceSelectDataCopy"));
            $scope.selectedData = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.selectedData : [];
            $scope.money = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.aprice : 0;
            $scope.serviceTime = singleServiceSelectDataCopy ? singleServiceSelectDataCopy.time : 0;
            initServiceList($scope.items);
        } else if (fromState.name == 'submit-order') { //下单页面返回
            var singleServiceSelectData = angular.fromJson(localStorage.getItem("singleServiceSelectData"));
            $scope.selectedData = singleServiceSelectData ? singleServiceSelectData.selectedData : [];
            $scope.money = singleServiceSelectData ? singleServiceSelectData.aprice : 0;
            $scope.serviceTime = singleServiceSelectData ? singleServiceSelectData.time : 0;
            initServiceList($scope.items);
        }
        if (toState.name == 'store') { //退出当前页面
            $rootScope.clearServiceOrderData();
        }
    });
    //搜索
    $scope.search = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e.keyCode == 13) {
            //判断是否正在访问接口
            if (isLoadingList) return;
            isLoadingList = true;
            searchText = $scope.searchTxt.text;
            getServiceList(false, true, false, 1);

        }
    };
    //返回按钮
    $scope.goBack = function () {
        if ($scope.isSearchshow) {
            $scope.isSearchshow = false;
            //隐藏搜索框
            var search = document.getElementById('p-s-deteils-search');
            angular.element(search).addClass('display-none');
            //显示标题栏
            var title = document.getElementById('p-s-deteils-title');
            angular.element(title).removeClass('display-none');
            //显示搜索按钮
            var searchBin = document.getElementById('detail-serch-ion');
            angular.element(searchBin).addClass('search-image');
        } else {
            window.history.go(-1);
        }

    };
    //点击搜索按钮
    $scope.changeSearchShow = function () {
        $scope.isSearchshow = true;
        //显示搜索框
        var search = document.getElementById('p-s-deteils-search');
        angular.element(search).removeClass('display-none');
        //隐藏标题栏
        var title = document.getElementById('p-s-deteils-title');
        angular.element(title).addClass('display-none');
        //隐藏搜索按钮
        var searchBin = document.getElementById('detail-serch-ion');
        angular.element(searchBin).removeClass('search-image');
    };
    //查看地图
    $scope.goMap = function () {
        var storeItem = [{
            sname: $scope.storeInfo.sname,
            store_dis: $scope.store_dis,
            adress: $scope.storeInfo.adress,
            useradd_longitude: $scope.storeInfo.useradd_longitude,
            useradd_latitude: $scope.storeInfo.useradd_latitude
        }];
        localStorage.storelist = angular.toJson(storeItem);
        serviceSingleServiceSelectDataCopy();
        $state.go('store-map', ({
            isFromList: 'details'
        }));
    };

    //查看门店相册
    $scope.goAlbum = function () {
        serviceSingleServiceSelectDataCopy();
        if ($scope.imgPath.length > 0) {
            $state.go('store-album', ({
                list: $scope.bgImag
            }));
        }
    };
    /**
     * 切换服务分类
     * @param {服务分类id} serviceTypeId
     */
    $scope.tab = function (serviceTypeId, $event) {
        $event.stopPropagation();
        if (serviceTypeId == $scope.selectServiceTypeId) return;
        if (isLoadingList) return;
        isLoadingList = true;
        $scope.selectServiceTypeId = serviceTypeId;
        getServiceList(false, true, false, 1);

    };
    //监听列表滑动
    $scope.onServiceScrollListener = function () {
        var contentHeight = document.getElementById("body-view").offsetHeight; //content的高度
        var contentViewHeight = document.getElementById("contentView").offsetHeight; //滑动块高度
        var infoContentHeight = document.getElementById('infoContent').offsetHeight; //店面信息元素高度
        var scrollHeight = $ionicScrollDelegate.$getByHandle('scrollContent').getScrollPosition().top;
        if (scrollHeight >= infoContentHeight) {
            if ($scope.isShowSearch == 0) {
                $scope.isShowSearch = 1;
                //显示浮动分类列表
                var bin = document.getElementById('serviceTypeFixed');
                angular.element(bin).addClass('servicetype-list-show');
                //显示搜索按钮
                var searchBin = document.getElementById('detail-serch-ion');
                angular.element(searchBin).addClass('search-image');
            }
        } else {
            if ($scope.isShowSearch == 1) {
                $scope.isShowSearch = 0;
                //隐藏浮动分类
                var bin = document.getElementById('serviceTypeFixed');
                angular.element(bin).removeClass('servicetype-list-show');
                //隐藏搜索按钮
                var searchBin = document.getElementById('detail-serch-ion');
                angular.element(searchBin).removeClass('search-image');
                //隐藏搜索框
                var search = document.getElementById('p-s-deteils-search');
                angular.element(search).addClass('display-none');
                //显示标题栏
                var title = document.getElementById('p-s-deteils-title');
                angular.element(title).removeClass('display-none');
                $scope.isSearchshow = false;
            }
        }
        if (scrollHeight + contentHeight == contentViewHeight && $scope.isShowLoadMore) { //滑动到底部执行上拉加载
            $scope.loadMoreGoodsList();
        }
    };
    //监听服务分类浮动滑动
    $scope.onServiceTypeFixedScrollListener = function () {
        if ($scope.isShowSearch == 0) return;
        //浮动的服务分类列表滑动距离
        var stfXY = getServiceTypeScroll('serviceTypeFixed');
        //服务分类列表
        var st = $ionicScrollDelegate.$getByHandle('serviceType');
        st.scrollTo(stfXY[0], stfXY[1]);
    };
    //监听服务分类滑动
    $scope.onServiceTypeScrollListener = function () { //浮动的服务分类列表滑动距离
        if ($scope.isShowSearch == 1) return;
        //浮动的服务分类列表滑动距离
        var stXY = getServiceTypeScroll('serviceType');
        //服务分类列表
        var stf = $ionicScrollDelegate.$getByHandle('serviceTypeFixed');
        stf.scrollTo(stXY[0], stXY[1]);
    };
    // 上拉加载
    $scope.loadMoreGoodsList = function () {
        if (isLoadingList) return;
        isLoadingList = true;
        getServiceList(true, false, false, $scope.current_page + 1);
    };
    //收藏取消收藏服务
    $scope.collectionService = function (item, $event) {
        if (isLoagingCollection) return;
        isLoagingCollection = true;
        var options = {
            params: {
                itemid: item.itemid
            }
        };
        if (item.iscollection == 'Y') {
            options.module = 'FM_APP_CANCELCOLLECT_SERVICE';
        } else {
            options.module = 'FM_APP_COLLECT_SERVICE';
        }
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y') {
                item.iscollection = item.iscollection == 'Y' ? 'N' : 'Y';
            } else {
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
            isLoagingCollection = false;
        });
    };
    //加入购买or取消购买
    $scope.joinCar = function ($event, item) {
        $event.stopPropagation();
        if (!item.selected) { //添加购买
            item.selected = true;
            $scope.money = parseFloat($scope.money) + parseFloat(item.nowprice);
            $scope.money = $scope.money.toFixed(1);
            $scope.serviceTime += item.iusetime;
            $scope.selectedData = $scope.selectedData.concat(item);
        } else { //取消购买
            item.selected = false;
            $scope.money = parseFloat($scope.money) - parseFloat(item.nowprice);
            $scope.money = $scope.money.toFixed(1);
            for (var i = 0; i < $scope.selectedData.length; i++) {
                if ($scope.selectedData[i].itemid == item.itemid) {
                    $scope.selectedData.splice(i, 1);
                    continue;
                }
            }
            $scope.serviceTime -= item.iusetime;
        }

    };
    /**
     * 进入服务详情
     * @param {服务对象} item
     */
    $scope.goDetail = function (item) {
        serviceSingleServiceSelectDataCopy();
        localStorage.setItem('storeName', $scope.storeInfo.sname); //店面名称
        localStorage.setItem('isActive', 'true'); //给我选
        localStorage.setItem('from', 'store');
        localStorage.setItem('type', 'SERVICE_MANY');
        localStorage.setItem('serviceType', 'SERVICE_OFFLINE');
        localStorage.setItem('serviceItem', angular.toJson(item));
        var data = {
            storeId: $scope.storeId,
            storeName: $scope.storeInfo.sname,
        };
        $state.go('store-service-detail', ({
            data: angular.toJson(data)
        }));
    };
    /**
     * 结算
     */
    $scope.settlement = function () {
        //登录超时
        if (!Authentication.checkLogin(true)) {
            return false;
        }
        if ($scope.selectedData.length == 0) {
            Xalert.loading('请先选择' + $rootScope.serviceText + '项目', 1000);
            return;
        }
        var itemid = '';
        for (var i = 0; i < $scope.selectedData.length; i++) {
            if (itemid == '') {
                itemid = $scope.selectedData[i].itemid;
            } else {
                itemid = itemid + "," + $scope.selectedData[i].itemid;
            }
        }
        var singleServiceSelectData = {
            time: $scope.serviceTime, //服务时长
            aprice: $scope.money, //服务价格
            selectedData: $scope.selectedData, //服务集合
            itemid: itemid
        }
        var data = {
            from: '1',
            storeId: $scope.storeId,
            storeName: $scope.storeInfo.sname,
        };
        localStorage.setItem('storeName', $scope.storeInfo.sname); //店面名称
        localStorage.setItem('singleServiceSelectData', angular.toJson(singleServiceSelectData));
        $state.go('submit-order', ({
            data: angular.toJson(data)
        }));
    };
    /**
     * 获取服务分类的滑动坐标
     */
    function getServiceTypeScroll(handle) {
        var st = $ionicScrollDelegate.$getByHandle(handle).getScrollPosition();
        return [st.left, st.top]
    }

    /**
     * 获取店面详情
     */
    function getStoreDelails() {
        var options = {
            module: 'FM_APP_STORE_INFO_NEW',
            params: {
                store_id: $scope.storeId
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y' && results.results) {
                $scope.storeInfo = results.results;
                $scope.bgImag = $scope.storeInfo.store_background;
                $scope.imgPath = $scope.bgImag.split(",");
                getServiceType();
            } else {
                $scope.isShowNoData = true;
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
        });
    };
    //获取服务类型
    function getServiceType() {
        var options = {
            module: 'FM_APP_SERVICETYPE_ONE_LEVEL_LIST',
            params: {}
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'Y' && results.results != null && results.results.length > 0) {
                $scope.cWidth = $scope.serviceTypeWidth * results.results.length;
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
    function getServiceList(isAddData, isEmptyData, isRefresh, current_page) {
        var options = {
            module: 'FM_APP_SERVICE_LIST',
            params: {
                page_size: 10,
                current_page: current_page,
                store_id: $scope.storeId, //店面id
                type: "SERVICE_MANY", //单次多次(套票)
                servicetype_id: $scope.selectServiceTypeId, //服务分类id
                service_type: "SERVICE_OFFLINE", //到家到店
                service_search: searchText,
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
                    $scope.isShowNoData = false;
                } else {
                    $scope.isShowNoData = true;
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
            if ($scope.selectedData.length != 0) {
                for (var j = 0; j < $scope.selectedData.length; j++) {
                    if (items[i].itemid == $scope.selectedData[j].itemid) {
                        items[i].selected = true;
                    }
                }
            }
        }
    }

    /*
     * 保存备份已选服务到本地
     */
    function serviceSingleServiceSelectDataCopy() {
        var data = {
            time: $scope.serviceTime, //服务时长
            aprice: $scope.money, //服务价格
            selectedData: $scope.selectedData //服务集合
        }
        localStorage.setItem('singleServiceSelectDataCopy', angular.toJson(data));
    }
});
/**
 * 店面相册
 * wuhao
 */
app.controller('storeAlbumCtrl', function ($scope, $ionicScrollDelegate, $stateParams) {
    $scope.bgImag = $stateParams.list;
    $scope.imgPath = $scope.bgImag.split(",");
    $scope.imgPathNum = $scope.imgPath.length;
    $scope.storeId = $stateParams.storeId;
    $scope.isStamp = $stateParams.isStamp;
    $scope.imageWidth = 0; //图片宽度
    $scope.imageHeight = 0; //图片高度
    var bodyView = document.getElementById("body-view");
    $scope.imageWidth = (bodyView.offsetWidth - 12) / 2
    $scope.imageHeight = $scope.imageWidth / 1.785714285714286;

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
    $scope.moneySubNum = '0'; //加入购买的套票总价格
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
            $scope.moneySubNum = $scope.moneySubNum;
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