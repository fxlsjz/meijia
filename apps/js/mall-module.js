'use strict';

/**
 * 商城模块
 */

angular.module('wechat')
    .config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
    function ($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

    $stateProvider
    	//商城
        .state('tab.mall', {
            url: "/mall",
           	// cache:false,
            views: {
                "tab-mall": {
                    controller: 'MallIndexCtrl', 
                    templateUrl: 'apps/modules/mall/templates/index.html'
                }
            },
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(helperProvider.loadModuleFile('mall', ['index.css','MallIndexCtrl.js']));
                }]
            }
        })
        //商品详情
        .state('mall-detail', {
            url: "/mall/detail/?id&timestamp",
            cache:false,
            controller: 'MallDetailCtrl', 
            templateUrl: 'apps/modules/mall/templates/detail.html',
            resolve: { 
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load([
                        'apps/modules/mall/css/details.css',
                        'apps/modules/mall/controllers/MallDetailCtrl.js',
                    ]);
                }]
            },
        })
        //商品列表
        .state('mall-list', {
            url: "/mall/list", 
//         	cache:false,
            controller: 'MallDetailCtrl', 
            templateUrl: 'apps/modules/mall/templates/list.html',
            resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helperProvider.loadModuleFile('mall', ['index.css', 'MallIndexCtrl.js']));
                    }]
                },
        })
        //搜索结果
        .state('mall-search', {
            url: "/mall/search/?timestamp", 
            controller: 'MallSearchCtrl', 
            templateUrl: 'apps/modules/mall/templates/search-result.html',
            resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helperProvider.loadModuleFile('mall', ['index.css', 'MallSearchCtrl.js']));
                    }]
                },
        })
}]);