'use strict';

/*评价*/
app.controller('assessCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $timeout, getInterface, Xalert, Authentication, $window, $state) {
    $scope.product_id = $stateParams.id;
    var options = {};
    $scope.sortid = 0;
    $scope.evalType = '';
    var loaEvaldData;
    //评价选项
    $scope.categoryOrder = function (sortidtype) {

        switch (sortidtype) {
            case 0:
                $scope.evalType = '';
                break;
            case 1:
                $scope.evalType = 1;
                break;
            case 2:
                $scope.evalType = 0;
                break;
            case 3:
                $scope.evalType = -1;
                break;

        }
        $ionicScrollDelegate.scrollTop();
        $scope.sortid = sortidtype;
        $scope.page = 1;
        $scope.evalList = [];
        $scope.listdata1 = false;
        loaEvaldData = function () {
            var options = {
                page: $scope.page,
                canLoadMore: false,
                module: 'FM_SHOP_COMMENT_LIST',
                params: {
                    product_id: $scope.product_id,
                    commscore: $scope.evalType,
                    current_page: $scope.page,
                    page_size: 10
                }
            };
            getInterface.jsonp(options, function (results, params) {

                if (results.status == 'Y') {
                    angular.forEach(results.results.comment_list, function (rows, index, array) {
                        $scope.evalList.push(rows);
                    });
                    $scope.canLoadMoreGoodsList = true;
                    $scope.page++;
                    if (!results.page || results.page >= results.pagecount) {
                        $scope.canLoadMoreGoodsList = false;
                    }
                    $scope.evaAll = results.results.allnum; //全部数量
                    $scope.evaUpper = results.results.goodnum; //好评数量
                    $scope.evaMiddle = results.results.moderatenum; //中评数量
                    $scope.evaDown = results.results.negativenum; //差评数量
                    //				$scope.evaImg = results.results.imgnum; //图片数量
                    if ($scope.evalList.length == 0) {
                        $scope.listdata = true;
                    } else if ($scope.evalList.length > 0) {
                        $scope.listdata = false;
                    }
                    //	            $rootScope.evalAll = results.results;
                    //	            $scope.page = results.page;
                    //	            $scope.evalList = params.data[5];
                    //
                } else {
                    Xalert.loading(results.error_msg, 2000);
                }

            });
        }
        loaEvaldData();
    }
    $scope.categoryOrder($scope.sortid);
    //	//评价晒图
    //	var loadData;
    //	$scope.imgShow = function() {
    //		$ionicScrollDelegate.scrollTop();
    //		$scope.listdata = false;
    //		$scope.sortid = 4;
    //		$scope.page = 1;
    //		$scope.imgList = [];
    //		loadData = function() {
    //			var options = {
    //				page: $scope.page,
    //				data: $scope.imgList,
    //				canLoadMore: false,
    //				module: 'FM_SHOP_PRODUCT_PIC',
    //				params: {
    //					current_page: $scope.page,
    //					page_size: 10,
    //					product_id: $scope.product_id
    //				}
    //			};
    //			getInterface.jsonp(options, function(results, params) {
    //				$scope.page = params.page;
    //				$scope.imgList = params.data;
    //				//	        	alert($scope.imgList.length);
    //				//	        	$scope.imgList = results.results;
    //				if($scope.imgList.length == 0) {
    //					$scope.listdata1 = true;
    //				} else if($scope.imgList.length > 0) {
    //					$scope.listdata1 = false;
    //				}
    //				$scope.counts = results.counts;
    //				$scope.canLoadMoreGoodsList = params.canLoadMore;
    //			});
    //		}
    //		loadData();
    //		//    		晒图上拉加载
    //		$scope.loadMoreGoodsList1 = function() {
    //			setTimeout(function() {
    //				$scope.canLoadMoreGoodsList = false;
    //				loadData();
    //				setTimeout(function() {
    //					$scope.$broadcast('scroll.infiniteScrollComplete');
    //				}, 1000);
    //			}, 1000);
    //		};
    //	}
    //	评价列表上拉加载
    $scope.loadMoreGoodsList = function () {
        setTimeout(function () {
            $scope.canLoadMoreGoodsList = false;
            if ($scope.sortid == 4) {
                //	        	alert('晒图');
                loadData();
            } else {
                //	        	alert('sss');
                loaEvaldData();
            }
            setTimeout(function () {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, 1000);
        }, 1000);
    };
    // 	评价下拉刷新
    $scope.doRefresh = function () {
        $scope.page = 1;
        $timeout(function () {
            if ($scope.sortid == 4) {
                $scope.imgList = []; //晒图
                loadData();
            } else {
                $scope.evalList = []; //评价列表
                loaEvaldData();
            }
            //			$scope.categoryOrder($scope.sortid);//解决下拉刷新，数据加载2次
            $scope.$broadcast('scroll.refreshComplete');
        }, 500);
    };

    //获取大图数组
    $scope.getLargePicArray = function (list) {
        var picArray = [];
        if (list) {
            angular.forEach(list, function (value, key) {
                picArray.push(value.cimg_large);
            });
        }
        return picArray;
    }
    
    //返回上一页
    $scope.goBackList = function () {
        window.history.go(-1); //返回商品列表
    }

});