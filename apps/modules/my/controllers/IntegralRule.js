/**
 * 积分规则
 * wanghui
 */
app.controller('IntegralRule', function($rootScope, $scope, getInterface, Xalert, $ionicScrollDelegate) {
	document.title="我的积分";
	$scope.goback = function() {
		window.history.go(-1);
	}
	$scope.integralInfo = undefined;
	$scope.score_list = []; //积分使用记录
	$scope.noData = false; //是否显示无数据
	$scope.isShowLoadMore = false; //是否显示上拉加载
	$scope.isShowDialog = false; //是否显示积分规则弹出框
	$scope.score_content = $rootScope.appValues ? $rootScope.appValues.score_content.dic_desc : ""; //积分规则
	var isLoadingList = false; //判断列表是否正在获取数据

	getData();
	//返回按钮
	$scope.goback = function() {
		history.go(-1);
	};
	//上拉加载
	$scope.loadMoreGoodsList = function() {
		//判断是否正在访问接口
		if(isLoadingList)
			return;
		isLoadingList = true;
		getData(); //获取数据
	};
	//监听列表滑动
	$scope.onServiceScrollListener = function() {
		if(!$scope.isShowLoadMore) return;
		var contentHeight = document.getElementById("scrollContent").offsetHeight; //content的高度
		var contentViewHeight = document.getElementById("contentView").offsetHeight; //滑动块高度
		var scrollHeight = $ionicScrollDelegate.$getByHandle('scrollContent').getScrollPosition().top;
		if(scrollHeight + contentHeight == contentViewHeight) { //滑动到底部执行上拉加载
			$scope.loadMoreGoodsList();
		}
	};
	//打开积分规则弹出框
	$scope.openIntegralRule = function() {
		if($scope.isShowDialog) return;
		$scope.isShowDialog = true;
		setMaxHeight();
	};
	//关闭积分规则弹出框
	$scope.cleanDialog = function() {
		$scope.isShowDialog = false;
	};

	function setMaxHeight() {
		var bin = document.getElementById("rule-dialog-title");
		if(!bin || bin == null) {
			setTimeout(function() {
				setMaxHeight();
			}, 300);
			return;
		}
		var h = bin.offsetHeight + 1; //content的高度
		var maxHieght = window.innerHeight * 0.7 - h - bin.offsetHeight * 0.6;
		document.getElementById('rule-dialog-content').setAttribute('style', 'max-height: ' + maxHieght + 'px');
	};
	/**
	 * 获取数据
	 */
	function getData() {
		var options = {
			module: 'FM_SHOP_SCORE_LOG',
			params: {
				pagesize: 10, //页大小
				pageoffset: $scope.score_list.length, //访问页
			}
		};
		getInterface.jsonp(options, function(results, params) {
			if(results.status == 'Y') { //接口访问成功
				var result = results.results;
				var items = [];
				if(result && result != null) {
					$scope.integralInfo = result;
					if(result.score_list && result.score_list.length > 0) { //有列表数据
						items = result.score_list;
						$scope.score_list = $scope.score_list.concat(items);
					}
				}
				//判断是否显示上拉加载
				if(!items || items.length == 0 || items.length % 10 != 0) {
					$scope.isShowLoadMore = false;
				} else {
					$scope.isShowLoadMore = true;
				}
				var view = $ionicScrollDelegate.$getByHandle('scrollContent');
				view.resize();
			} else { //接口访问失败
				if(results.error_msg)
					Xalert.loading(results.error_msg, 1000);
			}
			//判断是否显示空数据提示
			if($scope.integralInfo) {
				$scope.noData = false;
			} else {
				$scope.noData = true;
			}
			isLoadingList = false;
		});
	};
});