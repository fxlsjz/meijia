/*商品搜索结果
 author wanghui
 */


app.controller('MallSearchCtrl', function ($rootScope, $scope, $ionicGesture, $state, $stateParams, $ionicLoading, $ionicPopup, getInterface,  ENV, Xalert, SwitchEnterpriseService,sourseChange,$timeout) {
	$scope.listdata = false;//false：不显示无数据布局；true：显示无数据布局
    $scope.canLoadMore = true;//可以显示加载更多动画
    $scope.isShowLoadMore = true;//是否显示加载更多动画（都等于true时才显示）
    $scope.page = 1;
    $scope.items = [];//商品列表
    
	$scope.searchText={text:''};
	$scope.txt = sessionStorage.searchCon;
	$scope.searchText.text = $scope.txt;
	$scope.$watch('searchText.text',function (val1,val2){
		if(val1 !== val2){
			$scope.txt = $scope.searchText.text;
			delete sessionStorage.searchCon;
		}
	});
	$scope.$on('$stateChangeStart',function(event, toState,fromState){
        delete sessionStorage.searchCon;
   	});
        	
	 var loadData = function() {
    	//价格
    	var options = {
	        data: $scope.itemsType,
	        module: 'FM_SHOP_PRODUCT_LIST',
	        params:{product_search:$scope.txt},
	        current_page: $scope.page,
            page_size: 10
    	};
        getInterface.jsonp(options, function (results) {
            if(results.status == 'Y'){
                $scope.items = results.results;
//              if($scope.items.length == 0){
//              	$scope.listdata = true;
//              }else if($scope.items.length > 0){
//              	$scope.listdata = false;
//              }
                /*判断隐藏上拉刷新*/
                if (results.results.length < 10) {
                    $scope.canLoadMore = false;
                    $scope.isShowLoadMore = false;
                } else {
                    $scope.canLoadMore = true;
                    $scope.isShowLoadMore = true;
                }
                /*设置isNoData值,用于判断是否显示无数据视图*/
                $scope.items.length == 0 ? $scope.listdata = true : $scope.listdata = false;
                setTimeout(function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, 1000);
            }else {
                $scope.listdata = true;
                $scope.canLoadMore = false;
                Xalert.loading(results.error_msg, 1000);
                return false;
            }
        });
   } 
	loadData();
	
	//上拉加载
    $scope.loadMoreGoodsList = function () {
        $scope.isShowLoadMore = true;
        $timeout(function () {
            $scope.page = $scope.page + 1;
            loadData();
        }, 1000);
    };
    //下拉刷新
    $scope.doRefresh = function () {
        $scope.page = 1;
        $scope.canLoadMore = true;//合起来不显示点点点
        $scope.isShowLoadMore = false;//合起来不显示点点点
        $timeout(function () {
            $scope.items = [];
            loadData();
            $scope.$broadcast('scroll.refreshComplete');
        }, 500);
    };
	
	$scope.search = function(event){
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if(e.keyCode == 13){
			if($scope.searchText.text == ''){
				Xalert.loading('亲，请输入要搜索的内容');
				return false;
			}else{
				loadData();
			}
			
		}
	}
	//商品收藏
    $scope.goodsCollection = function(item){
		sourseChange.collection(item.product_id,function(results){
			if(results.status == 'Y'){
				if(item.iscollection == 'N'){
	        		item.iscollection ='Y' ;
	        		return;
	        	}else{
	        		Xalert.loading('亲，您已经收藏');
	        		return;
	        	}
			}
		});
    };
    //商品取消收藏
   $scope.goodsCollectionDel = function(item){
	    sourseChange.uncollection(item.product_id,function(results){
			if(results.status == 'Y'){
				if(item.iscollection == 'Y'){
	        		item.iscollection ='N' ;
	        		return;
	        	}else{
	        		Xalert.loading('亲，您已经收藏');
	        		return;
	        	}
			}
		});
    };
    //跳转商品详情
    $scope.goGoodsDetail = function (id) {
//      localStorage.setItem('historyPageNum','1');
        $state.go('mall-detail', {id: id, timestamp: String(Date.parse(new Date()))});
    }
});