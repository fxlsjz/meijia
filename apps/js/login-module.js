'use strict';

/**
 * 登录模块
 */
angular.module('wechat')
	.config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
		function($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

			//登录
			$stateProvider
				.state('login', {
					cache: false,
					url: "/login/:isLoginTimeOut",
					controller: 'LoginIndexCtrl',
					templateUrl: 'apps/modules/login/templates/index.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('login', ['index.css', 'LoginIndexCtrl.js']));
						}]
					}
				})
				//用户协议
				.state('agreement', {
					url: "/agreement",
					controller: 'UserAgreementCtrl',
					templateUrl: 'apps/modules/login/templates/agreement.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('login', ['index.css', 'UserAgreementCtrl.js']));
						}]
					}
				})
		}
	])