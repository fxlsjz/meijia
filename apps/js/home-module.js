'use strict';

/**
 * 首页大厅模块
 */
angular.module('wechat')
    .config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
        function ($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

            $stateProvider
            //大厅
                .state('tab.home', {
                    url: "/home",
                    cache: false,
                    views: {
                        "tab-home": {
                            controller: 'HomeIndexCtrl',
                            templateUrl: 'apps/modules/home/templates/index.html'
                        }
                    },
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('home', ['index.css', 'HomeIndexCtrl.js']));
                        }]
                    }
                })
                //轮播详情
                .state('slide-detail', {
                    url: "/home/slide",
                    cache: false,
                    controller: 'SlideimgCtrl',
                    templateUrl: 'apps/modules/home/templates/slide-detail.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('home', ['index.css', 'HomeIndexCtrl.js']));
                        }]
                    }
                })
                //本月推荐列表
                .state('recommend', {
                    url: "/home/recommend",
                    cache: false,
                    controller: 'RecommendCtrl',
                    templateUrl: 'apps/modules/home/templates/recommend.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('home', ['index.css', 'HomeIndexCtrl.js']));
                        }]
                    }
                })
                //会员套票列表
                .state('vipPackageList', {
                    url: "/home/vipPackageList",
                    cache: false,
                    controller: 'vipPackageListCtrl',
                    templateUrl: 'apps/modules/home/templates/vipPackageList.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('home', ['vipPackageList.css', 'HomeIndexCtrl.js']));
                        }]
                    }
                })
        }])
    .service('sourseChange', ['$http', '$q', 'getInterface', 'Authentication', function ($http, $q, getInterface, Authentication) {
        return {
            //课程收藏
            collection: function (pId, callback) {
                var deferred = $q.defer();
                var collect_options = {
                    module: 'FM_SHOP_COLLECT_PRODUCT',
                    params: {product_id: pId}
                };
                getInterface.post(collect_options, function (results) {
                    if (!Authentication.checkLogin(true)) {
                        return false;
                    }
                    ;
                    callback(results);
                });
            },
            uncollection: function (pId, callback) {
                var deferred = $q.defer();
                var collect_options = {
                    module: 'FM_SHOP_CANCELCOLLECT_PRODUCT',
                    params: {product_id: pId}
                };
                getInterface.post(collect_options, function (results) {
                    if (!Authentication.checkLogin(true)) {
                        return false;
                    }
                    ;
                    callback(results);
                });
            }
        }
    }]);
