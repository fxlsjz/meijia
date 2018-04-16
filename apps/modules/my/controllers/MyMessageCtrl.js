/*
 * 我的消息
 */
app.controller('MyMessageCal', function($rootScope, $scope, $ionicGesture, $state, $stateParams,
			$ionicLoading, $ionicPopup, getInterface, ENV, Xalert, SwitchEnterpriseService, $timeout) {	
	document.title = "我的消息";
	//		消息列表
	$scope.items = [];
	$scope.page = 1;
	
	$scope.loadData = function() {
		var product_id = $stateParams.id;
		var options = {
			page: $scope.page,
			data: $scope.items,
			canLoadMore: false,
			module: 'FM_APP_MESSAGE_LIST',
			params: {
				current_page: $scope.page,
				page_size: 10,
			}
		};
		
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y') {
				$scope.page = params.page;
				$scope.items = params.data;
				$scope.counts = results.counts;
				$scope.canLoadMoreGoodsList = params.canLoadMore;
			}
		});
	}
	
	$scope.loadData();

	var bFlag = false;
	var removePopup;
	$scope.$on('$stateChangeStart', function(event, toState, fromState) {
		if(bFlag) {
			removePopup.close();
		}
	});
	//删除当前项
	$scope.deleteItem = function(index) {
		
		var options = {
			module: 'FM_APP_MESSAGE_DELETE',
			params: {
					message_id: $scope.items[index].message_id //消息id
			}
		};
		getInterface.jsonp(options, function(results) {
			if(results.status == 'Y') {
			$scope.items.splice(index, 1);
			$scope.loadData();
			}
		});
		
				
//			bFlag = true;
//			removePopup = $ionicPopup.show({
//				cssClass: 'Mycollect',
//				template: '<p style="margin: 2em 0; text-align: center"></p>',
//				scope: $scope,
//				buttons: [{
//					text: '<font color="#999">取消</font>',
//					onTap: function() {
//						document.getElementsByClassName('item-content')[index].style.WebkitTransform = 'translate3d(0px, 0px, 0px)';
//						bFlag = false;
//					}
//				}, {
//					text: "确定",
//					type: 'button-positive',
//					onTap: function(e) {
//						var options = {
//							module: 'FM_SHOP_CANCELCOLLECT_PRODUCT',
//							params: {
//								product_id: $scope.items[index].product_id //消息id
//							}
//						};
//						getInterface.jsonp(options, function(results) {
//							if(results.status == 'Y') {
//								$scope.items.splice(index, 1);
//								$scope.loadData();
//							}
//						});
//						bFlag = false;
//					}
//				}]
//			})
		}
	// 		上拉加载
		$scope.loadMoreGoodsList = function() {
			setTimeout(function() {
				$scope.canLoadMoreGoodsList = false;
				$scope.loadData();
				setTimeout(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}, 1000);
			}, 1000);
		};
	//下拉刷新
	$scope.doRefresh = function() {
		$scope.page = 1;
		$timeout(function() {
			$scope.items = [];
			$scope.loadData();
			$scope.$broadcast('scroll.refreshComplete');
		}, 500);
	};

});