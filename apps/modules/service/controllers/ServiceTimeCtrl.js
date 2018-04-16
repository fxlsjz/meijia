'use strict';
/*
 author wanghui
 */
app.controller('ServiceTimeCtrl', function ($rootScope, $scope, $filter, $state, $cookies, languages, getInterface, Xalert, $ionicSlideBoxDelegate, sourseChange, Authentication, $timeout, $window, SwitchEnterpriseService, $stateParams, pageData2, $ionicScrollDelegate) {
    var data = angular.fromJson($stateParams.data);

    var lng; //纬度
    var lat; //经度
    var citycode; //城市code
    var serviceId; //服务Id
    var bid; //技师Id
    var storeId; //门店Id
    var store_type; // 房间类型
    var packageId; //套票Id
    $scope.form = $stateParams.form;
    $scope.width = window.innerWidth;
    $scope.dateItemWidth = $scope.width / 3; //日期列表item宽度
    $scope.items = []; //日期列表
    $scope.timeItems = []; //所选日期的时间列表
    $scope.position = -1; //当前选择的日期下标
    $scope.selectTime = null; //选择的时间
    if ($scope.form == 'technicianDetail') {
        bid = data.bid;
        citycode = data.citycode;
        lng = data.lng;
        lat = data.lat;
        var options = {
            module: 'FM_APP_CHECK_VISITTIME',
            params: {
                citycode: citycode,
                longitude: lng,
                latitude: lat,
                beautician_id: bid,
            }
        };
        getTime(options);
    } else if ($scope.form == 'submit-service-order') {
        storeId = data.store_id;
        var item_id = data.itemid;
        var options = {
            module: 'FM_APP_CHECK_NEWSTORETIME',
            params: {
                store_id: storeId,
                store_type: "STORE_TYPE_SINGLE",
                item_id: item_id
            }
        };
        getTime(options);
    } else if ($scope.form == 'my-ticket-order') {
        var item_id = data.item_id;
        packageId = data.packageid;
        bid = data.beauticianid;
        storeId = data.store_id;
        lng = data.longitude;
        lat = data.latitude;
        citycode = data.citycode;
        if (storeId != '') {
            var options = {
                module: 'FM_APP_PACKAGE_CHECK_NEWSTORETIME',
                params: {
                    packageid: data.packageid,
                    store_id: storeId,
                    beautician_id: bid,
                    item_id: item_id
                }
            }
        } else {
            var options = {
                module: 'FM_APP_PACKAGE_CHECK_VISITTIME',
                params: {
                    citycode: citycode,
                    packageid: data.packageid,
                    longitude: lng,
                    latitude: lat,
                    beautician_id: bid,
                    item_id: item_id
                }
            }
        }

        getTime(options);
    } else if ($scope.form == 'store') { //单次到店选择时间
        storeId = data.store_id;
        store_type = data.store_type;
        var options = {
            module: 'FM_APP_CHECK_NEWSTORETIME',
            params: {
                store_id: storeId, //店面id
                store_type: store_type //房间类型

            }
        };
        getTime(options);
    }
    $scope.goback = function () {
        window.history.go(-1);
    };
    //获取日期显示文本
    $scope.getDateText = function (index, timestamp) {
        if (index == 0) {
            return '今天';
        } else if (index == 1) {
            return '明天';
        } else {
            return ('星期' + $filter('week')((parseInt(timestamp)) * 1000));
        }
    };
    //选时间
    $scope.choiceTime = function (time) {
        if ($scope.selectTime == time)
            return;
        if (time.time_status == 'N') return;
        $scope.selectTime = time;
    };
    //选好时间跳转
    $scope.enter = function () {
        if ($scope.selectTime == null) {
            Xalert.loading("请选择" + $rootScope.serviceText + "时间", 1000);
            return;
        }
//		if($scope.form == 'home') {
//			localStorage.setItem("selectTime", 'true');
//			localStorage.setItem("timeData", angular.toJson($scope.selectTime));
//			window.history.go(-1);
//		} else if($scope.form == 'technicianDetail') {
//			localStorage.setItem("selectTime", 'true');
//			localStorage.setItem("timeData", angular.toJson($scope.selectTime));
//			window.history.go(-1);
//
//		} else if($scope.form == 'my-ticket-order') {
//			localStorage.setItem("selectTime", 'true');
//			localStorage.setItem('timeData', angular.toJson($scope.selectTime));
//			window.history.go(-1);
//		} else if($scope.form == 'store') {
//			localStorage.setItem("selectTime", 'true');
//			localStorage.setItem("timeData", angular.toJson($scope.selectTime));
//			window.history.go(-1);
//		}
        localStorage.setItem("selectTime", 'true');
        localStorage.setItem('timeData', angular.toJson($scope.selectTime));
        window.history.go(-1);

    };
    /**
     * 获取可用时间
     * @param {请求参数} options
     */
    function getTime(options) {
        getInterface.jsonp(options, function (results, params) {
        	$scope.itemData= results.results.length;
        	if($scope.itemData == 0) {
				$scope.listdata = true;
			} else if($scope.itemData > 0) {
				$scope.listdata = false;
			}
            if (results.status == 'Y' && results.results != null && results.results.length != 0) {
                $scope.items = results.results;
                $scope.current(0, $scope.items[0])
            } else {
                if (results.error_msg)
                    Xalert.loading(results.error_msg, 1000);
            }
        });
    };
    /**
     * 切换日期
     * @param {日期列表的下标} Vtime
     * @param {日期对象} item
     */
    $scope.current = function ($index, item) {
        if ($scope.position == $index) return;
        $scope.position = $index;
        $scope.timeItems = item.times;

    };
    //	单次上门服务可选服务时长
    var loadData = function () {
        var options = {
            module: 'FM_APP_CHECK_VISITTIME',
            params: {
                citycode: citycode,
                longitude: lng,
                latitude: lat,
                beautician_id: bid,
            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
                return false;
            } else {
                $scope.items = results.results;
                $scope.current($scope.items[0].visit_time, $scope.items[0])
                var num = results.results.length;
                $scope.boxW = {
                    width: 12 * num + 'rem'
                };

            }

        });
    };

    //	套票到家服务可选服务时长
    var loadData3 = function () {
        var options = {
            module: 'FM_APP_PACKAGE_CHECK_VISITTIME',
            params: {
                citycode: citycode,
                longitude: lng,
                latitude: lat,
                packageid: packageId,
                beautician_id: bid
                //                  		item_id:['bb193015_4a9b_c017_be74_e1127a8e8972']死

            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
                return false;
            } else {
                $scope.items = results.results;
                $scope.current($scope.items[0].visit_time, $scope.items[0])
                var num = results.results.length;
                $scope.boxW = {
                    width: 12 * num + 'rem'
                };
            }

        });
    };
    //	套票到店服务可选服务时长
    var loadData4 = function () {
        var options = {
            module: 'FM_APP_PACKAGE_CHECK_NEWSTORETIME',
            params: {

                packageid: packageId,
                beautician_id: bid,
                store_id: storeId //死
                //              		item_id:['bb193015_4a9b_c017_be74_e1127a8e8972'],  //死[N]
                //              		store_type:'STORE_TYPE_SINGLE'
                //                  		item_id:['bb193015_4a9b_c017_be74_e1127a8e8972']死

            }
        };
        getInterface.jsonp(options, function (results, params) {
            if (results.status == 'N') {
                Xalert.loading(results.error_msg, 1000);
                return false;
            } else {
                $scope.items = results.results;
                $scope.current($scope.items[0].visit_time, $scope.items[0])
                var num = results.results.length;
                $scope.boxW = {
                    width: 12 * num + 'rem'
                };
            }

        });
    }

});