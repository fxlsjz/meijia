'use strict';

app.config(['$stateProvider', '$ionicConfigProvider','$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider',
        function($stateProvider,$ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider) {
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|sms):/);
		    $ionicConfigProvider.platform.ios.tabs.style('standard'); 
	        $ionicConfigProvider.platform.ios.tabs.position('bottom');
	        $ionicConfigProvider.platform.android.tabs.style('standard');
	        $ionicConfigProvider.platform.android.tabs.position('bottom');
	
	        $ionicConfigProvider.platform.ios.navBar.alignTitle('center'); 
	        $ionicConfigProvider.platform.android.navBar.alignTitle('center');
	
	        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
	        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');        
	
	        $ionicConfigProvider.platform.ios.views.transition('ios'); 
	        $ionicConfigProvider.platform.android.views.transition('android');
	        
	        $ionicConfigProvider.scrolling.jsScrolling(true);



        }]);
