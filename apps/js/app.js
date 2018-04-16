// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var modulePath;
var app = angular.module('wechat', ['ionic', 'oc.lazyLoad', 'ionicLazyLoad', 'tabSlideBox', 'ngAnimate', 'ngCookies', 'ngSanitize', 'localization'

]);
app.provider('$i18n', function () {
    var language = 'zh_CN';
    var data = {};
    this.$get = function ($http) {
        var service = {
            getBooks: function (callBack) {
                $http.get('apps/i18n/' + language + '.json')
                    .success(function (data) {
                        callBack(data);
                    });
            }
        }
        return service;
    }
})

app.provider('helper', function () {
    var name = 'world';

    this.$get = function () {
        return {
            sayHello: function () {
                console.log('hello ' + name);
            }
        };
    };

    this.loadModuleFile = function (modules, file) {
        var files = angular.isArray(file) ? file : [file];
        var modules_files = [];
        angular.forEach(files, function (value, index, objs) {
            var path = 'templates';
            var filename = path + '/' + value;
            var module = modules;
            if (angular.isArray(modules)) {
                module = modules[index];
            }
            if (value.indexOf('/') != -1) {
                filename = value;
            } else if (value.indexOf('.js') != -1) {
                filename = 'controllers/' + value;
            } else if (value.indexOf('.css') != -1) {
                filename = 'css/' + value;
            }
            modules_files.push('apps/modules/' + module + '/' + filename);
        });
        return angular.isArray(file) ? modules_files : modules_files.join('');
    }
});
//app.value('Path', {"module": "apps/module", "test1": "test111"});  //方法2定义全局变量

app.run(function ($rootScope, $ionicPlatform, $state, $stateParams, $cookies, $window, $location, $ionicPopup, $ionicTabsDelegate, $timeout, $ionicBackdrop, ENV, userInfo, Authentication, Xalert, getInterface, AppsetValue, $q) {

    //清除服务下单历史数据
    $rootScope.clearServiceOrderData = function () {
        localStorage.clear();
    }
    $rootScope.payPath = "http://fashionme.test.chinamobo.com/appwechat/index.php/storefront/pay?";//支付地址
    //清除服务下单历史数据
    $rootScope.clearServiceOrder = function () {
        localStorage.removeItem("herTechnician");
        localStorage.removeItem("myTechnician");
        localStorage.removeItem("roomTypename");
        localStorage.removeItem("selectTechnician");
        localStorage.removeItem("singleServiceSelectData");
        localStorage.removeItem("storeName");
        localStorage.removeItem("technicianData");
        localStorage.removeItem("timeData");
        localStorage.removeItem("from");
        localStorage.removeItem("selectTime");
        localStorage.removeItem("selectedAddress");
        localStorage.removeItem("serviceType");
        localStorage.removeItem("singleServiceSelectDataCopy");
        localStorage.removeItem("type");
    }
    $rootScope.selCityInfo = {};
    $rootScope.$_userInfo = userInfo.getObject();
    $rootScope.selCityInfo = $cookies.getObject('selCityInfo');
    //企业自定义的三级域名
    $rootScope.eDomain = $location.host().substring(0, $location.host().lastIndexOf(ENV.cookiesDomain));

    //console.log($rootScope.$_userInfo);

    //是否登录
    $rootScope.isLogin = function () {
        return userInfo.checkLogin();
    }

    //欢迎页
    $rootScope.isLoadStartPage = false; //是否加载过欢迎页
    if ($cookies.get("isLoadStartPage") != 'Y') {
        $cookies.put("isLoadStartPage", 'Y', {
            'path': '/',
            'domain': ENV.cookiesDomain
        });
        $timeout(function () {
            $rootScope.isLoadStartPage = true;
            //				location.reload();
        }, 3000)
    } else {
        $rootScope.isLoadStartPage = true;

    }

    $ionicPlatform.isWechat = navigator.userAgent.toLowerCase().match(/micromessenger/i) == "micromessenger";
    //判断微信并授权
    if ($rootScope.eDomain && $ionicPlatform.isWechat) {
        //!$rootScope.isLogin() &&
        if ($cookies.get("QyWechatOAuth") != $rootScope.eDomain) {
            $cookies.put("QyWechatOAuth", $rootScope.eDomain, {
                'path': '/',
                'domain': ENV.cookiesDomain
            });
            $window.location.href = '/wechat-oauth/' + escape(encodeURIComponent($location.absUrl()));
            return false;
        }
    }

    //监听路由，判断登录权限
    $rootScope.$on('$stateChangeStart', function (event, next, toState, toParams, fromState, fromParams) {
        Authentication.authorized(event, next);
    });

    //URL跳转
    $rootScope.href = function (url, isLogin) {
        if (isLogin) {
            if (Authentication.checkLogin(true)) {
                $window.location.href = url;
            }
        } else {
            $window.location.href = url;
        }

    }

    //跳转到首页
    $rootScope.gohome = function () {
        $rootScope.href('/tab/home');
    }

    //登录超时跳转登录页面
    $rootScope.gologin = function (isLoginTimeOut) {
        $state.go('login', {
            isLoginTimeOut: isLoginTimeOut
        });
    };
    //通用下拉刷新
    $rootScope.doRefresh = function () {
        $state.reload();
    }

    $rootScope.page = 1;
    $rootScope.pagesize = 10;
    $rootScope.title = '魔多客';
    //console.log(Path);
    //判断是否微信浏览器

    $rootScope.isWechat = function () {
        return $ionicPlatform.isWechat;
    }

    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
        // to be used for back button //won't work when page is reloaded.
        if (fromState.name == 'login' && userInfo.checkLogin()) {
            //location.reload();
        }

        $rootScope.fromState = fromState;
        $rootScope.previousState_name = fromState.name;
        $rootScope.previousState_params = fromParams;
    });
    //返回上一页 on-tap="goback()"
    $rootScope.back = function (router) { //实现返回的函数
        if (!$rootScope.previousState_name && router) {
            //$rootScope.previousState_name = router;
        }
        if ($state && $rootScope.previousState_name) {
            $state.go($rootScope.previousState_name, $rootScope.previousState_params);
        }
    };
    $rootScope.selectTabWithIndex = function (index) {
        $ionicTabsDelegate.$getByHandle('bottom-tabs').select(index);
    }

    $rootScope.clear = function () {
        userInfo.logout();
    };
    //返回键
    $rootScope.goback = function (router) {
        //$ionicHistory.goBack();
        //console.log($rootScope.fromState)
        //alert($window.history.length)
        if (!$rootScope.fromState || $rootScope.fromState.name == '') {
            $rootScope.gohome();
        } else {
            $window.history.go(-1)
        }

    };
    //加关注
    //	$rootScope.attention = ' http://mp.weixin.qq.com/s?__biz=MzI5MTA5ODgyMA==&mid=505681577&idx=1&sn=492675e27d185d79da3f8942dd4fcad8#wechat_redirect';
    //loading 加载动画
    $rootScope.show = function (opts, show_callback, hide_callback) {
        $ionicLoading.show(angular.extend({
            template: '<ion-spinner icon="ios"></ion-spinner>'
        }, opts || {})).then(function () {
            show_callback && show_callback();
        });
    };
    $rootScope.hide = function () {
        $ionicLoading.hide().then(function () {
            hide_callback && hide_callback();
        });
    };


        //cookie存值
        function SetCookie(name, value)
        {
            //定义一年
            var days = 365;
            var exp = new Date();
            //定义的失效时间，
            exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
            //写入Cookie  ，toGMTstring将时间转换成字符串。
            document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString;


        }
        //判断对象是否为空
        function isEmptyObject(obj){
            for (var key in obj) {
                return false;
            }
            return true;
        }
    //城市列表
    function loaCitydData(){

        //先清空cookie里的已选城市
        var data = {};
        var expireDate = new Date();
        $cookies.putObject('selCityInfo', data, {
            'path': '/',
            'expires': expireDate
        });
        $rootScope.selCityInfo = data;

        //下载城市列表
        var options = {
            page: false,
            module: 'FM_APP_GET_CITY',
            params: {
                user_id: '',
                token: ''
            }
        }
        getInterface.jsonp(options, function (results, params) {
            $rootScope.cityitems = results.results;

            //alert(JSON.stringify($rootScope.selCityInfo));
            if (isEmptyObject($rootScope.selCityInfo)) {
                if ($rootScope.cityitems) {
                    if ($rootScope.curraddressCity) {
                        for (var i = 0; i < $rootScope.cityitems.length; i++) {
                            if ($rootScope.curraddressCity.indexOf($rootScope.cityitems[i].city_name) > -1) {
                                var expireDate = new Date();
                                var data = {
                                    selCity: $rootScope.cityitems[i].city_name,
                                    selHome: $rootScope.cityitems[i].city_has_online,
                                    selShop: $rootScope.cityitems[i].city_has_offline,
                                    cityCode: $rootScope.cityitems[i].city_code,
//                                  cityCode: '131',
                                }

                                //匹配成功保存定位城市code到cookies
                                SetCookie("currentCityCode",$rootScope.cityitems[i].city_code);

                                $rootScope.currentCityCode = $rootScope.cityitems[i].city_code;

                                //定位成功获取附近店面
                                $rootScope.getRecommendStore($rootScope.coordinate);


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
                            var data = {
                                selCity: $rootScope.cityitems[0].city_name,
                                selHome: $rootScope.cityitems[0].city_has_online,
                                selShop: $rootScope.cityitems[0].city_has_offline,
                                cityCode: $rootScope.cityitems[0].city_code,
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
                        var data = {
                            selCity: $rootScope.cityitems[0].city_name,
                            selHome: $rootScope.cityitems[0].city_has_online,
                            selShop: $rootScope.cityitems[0].city_has_offline,
                            cityCode: $rootScope.cityitems[0].city_code,

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
    }

    /*****************************定位开始**************************/
    //区分公司
    function location() {

        if (navigator.geolocation) {

            var geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function (r) {

                if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                    console.log("定位成功");
                    getAddress(r.point);

                } else {
                    alert(this.getStatus() + "定位错误信息");
                    console.log(this.getStatus() + "定位错误信息");

                }

            }, {
                enableHighAccuracy: true,
                maximumAge: 0
            })
        } else {
            alert("当前位置定位失败");

        }
    };
    /**
     * 经纬度转换地址
     * @param {经纬度} point
     */
    function getAddress(point) {
        // 百度地图API功能
        var geoc = new BMap.Geocoder();

        geoc.getLocation(point, function (rs) {
            //解析成功设置经纬度和地址
            var addComp = rs.addressComponents;

            $rootScope.coordinate = {
                latitude: point.lat,
                longitude: point.lng
            };

            console.log("当前定位:");
            console.log($rootScope.coordinate.latitude);
            console.log($rootScope.coordinate.longitude);

            $rootScope.curraddressCity = addComp.city;
            $rootScope.curraddress = rs.address;

            loaCitydData(); //城市列表

            //alert($rootScope.coordinate.latitude);


            //定位成功获取附近店面
            $rootScope.getRecommendStore($rootScope.coordinate);

        });
    }

    /*****************************定位结束**************************/
    /*****************************键值开始**************************/
    $rootScope.defer = $q.defer();
    AppsetValue.loadCompany($rootScope.defer);
    $rootScope.defer.promise.then(function (results) {
        $rootScope.appValues = results.results.res_value;
        //最小时长
        console.log($rootScope.appValues.SERVICE_MIN_TIME)
        $rootScope.mintime = $rootScope.appValues.SERVICE_MIN_TIME.dic_desc / 60;
        //公司名称
        $rootScope.comPanyName = $rootScope.appValues.SYSTEM_COMPANY_NAME.dic_desc;
        //电话号码
        $rootScope.comPanyTel = $rootScope.appValues.SYSTEM_CONTACTUS_PHONE.dic_desc;
        //余额支付开关
        if ($rootScope.appValues.IS_RECHARGE && $rootScope.appValues.IS_RECHARGE.dic_desc != '') {
            $rootScope.isRecharge = $rootScope.appValues.IS_RECHARGE.dic_desc;
        } else {
            $rootScope.isRecharge = true;
        }


        //余额充值规则
        if ($rootScope.appValues.SYSTEM_RECHARGE_RULE && $rootScope.appValues.SYSTEM_RECHARGE_RULE.dic_desc != '') {
            $rootScope.wallettype = $rootScope.appValues.SYSTEM_RECHARGE_RULE.dic_desc;
        } else {
            $rootScope.wallettype = '';
        }
        //服务文案
        if ($rootScope.appValues.SERVICE_TEXT && $rootScope.appValues.SERVICE_TEXT.dic_desc != '') {
            $rootScope.serviceText = $rootScope.appValues.SERVICE_TEXT.dic_desc;
        } else {
            $rootScope.serviceText = '服务';
        }

        //城市到家文案
        if ($rootScope.appValues.SERVICE_HOME_Y && $rootScope.appValues.SERVICE_HOME_Y.dic_desc != '') {
            $rootScope.SERVICE_HOME_Y = $rootScope.appValues.SERVICE_HOME_Y.dic_desc;
        } else {
            $rootScope.SERVICE_HOME_Y = '预约到家';
        }
        //城市到店文案
        if ($rootScope.appValues.SERVICE_STORE_Y && $rootScope.appValues.SERVICE_STORE_Y.dic_desc != '') {
            $rootScope.SERVICE_STORE_Y = $rootScope.appValues.SERVICE_STORE_Y.dic_desc;
        } else {
            $rootScope.SERVICE_STORE_Y = '预约到店';
        }
        //技师文案
        if ($rootScope.appValues.BEAUTICIAN_TEXT && $rootScope.appValues.BEAUTICIAN_TEXT.dic_desc != '') {
            $rootScope.technicianText = $rootScope.appValues.BEAUTICIAN_TEXT.dic_desc;
        } else {
            $rootScope.technicianText = '技师';
        }
        //套票文案
        if ($rootScope.appValues.PACKAGE_TEXT && $rootScope.appValues.PACKAGE_TEXT.dic_desc != '') {
            $rootScope.packageText = $rootScope.appValues.PACKAGE_TEXT.dic_desc;
        } else {
            $rootScope.packageText = '套票';
        }
        //			$scope.packageText = $rootScope.packageText;
        //			$scope.technicianText=$rootScope.technicianText;
        //			$scope.serviceText = $rootScope.serviceText;
        //预约到店文案
        if ($rootScope.appValues.STORE_TEXT && $rootScope.appValues.STORE_TEXT.dic_desc != '') {
            $rootScope.storeText = $rootScope.appValues.STORE_TEXT.dic_desc;
        } else {
            $rootScope.storeText = '预约到店';
        }
        //预约到家文案
        if ($rootScope.appValues.HOME_TEXT && $rootScope.appValues.HOME_TEXT.dic_desc != '') {
            $rootScope.homeText = $rootScope.appValues.HOME_TEXT.dic_desc;
        } else {
            $rootScope.homeText = '预约到家';
        }
        //门店套票文案
        if ($rootScope.appValues.PACKAGE_STORE_TEXT && $rootScope.appValues.PACKAGE_STORE_TEXT.dic_desc != '') {
            $rootScope.packageStoreText = $rootScope.appValues.PACKAGE_STORE_TEXT.dic_desc;
        } else {
            $rootScope.packageStoreText = '门店套票';
        }
        //到家套票文案
        if ($rootScope.appValues.PACKAGE_HOME_TEXT && $rootScope.appValues.PACKAGE_HOME_TEXT.dic_desc != '') {
            $rootScope.packageHomeText = $rootScope.appValues.PACKAGE_HOME_TEXT.dic_desc;
        } else {
            $rootScope.packageHomeText = '到家套票';
        } //服务按钮
        $rootScope.isShowDynService = $rootScope.appValues.BUTTON_SERVICE_SHOW.dic_desc;
        //技师按钮
        $rootScope.isShowDynBeautician = $rootScope.appValues.BUTTON_BEAUTICIAN_SHOW.dic_desc;
        //企业类型
        $rootScope.companyType = $rootScope.appValues.COMPANY_MODEL.dic_desc;
        $rootScope.companyType = 'SYSTEM_SHOP_O2O';
        //o2o
        if ($rootScope.companyType == 'SYSTEM_O2O') {
            console.log('一期');
            $rootScope.isO2O = true; //一期tab
            $rootScope.ComslideImgs = true; //O2O - 轮播图
            $rootScope.isMyItem = true; //我的
            $rootScope.serviceCounts = true; //服务总次数
            location();
            return;
        }
        //电商
        if ($rootScope.companyType == 'SYSTEM_SHOP') {
            console.log('电商');
            $rootScope.isShop = true; //电商tab
            $rootScope.serviceCounts = false; //服务总次数
            return;
        }
        //o2o + 电商
        if ($rootScope.companyType == 'SYSTEM_SHOP_O2O') {
            console.log('o2o + 电商');
            $rootScope.isShopO2O = true; //o2o + 电商tab
            $rootScope.ComslideImgs = true; //O2O - 轮播图
            $rootScope.isMyItem = false;
            $rootScope.serviceCounts = true; //服务总次数
            location();
            return;
        }
    });
    /*****************************键值结束**************************/
})

    .config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', '$httpProvider', '$i18nProvider', 'helperProvider',
        function ($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, $httpProvider, $i18nProvider, helperProvider) {
            app.controller = $controllerProvider.register;
            app.directive = $compileProvider.directive;
            app.filter = $filterProvider.register;
            app.factory = $provide.factory;
            app.service = $provide.service;
            app.constant = $provide.constant;
            app.value = $provide.value;
            app.stateProvider = $stateProvider;

            //app.helperProvider = helperProvider;
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|wxlocalresource|weixin):/);
            $i18nProvider.language = 'en_US';

            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            //$compileProvider.debugInfoEnabled(false);

            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
            var param = function (obj) {
                var query = '',
                    name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null)
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            // Override $http service's default transformRequest
            $httpProvider.defaults.transformRequest = [function (data) {
                return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
            }];

            //greetingProvider.setText("Howdy there, ");
            $ionicConfigProvider.templates.maxPrefetch(10);
            //$ionicConfigProvider.views.maxCache(1);

            //$ionicConfigProvider.scrolling.jsScrolling(false);
            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            $stateProvider
            // setup an abstract state for the tabs directive
                .state('image-preview', {
                    url: '/image/preview/:pid/:index/:multiple/:src',
                    //                  params: {
                    //                      src: '',
                    //                      index: 0,
                    //                      multiple: ''
                    //                  },
                    templateUrl: 'apps/templates/image-preview.html',
                    controller: function ($rootScope, $scope, $stateParams, $ionicSlideBoxDelegate, $timeout, $filter, ImagePreviewModal) {
                        ImagePreviewModal.initModal($scope);
                        //                      $scope.imagePreviewSrc = $stateParams.src.split(',');
                        //                      angular.forEach($scope.imagePreviewSrc, function (value, key) {
                        //                          $scope.imagePreviewSrc[key] = $filter('thumbImage')(value, 800);
                        //                      })
                        //$scope.imagePreviewSrc = $stateParams.src;
                        //console.log($scope.imagePreviewSrc)
                        //                      $scope.eq = $stateParams.index;
                        //                      var imagePreviewSlide = $ionicSlideBoxDelegate.$getByHandle('imagePreview');
                        //console.log(imagePreviewSlide)
                        //                      $timeout(function(){
                        //                          imagePreviewSlide.slide($scope.eq, 0);
                        //                          imagePreviewSlide.update();
                        //                      });

                        //                      $scope.closeImagePreviewModal = function(){
                        //                          $rootScope.goback();
                        //                      }
                    }
                })

                //微信授权登录
                .state('wechat-oauth', {
                    url: '/wechat-oauth/:url',
                    templateUrl: 'apps/modules/boot/templates/wechat-oauth.html',
                    controller: function ($location, $stateParams, ENV) {
                        var url = unescape($stateParams.url);
                        window.location.href = ENV.WxOauthDomainName + 'index.php/wechat/oauth?url=' + encodeURIComponent(url);
                        return false;
                    }
                })
                //底部tab切换
                .state('tab', {
                    url: '/tab',
                    abstract: true,
                    controller: 'TabCtrl', // This view will use AppCtrl loaded below in the resolve
                    templateUrl: 'apps/templates/tabs.html',
                    resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([
                                'apps/modules/home/controllers/TabCtrl.js',
                            ]);
                        }]
                    }

                });

            $urlRouterProvider.otherwise('/tab/home');
            //$locationProvider.rewriteLinks(false);
            // $locationProvider.html5Mode(true);

        }
    ])