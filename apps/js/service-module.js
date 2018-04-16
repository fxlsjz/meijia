'use strict';

/**
 * 服务模块
 */

angular.module('wechat')
	.config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
		function($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

			$stateProvider
				.state('tab.service', {
					cache: false,
					url: "/service",
					views: {
						"tab-service": {
							controller: 'ServiceIndexCtrl',
							templateUrl: 'apps/modules/service/templates/index.html'
						}
					},
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('service', ['service-listNew.css', 'ServiceIndexCtrl.js']));
						}]//'service-list.css',
					}
				})
				//选服务
//				.state('store-single-service', {
//					url: "/service/list",
//					cache: false,
//					controller: 'storeSingleService',
//					templateUrl: 'apps/modules/service/templates/service-single.html',
//					resolve: {
//						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
//							return $ocLazyLoad.load(helperProvider.loadModuleFile('service', ['index.css', 'ServiceSingleCtrl.js']));
//						}]
//					}
//				})
				.state('store-single-service', {
					url: "/service/list",
					cache: false,
					controller: 'ServiceSingleNewCtrl',
					templateUrl: 'apps/modules/service/templates/service-singleNew.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('service', ['listNew.css', 'ServiceSingleNewCtrl.js']));
						}]
					}
				})
				//服务详情
				.state('store-service-detail', {
					url: "/service/detail/:data",
					cache: false,
					controller: 'storeSingleServiceDetail',
					templateUrl: 'apps/modules/service/templates/service-detail.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('service', ['service-detail.css', 'ServiceDetailCtrl.js']));
						}]
					}
				})
				//双人选服务
				.state('service-two', {
					cache: false,
					url: "/service/two/:store_id",
					controller: 'ServiceTwoCtrl',
					templateUrl: 'apps/modules/service/templates/service-two.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('service', ['serviceTwo.css', 'ServiceTwoCtrl.js']));
						}]
					}
				})
				//服务时间
				.state('service-time', {
					cache: false,
					url: "/service/time/:form/:data",
					controller: 'ServiceTimeCtrl',
					cache: false,
					templateUrl: 'apps/modules/service/templates/service-time.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('service', ['me-service-time.css', 'ServiceTimeCtrl.js']));
						}]
					}
				})
				//服务确认订单
				.state('sure-order', {
					url: "/service/sure-order",
					cache: false,
					//          params:{
					//          	atime:'',//所选服务的时间
					//          	aprice:'',//所选服务的价格
					//          	stime:'',//预约时间（时间戳）
					//          	timeItem:'',//8:30
					//          	from:''//来自那个页面，''
					//          },
					controller: 'SureOrderCtrl',
					templateUrl: 'apps/modules/service/templates/confirm-order.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile(['my', 'service'], ['ticket.css', 'ConfirmOrderCtrl.js']));
						}]
					}
				})
				
					//城市列表
				.state('service-city', {
					cache: false,
					url: "/service/city-lists",
					controller: 'ServiceCityCtrl',
					cache: false,
					templateUrl: 'apps/modules/service/templates/city-lists.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('service', ['me-service-time.css', 'ServiceCityCtrl.js']));
						}]
					}
				})
		}
	])
	.service('serviceChange', ['$http', '$q', 'getInterface', 'Authentication', function($http, $q, getInterface, Authentication) {
		return {
			//服务收藏
			collection: function(itemid, callback) {
				var deferred = $q.defer();
				var collect_options = {
					module: 'FM_APP_COLLECT_SERVICE',
					params: {
						itemid: itemid
					}
				};
				getInterface.post(collect_options, function(results) {
					if(!Authentication.checkLogin(true)) {
						return false;
					};
					callback(results);
				});
			},
			//服务取消收藏
			uncollection: function(itemid, callback) {
				var deferred = $q.defer();
				var collect_options = {
					module: 'FM_APP_CANCELCOLLECT_SERVICE',
					params: {
						itemid: itemid
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