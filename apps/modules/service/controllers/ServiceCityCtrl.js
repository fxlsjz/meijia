'use strict';
/*城市列表
   author tzb
   */
app.controller('ServiceCityCtrl', function($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, $filter, $cookies, $timeout, $window, userInfo) {
	document.title = "选择城市";
	//城市列表
    var loaCitydData = function () {
        var options = {
            page: false,
            module: 'FM_APP_GET_CITY',
            params: {
                user_id: '',
                token: ''
            }
        };
        getInterface.jsonp(options, function (results, params) {
            $rootScope.cityitems = results.results;
            if (!$rootScope.selCityInfo) {
                if ($rootScope.cityitems) {
                    if ($rootScope.curraddressCity) {
                        for (var i = 0; i < $rootScope.cityitems.length; i++) {
                            if ($rootScope.curraddressCity.indexOf($rootScope.cityitems[i].city_name) > -1) {
                                var expireDate = new Date();
                                var data = {};
                                data = {
                                    selCity: $rootScope.cityitems[i].city_name,
                                    selHome: $rootScope.cityitems[i].city_has_online,
                                    selShop: $rootScope.cityitems[i].city_has_offline,
//                                  cityCode: $rootScope.cityitems[i].city_code
                                    cityCode: '131'
                                };
                                expireDate.setDate(expireDate.getDate() + 365);
                                $cookies.putObject('selCityInfo', data, {
                                    'path': '/',
                                    'expires': expireDate
                                });
                                $rootScope.selCityInfo = data;
                                break;
                            }

                        }
                        if (!$rootScope.selCityInfo.selCity) {
                            var expireDate = new Date();
                            var data = {};
                            data = {
                                selCity: $rootScope.cityitems[0].city_name,
                                selHome: $rootScope.cityitems[0].city_has_online,
                                selShop: $rootScope.cityitems[0].city_has_offline,
                                cityCode: $rootScope.cityitems[0].city_code
                            };
                            expireDate.setDate(expireDate.getDate() + 365);
                            $cookies.putObject('selCityInfo', data, {
                                'path': '/',
                                'expires': expireDate
                            });
                            $rootScope.selCityInfo = data;
                        }
                    } else {
                        var expireDate = new Date();
                        var data = {};
                        data = {
                            selCity: $rootScope.cityitems[0].city_name,
                            selHome: $rootScope.cityitems[0].city_has_online,
                            selShop: $rootScope.cityitems[0].city_has_offline,
                            cityCode: $rootScope.cityitems[0].city_code
                        };
                        expireDate.setDate(expireDate.getDate() + 365);
                        $cookies.putObject('selCityInfo', data, {
                            'path': '/',
                            'expires': expireDate
                        });
                        $rootScope.selCityInfo = data;

                    }

                }

            }
        });
    };
    
    $scope.clickModal = function (item) {
        var expireDate = new Date();
        var data = {
            selCity: item.city_name,
            selHome: item.city_has_online,
            selShop: item.city_has_offline,
            cityCode: item.city_code
        };
        expireDate.setDate(expireDate.getDate() + 365);
        $cookies.putObject('selCityInfo', data, {
            'path': '/',
            'expires': expireDate
        });
        $rootScope.selCityInfo = data;
//      $scope.closeModal(); 
		history.go(-1);
    };
});
