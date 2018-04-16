'use strict';

/**
 * 技师模块
 */

angular.module('wechat')
	.config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
		function($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

			$stateProvider
				//首页技师到家列表
				.state('tab.technician', {
					url: "/technician",
					cache: false,
					views: {
						"tab-technician": {
							controller: 'TechnicianIndexCtrl',
							templateUrl: 'apps/modules/technician/templates/index.html'
						}
					},
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('technician', ['index.css', 'TechnicianIndexCtrl.js']));
						}]
					}
				})
				//				技师详情
				.state('beautician-detail', {
					url: "/technician/detail/:id/:data",
					cache: false,
					controller: 'BeauticianDetailCtrl',
					templateUrl: 'apps/modules/technician/templates/detail.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('technician', ['me-detail.css', 'TechnicianDetailCtrl.js']));
						}]
					}
				})
				//到店双人选技师技师列表
				.state('shop-two-technician', {
					url: "/technician/shop-two-technician/:store_id/:store_type",
					cache: false,
					controller: 'ShopTwoTechnicianListCtrl',
					templateUrl: 'apps/modules/technician/templates/shop-two-technician.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('technician', ['two-technician.css', 'TechnicianTwoCtrl.js']));
						}]
					}
				})
				//到家技师列表
				.state('home-technician', {
					url: "/technician/home-technician/:data",
					cache:false,
					controller: 'HomeTechnicianListCtrl',
					templateUrl: 'apps/modules/technician/templates/home-technician.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('technician', ['index.css', 'homeTechnicianList.js']));
						}]
					}
				})
				
				//技师详情的评价列表
				.state('technician-evaluatList', {
					url: "/technician/evaluatList/:form/:data",
					cache: false,
					controller: 'evaluatCtrl',
					templateUrl: 'apps/modules/technician/templates/evaluatList.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('technician', ['evaluatList.css', 'evaluatListCtrl.js']));
						}]
					}
				})
		}
	])
	.service('technicianChange', ['$http', '$q', 'getInterface', 'Authentication', function($http, $q, getInterface, Authentication) {
		return {
			//技师收藏
			collection: function(beautician_id, callback) {
				var deferred = $q.defer();
				var collect_options = {
					module: 'FM_APP_COLLECT_BEAUTICIAN',
					params: {
						beautician_id: beautician_id
					}
				};
				getInterface.post(collect_options, function(results) {
					if(!Authentication.checkLogin(true)) {
						return false;
					};
					callback(results);
				});
			},
			////技师取消收藏
			uncollection: function(beautician_id, callback) {
				var deferred = $q.defer();
				var collect_options = {
					module: 'FM_APP_CANCELCOLLECT_BEAUTICIAN',
					params: {
						beautician_id: beautician_id
					}
				};
				getInterface.post(collect_options, function(results) {
					if(!Authentication.checkLogin(true)) {
						return false;
					};
					callback(results);
				});
			}
		}
	}])