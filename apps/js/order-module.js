'use strict';

/**
 * 订单模块 by zl
 */
angular.module('wechat')
    .config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
        function ($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

            $stateProvider
            //订单列表
                .state('tab.order', {
                    cache: false,
                    url: "/order?ticketOrder&paySuccess&timestamp",
                    views: {
                        "tab-order": {
                            controller: 'OrderIndexCtrl',
                            templateUrl: 'apps/modules/order/templates/index.html'
                        }
                    },
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['index.css', 'OrderIndexCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })

                //订单列表（我的里面的那个）
                .state('order-order-list-two', {
                    cache: false,
                    url: "/order/index-two/?ticketOrder&paySuccess&timestamp",
                    controller: 'OrderIndexCtrl',
                    templateUrl: 'apps/modules/order/templates/index-two.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['index.css', 'OrderIndexCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
                //订单详情
                .state('order-order-detail', {
                    url: "/order/order-detail?oid&actualprice&balance&time&timestamp",
                    cache: false,
                    controller: 'ServiceOrderDetail',
                    templateUrl: 'apps/modules/order/templates/order-detail.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['index.css', 'OrderIndexCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
                //提交订单 从店面进
                .state('submit-order', {
                    cache: false,
                    url: "/order/submit-order/:data",
                    controller: 'Submit-Order',
                    templateUrl: 'apps/modules/order/templates/submit-order.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['submit-order.css', 'SubmitOrderCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
                //提交订单  从服务进
                .state('submit-service-order', {
                    cache: false,
                    url: "/order/submit-service-order/:data",
                    controller: 'SubmitServiceOrderCtrl',
                    templateUrl: 'apps/modules/order/templates/submit-service-order.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['submit-order.css', 'SubmitServiceOrderCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
                //追踪订单
                .state('order-track-order', {
                    url: "/order/track-order/?oid",
                    cache: false,
                    controller: 'TrackOrder',
                    templateUrl: 'apps/modules/order/templates/service-track-order.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['track-order.css', 'TrackOrderCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })

                //订单须知
                .state('order-order-rule', {
                    url: "/order/order-rule",
                    cache: false,
                    controller: 'OrderRule',
                    templateUrl: 'apps/modules/order/templates/order-rule.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['track-order.css', 'TrackOrderCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
                //评价页面
                .state('order-evaluate', {
                    url: "/order/evaluate",
                    cache: false,
                    controller: 'OrderEvaluateCtrl',
                    templateUrl: 'apps/modules/order/templates/evaluate.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['evaluate.css', 'OrderEvaluateCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
                //评价服务列表
                .state('order-evaluate-service', {
                    url: "/order/evaluate-service",
                    cache: false,
                    controller: 'OrderEvaluateServiceCtrl',
                    templateUrl: 'apps/modules/order/templates/evaluate-service-list.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['evaluate-service.css', 'OrderEvaluateCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
                //评价技师列表
                .state('order-evaluate-technician', {
                    url: "/order/evaluate-technician",
                    cache: false,
                    controller: 'OrderEvaluateTechnicianCtrl',
                    templateUrl: 'apps/modules/order/templates/evaluate-technician-list.html',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(helperProvider.loadModuleFile('order', ['evaluate-technician.css', 'OrderEvaluateCtrl.js']));
                        }]
                    },
                    authorizedRoles: ['@']
                })
        }
    ])