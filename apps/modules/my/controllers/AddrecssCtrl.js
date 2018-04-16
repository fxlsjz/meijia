'use strict';
/**
 * 地址列表 by zl
 */

app.controller('AddrecssCtrl', function ($rootScope, $timeout, $window, $scope, $ionicPlatform, $ionicPopup, $ionicGesture, $ionicSlideBoxDelegate, $state, $stateParams, $ionicLoading, getInterface, ENV, Xalert, SwitchEnterpriseService, $cookies, pageData) {
    document.title = "服务地址";
    $scope.isNoData = false; //false：不显示无数据布局；true：显示无数据布局

    $scope.showGoodsAndServiceAddsTab = false; //标题栏显示商品+服务地址
    $scope.showServiceAddsTab = false; //标题栏显示服务地址
    $scope.showGoodsAddsTab = false; //标题栏显示商品地址

    $scope.showGoodsAddsList = false; //显示收货地址列表
    $scope.showServiceAddsList = false; //显示服务地址列表

    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }
    //来自哪个界面记录
    var from = $stateParams.form;

    //收获地址接口
    var loadData = function () {
        var options = {
            page: $scope.page,
            data: $scope.items,
            canLoadMore: false,
            module: 'FM_SHOP_USERADDREDD_LIST',
            params: {
                order_statetype: $scope.order_statetype
            }
        }
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.items = results.results;
                ($scope.items.length == 0) ? $scope.isNoData = true : $scope.isNoData = false;

                $scope.order_state == $scope.items.order_state;
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }

    //服务地址接口
    var serviceData = function () {
        var options = {
            module: 'FM_APP_USERADDREDD_LIST',
            params: {
                order_statetype: $scope.order_statetype
            }
        }
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.serviceItems = results.results;
                ($scope.serviceItems.length == 0) ? $scope.isNoData = true : $scope.isNoData = false;
                $scope.order_state == $scope.serviceItems.order_state;
            } else {
                Xalert.loading(results.error_msg, 1000);
            }
        });
    }

    //020+电商
    if ($rootScope.isShopO2O) {
        if (from == 'tab-technician') { //来自技师（选择地址）
            $scope.showServiceAddsTab = true;
            $scope.showGoodsAddsList = false; //不显示收货地址列表
            $scope.showServiceAddsList = true; //显示服务地址列表
            serviceData();
        } else if (from == 'confirm-order') { //来自服务确认订单（选择地址）
            $scope.showServiceAddsTab = true;
            $scope.showGoodsAddsList = false; //不显示收货地址列表
            $scope.showServiceAddsList = true; //显示服务地址列表
            serviceData();
        } else if (from == 'my-ticket-order') { //来自我的套票（选择地址）
            $scope.showServiceAddsTab = true;
            $scope.showGoodsAddsList = false; //不显示收货地址列表
            $scope.showServiceAddsList = true; //显示服务地址列表
            serviceData();
        } else if (from == 'goods-order') { //来自商品订单填写（选择地址）
            $scope.showGoodsAddsTab = true;
            $scope.showGoodsAddsList = true; //显示收货地址列表
            $scope.showServiceAddsList = false; //不显示服务地址列表
            loadData();
        } else {
            $scope.showGoodsAndServiceAddsTab = true;
            $scope.showGoodsAddsList = true; //显示收货地址列表
            loadData();
        }
    }

    //020
    if ($rootScope.isO2O) {
        $scope.showServiceAddsList = true; //显示服务地址列表
        $scope.showServiceAddsTab = true;
        serviceData();
    }

    //电商
    if ($rootScope.isShop) {
        $scope.showGoodsAddsList = true; //显示收货地址列表
        $scope.showGoodsAddsTab = true;
        loadData();
    }

    //服务,收货地址切换
    $scope.dao = true;
    $scope.shopadd = function (cur) {
        if (cur == 1) { //收货地址
            $scope.dao = true;
            $scope.showGoodsAddsList = true; //显示收货地址列表
            $scope.showServiceAddsList = false; //不显示服务地址列表
            loadData();
        } else if (cur == 2) { // 服务地址
            $scope.dao = false;
            $scope.showGoodsAddsList = false; //不显示收货地址列表
            $scope.showServiceAddsList = true; //显示服务地址列表
            serviceData();
        }
    }


    //刷新商品地址列表
    $rootScope.$on('refreshGoodsAddsList', function (event, data) {
        loadData();
    });
    //刷新服务地址列表
    $rootScope.$on('refreshServiceAddsList', function (event, data) {
        serviceData();
    });


    //选择收货地址+选择服务地址
    $scope.selectAddress = function (item) {
        if ((from == 'tab-technician') || (from == 'confirm-order') || (from == 'my-ticket-order') || (from == 'goods-order')) {
            localStorage.setItem('selected', true);
            localStorage.setItem('selectedAddress', JSON.stringify(item));
            window.history.go(-1);
        }
    }

    //编辑地址
    $scope.editAddress = function (item, $event) {
        $event.stopPropagation();
        if ($scope.showGoodsAddsList) { //当前显示收货地址列表
            localStorage.setItem('editItemAdds', angular.toJson(item));
            $state.go('my-addaddress'); //商品新增地址界面
        }
    }

    //新增地址
    $scope.addNewAddress = function () {
        if ($scope.showGoodsAddsList) { //当前显示收货地址列表
            localStorage.removeItem('editItemAdds');
            $state.go('my-addaddress'); //商品新增地址界面
        }
        if ($scope.showServiceAddsList) { //当前显示服务地址列表
            $state.go('my-addServiceAddress'); //服务新增地址界面
        }
    }

    //删除服务地址
    $scope.deleteServiceAdds = function (uaid, $event) {
        $event.stopPropagation();
        bFlag = true;
        removePopup = $ionicPopup.show({
            cssClass: 'Mycollect',
            template: '<p style="margin: 2em 0; text-align: center">确定要删除地址吗？</p>',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
            },
                {
                    text: "确定",
                    type: 'button-positive',
                    onTap: function (e) {
                        var options = {
                            module: 'FM_APP_DEL_USERADDREDD',
                            params: {
                                uaid: uaid //地址id
                            }
                        };
                        getInterface.jsonp(options, function (results) {
                            if (results.status == 'Y') {
                                serviceData();
                            }
                        });
                        bFlag = false;
                    }
                }
            ]
        })
    }

    //设为默认配送地址
    $scope.defaultItem = function (uaid) {
        var options = {
            module: 'FM_SHOP_SET_USERADDREDD',
            params: {
                uaid: uaid //地址id
            }
        };
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                loadData();
            }
        });
    }


    //删除当前收货地址
    var bFlag = false;
    var removePopup;
    $scope.$on('$stateChangeStart', function (event, toState, fromState) {
        if (bFlag) {
            removePopup.close();
        }
    });
    $scope.deleteItem = function (index, uaid) {
        bFlag = true;
        removePopup = $ionicPopup.show({
            cssClass: 'Mycollect',
            template: '<p style="margin: 2em 0; text-align: center">亲，您确定要删除当前地址吗？</p>',
            scope: $scope,
            buttons: [{
                text: '<font color="#999">取消</font>',
                onTap: function () {
                    document.getElementsByClassName('item-content')[index].style.WebkitTransform = 'translate3d(0px, 0px, 0px)';
                    bFlag = false;
                }
            },
                {
                    text: "确定",
                    type: 'button-positive',
                    onTap: function (e) {
                        var options = {
                            module: 'FM_SHOP_DEL_USERADDREDD',
                            params: {
                                uaid: uaid //地址id
                            }
                        };
                        getInterface.jsonp(options, function (results) {
                            if (results.status == 'Y') {
                                $scope.items.splice(index, 1);
                                ($scope.items.length == 0) ? $scope.isNoData = true : $scope.isNoData = false;
                            }
                        });
                        bFlag = false;
                    }
                }
            ]
        })
    }


});

/**
 * 添加收货地址
 */
app.controller('AddAddressCtrl', function ($window, $rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, pageData) {

    var addsData = angular.fromJson(localStorage.getItem('editItemAdds')); //编辑地址
    var uaid = ''; //需要编辑的地址的id
    if (addsData) {
        uaid = addsData.uaid;
    }

    $scope.receiver = {text: ''}; //收货人
    $scope.mobile = {text: ''}; //联系方式
    $scope.province = {text: ''}; //省
    $scope.city = {text: ''}; //市区
    $scope.county = {text: ''}; //县
    $scope.addressinfo = {text: ''}; //详细

    $scope.curProvinceId = {id: ''}; //当前所选省份id
    $scope.curCityId = {id: ''}; //当前所选地级市id
    $scope.curCountyId = {id: ''}; //当前所选区县id

    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }

    //获取省份数组
    var loadData01 = function (firstEnter) {
        var options = {
            module: 'FM_WEB_COM_GETCITY',
            params: {
                province: ''
            }
        }
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.provinceItems = results.results;
                if (firstEnter) {
                    $scope.curProvinceId.id = idsArr[0];
                    loadData02(idsArr[0], true);
                }

            }
        });
    }

    //	获取市区数组
    var loadData02 = function (id, firstEnter) {
        var options = {
            module: 'FM_WEB_COM_GETCITY',
            params: {
                province: id
            }
        }
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.cityItems = results.results;
                if (firstEnter) {
                    $scope.curCityId.id = idsArr[1];
                    loadData03(idsArr[1], true);
                }
            }
        });
    }
    //	获取区县数组
    var loadData03 = function (id, firstEnter) {
        var options = {
            module: 'FM_WEB_COM_GETCITY',
            params: {
                province: id
            }
        }
        getInterface.jsonp(options, function (results) {
            if (results.status == 'Y') {
                $scope.countyItems = results.results;
                if (firstEnter) {
                    pageData.set();
                    if (idsArr[2]) {
                        $scope.curCountyId.id = idsArr[2];
                    }
                }
            }
        });
    }

    if (addsData && addsData.address) { //编辑地址
        var idsArr = addsData.address.split(',');
        $scope.receiver = {text: addsData.receiver}; //收货人
        $scope.mobile = {text: addsData.mobile}; //联系方式
        $scope.addressinfo = {text: addsData.addressinfo}; //详细
        loadData01(true);
    } else {
        loadData01(false);
    }

    //监听省份变化
    $scope.provinceChange = function (curId) {
        $scope.cityItems = {}; //省份变化，制空地级市数组
        $scope.countyItems = {}; //省份变化，制空县区数组
        if (curId) {
            loadData02(curId, false);
        }

    }
    //监听市区变化
    $scope.cityChange = function (curId) {
        $scope.countyItems = {}; //地级市变化，制空县区数组
        if (curId) {
            loadData03(curId, false);
        }
    }
    //监听县变化
    $scope.countyChange = function (curId) {
        if (curId) {
        }
    }

    //	提交
    $scope.submitAdd = function () {
        //	验证
        if ($scope.receiver.text == '') {
            Xalert.loading("请输入收货人");
            return false;
        } else if (!$scope.mobile.text) {
            Xalert.loading("请输入联系方式");
            return false;
        } else if (!/^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i.test($scope.mobile.text)) {
            Xalert.loading("请输入正确的联系方式");
            return false;
        } else if (!$scope.curProvinceId.id || !$scope.curCityId.id || !$scope.curCountyId.id) {
            Xalert.loading("请选择所在地区");
            return false;
        } else if ($scope.addressinfo.text == '') {
            Xalert.loading("请输入详细地址");
            return false;
        } else {
            var address = $scope.curProvinceId.id + ',' + $scope.curCityId.id + ',' + $scope.curCountyId.id;
            var options = {};
            if (addsData && uaid) { //编辑地址
                options = {
                    module: 'FM_SHOP_ADD_USERADDREDD',
                    params: {
                        receiver: $scope.receiver.text, //收货人
                        mobile: $scope.mobile.text, //联系方式
                        address: address, //地址id
                        addressinfo: $scope.addressinfo.text, //地址详情信息
                        uaid: uaid, //地址id
                    }
                }
            } else { //新增地址
                options = {
                    module: 'FM_SHOP_ADD_USERADDREDD',
                    params: {
                        receiver: $scope.receiver.text, //收货人
                        mobile: $scope.mobile.text, //联系方式
                        address: address, //地址id
                        addressinfo: $scope.addressinfo.text, //地址详情信息
                    }
                }
            }

            getInterface.jsonp(options, function (results) {
                if (results.status == 'Y') {

                    if (addsData && uaid) { //编辑地址
                        Xalert.loading("编辑地址成功");
                    } else { //新增地址
                        Xalert.loading("新增地址成功");
                    }

                    window.history.go(-1);
                    //通知商品地址列表刷新
                    $rootScope.$broadcast('refreshGoodsAddsList');
                } else {
                    Xalert.loading(results.error_msg, 1000);
                }
            });
        }

    }

});

/*
 添加服务地址
 */
app.controller('addServiceAddress', function ($window, $rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, pageData, $timeout) {

    //返回上一页
    $scope.onBackPressed = function () {
        window.history.go(-1);
    }

    // 百度地图API功能
    function G(id) {
        return document.getElementById(id);
    }

    var map = new BMap.Map("allmap");
    map.centerAndZoom("北京", 12); // 初始化地图,设置城市和地图级别。
    var myGeo = new BMap.Geocoder(); //创建地址解析器实例

    var ac = new BMap.Autocomplete( //建立一个自动完成的对象
        {
            "input": "suggestId",
            "location": map
        });

    ac.addEventListener("onhighlight", function (e) { //鼠标放在下拉列表上的事件
        var str = "";
        var _value = e.fromitem.value;
        var value = "";
        if (e.fromitem.index > -1) {
            value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

        value = "";
        if (e.toitem.index > -1) {
            _value = e.toitem.value;
            value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
        G("searchResultPanel").innerHTML = str;
    });

    var myValue;
    ac.addEventListener("onconfirm", function (e) { //鼠标点击下拉列表后的事件
        var _value = e.item.value;
        myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
        G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

        setPlace();
        $timeout(function () {
            $scope.add.text = myValue;
            $scope.showHide = false;
        }, 500);

    });

    function setPlace() {
        map.clearOverlays(); //清除地图上所有覆盖物
        function myFun() {
            var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
            map.centerAndZoom(pp, 18);
            map.addOverlay(new BMap.Marker(pp)); //添加标注
        }

        var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        local.search(myValue);
    }

    $scope.showHide = false;
    $scope.showApi = function () {
        $scope.showHide = true;
    }

    $scope.detailedAddress = { //详细地址
        text: ''
    }
    $scope.add = { //到家地址
        text: ''
    }
    $scope.submit = function () {
        if ($scope.add.text == '') {
            Xalert.loading("请输入地址");
            return false;
        } else if ($scope.detailedAddress.text == '') {
            Xalert.loading("请输入详细地址");
            return false;
        } else {
            var lng;
            var lat;
            //			var map = new BMap.Map("allmap");
            //			var myGeo = new BMap.Geocoder();//创建地址解析器实例
            var add = $scope.add.text;
            var geocodeSearch = function (add) {
                setTimeout(window.bdGEO, 400);
                myGeo.getPoint(add, function (point) {
                    if (point) {
                        $scope.lng = point.lng;
                        $scope.lat = point.lat;
                    }
                    var loadData = function () {
                        var options = {
                            module: 'FM_APP_ADD_USERADDREDD',
                            params: {
                                address: $scope.add.text,
                                addressinfo: $scope.detailedAddress.text,
                                code: $rootScope.selCityInfo.cityCode,
                                longitude: $scope.lng,
                                latitude: $scope.lat
                            }
                        }
                        getInterface.jsonp(options, function (results) {
                            if (results.status == 'Y') {
                                Xalert.loading("添加地址成功");
                                window.history.go(-1);
                                $rootScope.$broadcast('refreshServiceAddsList'); //通知服务地址列表刷新数据
                            }
                        });
                    }
                    loadData();

                }, "北京市");
            }
            var test = function () {
                geocodeSearch(add);
            }
            test()

        }
    }
});