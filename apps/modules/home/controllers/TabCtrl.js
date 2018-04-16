'use strict';
/* tab
 author huoyuanyuan
 */
app.controller('TabCtrl', function($rootScope, $scope, $filter, languages, getInterface, Xalert) {
	$scope.tabName = $filter('i18n')('footer-tab');
	$scope.goPage = function(pageType) {
		switch(pageType) {
			case 'my':
				$state.go('tab.my');
				break;
		}
	}
});