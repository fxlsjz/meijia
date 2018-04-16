'use strict';

/**
 * 预约到店
 */

angular.module('wechat')
	.config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
		function($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

			$stateProvider
				
				.state('tab.store', {
					url: "/store",
					cache: false,
					views: {
						"tab-store": {
							controller: 'indexStore',
							templateUrl: 'apps/modules/store/templates/indexStore.html'
						}
					},
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['indexStore.css', 'indexStore.js']));
						}]
					}
				})
			//预约到店
				.state('store', {
					url: "/store/:isStamp/",
					cache: false,
					controller: 'storeIndeCtrl',
					templateUrl: 'apps/modules/store/templates/index.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['store.css', 'storeCtrl.js']));
						}]
					}
				})
				//预约到店店面详情
				.state('store-details', {
					cache: false,
					url: "/store/details/:storeId/:store_dis/:Record/",
					controller: 'makeAppointmentStoreDetails',
					templateUrl: 'apps/modules/store/templates/storeDetails.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['storeDeteils.css', 'storeCtrl.js']));
						}]
					}
				})
				//店面相册
				.state('store-album', {
					cache: false,
					url: "/store/album/:list/:storeId/:isStamp",
					controller: 'storeAlbumCtrl',
					templateUrl: 'apps/modules/store/templates/storeAlbum.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['store.css', 'storeCtrl.js']));
						}]
					}
				})
				//套票店面详情
				.state('store-stamps', {
					cache: false,
					url: "/store/stamps/:storeId/:store_dis/:Record/",
					controller: 'storeDetailsCtrl',
					templateUrl: 'apps/modules/store/templates/stampStoreDetails.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['PackageStoreDeteils.css', 'storeCtrl.js']));
						}]
					}
				})
				//地图
				.state('store-map', {
					url: "/store/map/:type/:isStamp/:isFromList",
					cache: false,
					controller: 'storeMapCtrl',
					templateUrl: 'apps/modules/store/templates/map.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['map.css', 'map.js']));
						}]
					}
				})
				//套票店面详情 搜索
				.state('store-search', {
					cache: false,
					url: "/store/search/:storeId/:isStamp/:search",
					controller: 'searchCtrl',
					templateUrl: 'apps/modules/store/templates/searchStampsDetails.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['store.css', 'storeCtrl.js']));
						}]
					}
				})
				//店面详情的评价列表
				.state('store-assessList', {
					url: "/store/assessList",
					cache: false,
					controller: 'assessCtrl',
					templateUrl: 'apps/modules/store/templates/assessList.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['assessList.css', 'assessCtrl.js']));
						}]
					}
				})
				//选择店面
				.state('store-choseStore', {
					url: "/store/choseStore",
					cache: false,
					controller: 'choseStoreCtrl',
					templateUrl: 'apps/modules/store/templates/choseStore.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('store', ['choseStore.css', 'choseStoreCtrl.js']));
						}]
					}
				})
				
		}
	])